'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { nanoid } from 'nanoid';
import QRCode from 'react-qr-code';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/utils/firebase';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

interface Store {
  id: string;
  storeId: string;
  userId: string;
  name: string;
  storeUrl: string;
  createdAt: any; // Firebase Timestamp
  active: boolean;
  imageUrl: string;
  price: number;
  maxPasses: number;
}

export default function AdminDashboard() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [newQRCode, setNewQRCode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    price: 20,
    maxPasses: 25,
    image: null as File | null
  });

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

  // Function to handle image upload
  const uploadImage = async (file: File) => {
    const storageRef = ref(storage, `store-headers/${nanoid()}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  // Updated function to generate new store QR code
  const generateStoreQRCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to generate QR codes');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const storeId = nanoid();
      const storeUrl = `${BASE_URL}/store/${storeId}`;
      
      // Upload image if provided
      let imageUrl = '';
      if (newStore.image) {
        imageUrl = await uploadImage(newStore.image);
      }
      
      await addDoc(collection(db, 'stores'), {
        storeId: storeId,
        userId: user.uid,
        createdAt: new Date(),
        active: true,
        name: newStore.name || 'My Store',
        storeUrl: storeUrl,
        imageUrl: imageUrl,
        price: Number(newStore.price),
        maxPasses: Number(newStore.maxPasses)
      });

      setNewQRCode(storeUrl);
      await loadStores();
      setIsModalOpen(false);
      setNewStore({
        name: '',
        price: 20,
        maxPasses: 25,
        image: null
      });
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

  const validateImage = (file: File) => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Please upload a JPG, PNG, or WebP image');
    }

    if (file.size > MAX_SIZE) {
      throw new Error('Image must be less than 5MB');
    }

    return true;
  };

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
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          Create New Store
        </button>
      </div>

      {/* New Store Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create New Store</h2>
            <form onSubmit={generateStoreQRCode}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Store Name</label>
                  <input
                    type="text"
                    value={newStore.name}
                    onChange={(e) => setNewStore(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Header Image</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          validateImage(file);
                          setNewStore(prev => ({ ...prev, image: file }));
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Invalid image');
                        }
                      }
                    }}
                    className="mt-1 block w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price per Pass ($)</label>
                  <input
                    type="number"
                    value={newStore.price}
                    onChange={(e) => setNewStore(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Passes per Night</label>
                  <input
                    type="number"
                    value={newStore.maxPasses}
                    onChange={(e) => setNewStore(prev => ({ ...prev, maxPasses: Number(e.target.value) }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    min="1"
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="btn btn-primary"
                  >
                    {isGenerating ? 'Creating...' : 'Create Store'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold mb-4">Your Stores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div key={store.id} className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 flex flex-col">
                {/* Store Header Image */}
                {store.imageUrl && (
                  <div className="mb-4 w-full h-32 rounded-lg overflow-hidden">
                    <img 
                      src={store.imageUrl} 
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Store Info */}
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg text-gray-800">{store.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    ${store.price} per pass • {store.maxPasses} passes/night
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Created {new Date(store.createdAt.toDate()).toLocaleDateString()}
                  </p>
                </div>

                {/* QR Code */}
                <div className="flex-grow flex items-center justify-center py-2">
                  <div className="w-[60%]">
                    <QRCode
                      value={store.storeUrl}
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </div>
                </div>

                {/* Store URL and Actions */}
                <div className="mt-4 flex flex-col gap-2">
                  <p className="text-xs text-gray-600 break-all text-center">
                    {store.storeUrl}
                  </p>
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