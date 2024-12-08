'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/utils/firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import PaymentForm from '@/components/payment/PaymentForm';

interface StoreData {
  name: string;
  userId: string;
  createdAt: Date;
  active: boolean;
  imageUrl: string;
  price: number;
  maxPasses: number;
  // Add any other fields you need
}

interface DailyPassesData {
  date: string;
  totalPasses: number;
  remainingPasses: number;
}

export default function StorefrontPage() {
  const params = useParams();
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [availablePasses, setAvailablePasses] = useState(0);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        // 1. Fetch store data
        const storeQuery = query(
          collection(db, 'stores'),
          where('storeId', '==', params.storeId),
          where('active', '==', true)
        );

        const storeSnapshot = await getDocs(storeQuery);

        if (!storeSnapshot.empty) {
          const data = storeSnapshot.docs[0].data();
          setStoreData({
            name: data.name,
            userId: data.userId,
            createdAt: data.createdAt.toDate(),
            active: data.active,
            imageUrl: data.imageUrl,
            price: data.price,
            maxPasses: data.maxPasses
          });

          // 2. Get or create today's passes document
          const today = new Date().toISOString().split('T')[0];
          const dailyPassesRef = doc(db, 'stores', storeSnapshot.docs[0].id, 'dailyPasses', today);
          const dailyPassesDoc = await getDoc(dailyPassesRef);

          if (!dailyPassesDoc.exists()) {
            // Create new daily passes document if it doesn't exist
            await setDoc(dailyPassesRef, {
              date: today,
              totalPasses: data.maxPasses,
              remainingPasses: data.maxPasses
            });
            setAvailablePasses(data.maxPasses);
          } else {
            // Use existing daily passes count
            setAvailablePasses(dailyPassesDoc.data().remainingPasses);
          }
        } else {
          setError('Store not found or inactive');
        }
      } catch (err) {
        setError('Error loading store data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.storeId) {
      fetchStoreData();
    }
  }, [params.storeId]);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= availablePasses) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!storeData || availablePasses <= 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 text-yellow-700">
          No passes available for today
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="mb-6">
        <img 
          src={storeData.imageUrl || '/default-store-image.jpg'} 
          alt={storeData.name} 
          className="w-full h-48 object-cover rounded-lg"
        />
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Only {availablePasses} left at</h2>
        <div className="text-4xl font-bold text-green-500 my-2">${storeData.price}</div>
        <p className="text-gray-600 text-sm flex items-center justify-center gap-2">
          <span className="text-yellow-500">⚡</span>
          {storeData.maxPasses} passes available daily
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-center text-xl mb-4">Select Quantity</h3>
        <p className="text-center text-gray-600 mb-4">How many Fast Passes would you like?</p>
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-2xl disabled:opacity-50"
          >
            -
          </button>
          <span className="text-3xl font-bold">{quantity}</span>
          <button 
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= availablePasses}
            className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-2xl disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg">
        <PaymentForm 
          storeId={params.storeId as string} 
          quantity={quantity}
          price={storeData.price}
        />
      </div>
    </div>
  );
} 