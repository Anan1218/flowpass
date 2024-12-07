'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { nanoid } from 'nanoid';
import QRCode from 'react-qr-code';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

interface Store {
  id: string;
  storeId: string;
  userId: string;
  name: string;
  storeUrl: string;
  createdAt: any; // Firebase Timestamp
  active: boolean;
}

export default function AdminDashboard() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [newQRCode, setNewQRCode] = useState<string | null>(null);

  // Function to load existing stores
  const loadStores = async () => {
    if (!user) return;
    
    try {
      const q = query(
        collection(db, 'stores'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const storesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Store[];
      
      setStores(storesData);
    } catch (err) {
      console.error('Error loading stores:', err);
      setError('Failed to load stores');
    }
  };

  // Function to generate new store QR code
  const generateStoreQRCode = async () => {
    if (!user) {
      setError('You must be logged in to generate QR codes');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const storeId = nanoid();
      const storeUrl = `${BASE_URL}/store/${storeId}`;
      
      await addDoc(collection(db, 'stores'), {
        storeId: storeId,
        userId: user.uid,
        createdAt: new Date(),
        active: true,
        name: 'My Store', // You might want to make this configurable
        storeUrl: storeUrl
      });

      setNewQRCode(storeUrl);
      await loadStores();
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to generate store QR code: ${err.message}`);
      } else {
        setError('Failed to generate store QR code');
      }
      console.error('Generate store QR code error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to delete a store
  const deleteStore = async (storeId: string) => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, 'stores', storeId));
      await loadStores(); // Reload the stores after deletion
    } catch (err) {
      console.error('Error deleting store:', err);
      setError('Failed to delete store');
    }
  };

  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  // Load stores on mount
  useEffect(() => {
    if (user) {
      loadStores();
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 mb-4">
          {error}
        </div>
      )}

      <div className="mb-8">
        <button
          onClick={generateStoreQRCode}
          disabled={isGenerating}
          className="btn btn-primary"
        >
          {isGenerating ? 'Generating...' : 'Generate Store QR Code'}
        </button>
      </div>

      {newQRCode && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">New QR Code Generated:</h2>
          <div className="max-w-sm aspect-square border rounded-lg bg-white shadow-sm">
            <div className="h-full p-4 flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-3/4 aspect-square">
                  <QRCode
                    value={newQRCode}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600 text-center">
                <p className="text-xs break-all">{newQRCode}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold mb-4">Your Stores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div key={store.id} className="aspect-square border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="h-full p-4 flex flex-col justify-between">
                <div className="flex-grow flex items-center justify-center pt-2">
                  <div className="w-[50%]">
                    <QRCode
                      value={store.storeUrl}
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="text-center">
                    <p className="font-bold text-gray-800 truncate">{store.name}</p>
                    <p className="text-xs text-gray-600 break-all line-clamp-2">{store.storeUrl}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(store.createdAt.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteStore(store.id)}
                    className="w-full px-4 py-2.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Delete Store
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 