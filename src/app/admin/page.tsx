'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc, getDoc, limit } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { nanoid } from 'nanoid';
import QRCode from 'react-qr-code';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/utils/firebase';
import Link from 'next/link';

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

interface Pass {
  id: string;
  createdAt: any; // Firebase Timestamp
  quantity: number;
  storeId: string;
  passId: string;
  active: boolean;
  usedAt: any | null;
  expiresAt: any;
  paymentIntentId: string;
}

interface StoreStats {
  [key: string]: {
    dailyPasses: {
      remainingPasses: number;
      date: string;
    } | null;
    dailyProfit: number;
    recentPasses: Pass[];
  }
}

export default function AdminDashboard() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    price: 20,
    maxPasses: 25,
    image: null as File | null
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    storeId: string | null;
  }>({
    isOpen: false,
    storeId: null
  });
  const [storeStats, setStoreStats] = useState<StoreStats>({});

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
        ...doc.data()
      })) as Store[];
      
      setStores(storesData);
      
      // Load stats for each store
      storesData.forEach(store => loadStoreStats(store));
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

  const handleDeleteClick = (storeId: string) => {
    setDeleteConfirmation({
      isOpen: true,
      storeId
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.storeId) return;
    
    try {
      await deleteStore(deleteConfirmation.storeId);
      setDeleteConfirmation({ isOpen: false, storeId: null });
    } catch (err) {
      setError('Failed to delete store');
    }
  };

  // Update the function to load store statistics
  const loadStoreStats = async (store: Store) => {
    try {
      // Get today's date at 8 AM
      const now = new Date();
      const today8am = new Date(now);
      today8am.setHours(8, 0, 0, 0);
      
      // If current time is before 8 AM, use previous day's 8 AM
      if (now < today8am) {
        today8am.setDate(today8am.getDate() - 1);
      }
      
      // Get recent passes
      const passesQuery = query(
        collection(db, 'passes'),
        where('storeId', '==', store.storeId),
        where('createdAt', '>=', today8am),
        orderBy('createdAt', 'desc')
      );

      const passesSnapshot = await getDocs(passesQuery);
      
      // Calculate totals
      let totalPassesUsed = 0;
      let dailyProfit = 0;
      
      passesSnapshot.docs.forEach(doc => {
        const passData = doc.data();
        const quantity = passData.quantity || 1;
        totalPassesUsed += quantity;
        dailyProfit += quantity * store.price; // Calculate profit based on quantity
      });
      
      // Get recent passes for history
      const recentPassesQuery = query(
        collection(db, 'passes'),
        where('storeId', '==', store.storeId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const recentPassesSnapshot = await getDocs(recentPassesQuery);

      setStoreStats(prev => ({
        ...prev,
        [store.storeId]: {
          dailyPasses: {
            remainingPasses: store.maxPasses - totalPassesUsed,
            date: today8am.toISOString()
          },
          dailyProfit: dailyProfit,
          recentPasses: recentPassesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Pass[]
        }
      }));

    } catch (error) {
      console.error('Error loading store stats:', error);
    }
  };

  // Update the useEffect to pass the entire store object
  useEffect(() => {
    if (stores.length > 0) {
      stores.forEach(store => loadStoreStats(store));
      
      // Refresh every minute
      const interval = setInterval(() => {
        stores.forEach(store => loadStoreStats(store));
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [stores]);

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
        <div className="space-y-6">
          {stores.map((store) => (
            <div key={store.storeId} className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Store Info Section */}
                  <div className="md:w-1/3">
                    {/* Store Header Image */}
                    {store.imageUrl && (
                      <div className="mb-4 w-full h-48 rounded-lg overflow-hidden">
                        <img 
                          src={store.imageUrl} 
                          alt={store.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Store Info */}
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-xl text-gray-900">{store.name}</h3>
                      <p className="text-sm text-gray-900 mt-1">
                        ${store.price} per pass • {store.maxPasses} passes/night
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        Created {new Date(store.createdAt.toDate()).toLocaleDateString()}
                      </p>
                    </div>

                    {/* QR Code */}
                    <div className="flex items-center justify-center py-2">
                      <div className="w-32">
                        <QRCode
                          value={store.storeUrl}
                          style={{ width: '100%', height: 'auto' }}
                        />
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-900 break-all text-center mt-2">
                      {store.storeUrl}
                    </p>
                  </div>

                  {/* Stats Section */}
                  <div className="md:w-2/3">
                    {/* Stats Grid - First Row */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {/* Daily Passes Status */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-black text-sm mb-2">Today's Passes</h4>
                        {storeStats[store.storeId]?.dailyPasses ? (
                          <p className="text-center text-2xl font-bold text-black">
                            {storeStats[store.storeId].dailyPasses.remainingPasses} / {store.maxPasses} remaining
                          </p>
                        ) : (
                          <p className="text-center text-black">
                            <span className="text-2xl font-bold">{store.maxPasses} / {store.maxPasses} remaining</span>
                            <span className="block text-sm mt-1">No passes used today</span>
                          </p>
                        )}
                      </div>

                      {/* Daily Profit */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-black text-sm mb-2">Today's Profit</h4>
                        <p className="text-center">
                          <span className="text-2xl font-bold text-green-600">
                            ${storeStats[store.storeId]?.dailyProfit?.toFixed(2) || '0.00'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Recent Passes with View All button */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-black text-sm">Recent Passes</h4>
                        <Link 
                          href={`/admin/transactions/${store.storeId}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View All Transactions →
                        </Link>
                      </div>
                      {storeStats[store.storeId]?.recentPasses?.length > 0 ? (
                        <div className="space-y-2">
                          {storeStats[store.storeId].recentPasses.map((pass) => (
                            <div key={pass.id} className="text-sm p-3 bg-gray-50 rounded flex flex-col">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-black">
                                  {pass.quantity} {pass.quantity === 1 ? 'pass' : 'passes'}
                                </span>
                                <span className="text-sm text-black">
                                  {new Date(pass.createdAt.toDate()).toLocaleString()}
                                </span>
                              </div>
                              <div className="text-sm text-black mt-1">
                                Status: {pass.active ? 'Active' : 'Used'}
                                {pass.usedAt && ` at ${new Date(pass.usedAt.toDate()).toLocaleString()}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-4 text-sm text-black bg-gray-50 rounded">
                          No recent passes
                        </p>
                      )}
                    </div>

                    {/* Delete Button */}
                    <div className="mt-4">
                      <button
                        onClick={() => handleDeleteClick(store.id)}
                        className="w-full px-4 py-2.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Delete Store
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete this store? This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirmation({ isOpen: false, storeId: null })}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn btn-primary bg-red-500 hover:bg-red-600"
              >
                Delete Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 