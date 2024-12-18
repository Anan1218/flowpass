'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc, limit } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { nanoid } from 'nanoid';
import QRCode from 'react-qr-code';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/utils/firebase';
import Link from 'next/link';
import Image from 'next/image';
import PassesTab from './components/tabs/PassesTab';
import AnalyticsTab from './components/tabs/AnalyticsTab';
import CalendarTab from './components/tabs/CalendarTab';
import OrdersTab from './components/tabs/OrdersTab';
import VenueInfoTab from './components/tabs/VenueInfoTab';

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
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  productType: 'LineSkip' | 'Cover' | 'Menu' | string;
  passName: string;
  serviceFee: number;
  tipAmount: number;
  totalAmount: number;
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

// Add new type for active tab
type ActiveTab = 'ANALYTICS' | 'PASSES' | 'CALENDAR' | 'ORDERS' | 'VENUE_INFO';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
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
  const [activeTab, setActiveTab] = useState<ActiveTab>('PASSES');
  const [passes, setPasses] = useState<Pass[]>([]);

  // Function to load existing stores
  const loadStores = useCallback(async () => {
    try {
      setLoading(true);
      const storesRef = collection(db, 'stores');
      const q = query(
        storesRef,
        where('userId', '==', user?.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const storesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Store[];
      
      setStores(storesData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading stores:', error);
      setError('Failed to load stores');
      setLoading(false);
    }
  }, [user?.uid]);

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
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  // Load stores on mount
  useEffect(() => {
    if (user) {
      loadStores();
    }
  }, [user, loadStores]);

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
    } catch {
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

  // Add this function to load passes
  const loadPasses = useCallback(async () => {
    if (!user) return;
    
    try {
      const passesRef = collection(db, 'passes');
      const storeIds = stores.map(store => store.storeId);
      
      const q = query(
        passesRef,
        where('storeId', 'in', storeIds)
      );
      
      const querySnapshot = await getDocs(q);
      const passesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Pass[];
      
      setPasses(passesData);
    } catch (error) {
      console.error('Error loading passes:', error);
    }
  }, [user, stores]);

  // Add this to your useEffect that loads data
  useEffect(() => {
    if (stores.length > 0) {
      loadPasses();
    }
  }, [stores, loadPasses]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Active Passes:</span>
            <span className="font-bold">{stores.reduce((acc, store) => 
              acc + (storeStats[store.storeId]?.dailyPasses?.remainingPasses || 0), 0)}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            Add Pass
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-800">
        <nav className="flex">
          {[
            { id: 'ANALYTICS', label: 'Analytics' },
            { id: 'PASSES', label: 'Passes' },
            { id: 'CALENDAR', label: 'Calendar' },
            { id: 'ORDERS', label: 'Orders' },
            { id: 'VENUE_INFO', label: 'Venue Info' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeTab === 'PASSES' && (
          <PassesTab 
            stores={stores} 
            storeStats={storeStats} 
            onDeleteClick={handleDeleteClick} 
          />
        )}
        
        {activeTab === 'ANALYTICS' && (
          <AnalyticsTab 
            stores={stores} 
            storeStats={storeStats}
          />
        )}
        
        {activeTab === 'CALENDAR' && <CalendarTab />}
        
        {activeTab === 'ORDERS' && (
          <OrdersTab 
            stores={stores}
            passes={passes}
          />
        )}
        
        {activeTab === 'VENUE_INFO' && <VenueInfoTab />}
      </div>

      {/* New Store Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Create New Store</h2>
            
            <form onSubmit={generateStoreQRCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900">Store Name</label>
                <input
                  type="text"
                  value={newStore.name}
                  onChange={(e) => setNewStore(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">Header Image</label>
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
                  className="mt-1 block w-full text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">Price per Pass ($)</label>
                <input
                  type="number"
                  value={newStore.price}
                  onChange={(e) => setNewStore(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="form-input"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">Passes per Night</label>
                <input
                  type="number"
                  value={newStore.maxPasses}
                  onChange={(e) => setNewStore(prev => ({ ...prev, maxPasses: Number(e.target.value) }))}
                  className="form-input"
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
            </form>
          </div>
        </div>
      )}

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