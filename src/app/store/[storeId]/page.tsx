'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import PaymentForm from '@/components/payment/PaymentForm';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

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

export default function StorefrontPage() {
  const params = useParams();
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [availablePasses, setAvailablePasses] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isValidPhone, setIsValidPhone] = useState(false);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        // Get store data
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

          // Get today's date at 8 AM
          const now = new Date();
          const today8am = new Date(now);
          today8am.setHours(8, 0, 0, 0);
          
          // If current time is before 8 AM, use previous day's 8 AM
          if (now < today8am) {
            today8am.setDate(today8am.getDate() - 1);
          }

          // Get passes since last 8 AM
          const passesQuery = query(
            collection(db, 'passes'),
            where('storeId', '==', params.storeId),
            where('createdAt', '>=', today8am)
          );

          const passesSnapshot = await getDocs(passesQuery);
          
          let totalPassesSold = 0;
          passesSnapshot.docs.forEach(doc => {
            const passData = doc.data();
            const quantity = passData.quantity || 1;
            totalPassesSold += quantity;
          });
          // const totalPassesSold = 5;
          setAvailablePasses(data.maxPasses - totalPassesSold);
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

  const updateAvailablePasses = async (passId: string) => {
    try {
      // Construct the URL for the order confirmation page
      let passUrl = `${window.location.origin}/order-confirmation/${passId}?quantity=${quantity}`;
      let smsMessage = `Thank you for purchasing ${quantity} pass${quantity > 1 ? 'es' : ''} at ${storeData?.name}. Access your pass here: ${passUrl}`;
    
      // Send SMS notification
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          message: smsMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send SMS');
      }

      // Update the available passes count
      setAvailablePasses(prev => prev - quantity);

      // Navigate to the order confirmation page
      window.location.href = `/order-confirmation/${passId}?quantity=${quantity}`;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw new Error('Failed to send notification');
    }
  };

  const handlePhoneChange = (value: string | undefined) => {
    setPhoneNumber(value || '');
    setIsValidPhone(value ? value.length >= 10 : false);
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

      <div className="mb-8">
        <h3 className="text-center text-xl mb-4">Enter Phone Number</h3>
        <PhoneInput
          international
          defaultCountry="US"
          value={phoneNumber}
          onChange={handlePhoneChange}
          className="w-full p-3 border rounded-lg"
        />
      </div>

      <div className="bg-white rounded-lg">
        <PaymentForm 
          storeId={params.storeId as string} 
          quantity={quantity}
          price={storeData.price}
          onSuccess={(passId) => updateAvailablePasses(passId)}
          phoneNumber={phoneNumber}
          disabled={!isValidPhone}
        />
      </div>
    </div>
  );
} 