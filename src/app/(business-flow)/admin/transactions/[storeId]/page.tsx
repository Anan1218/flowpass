'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, orderBy, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { useAuthContext } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Transaction {
  id: string;
  createdAt: any;
  quantity: number;
  active: boolean;
  usedAt?: any;
  phoneNumber: string;
  paymentIntentId?: string;
}

interface Store {
  name: string;
  price: number;
}

export default function TransactionsPage() {
  const { user, loading } = useAuthContext();
  const params = useParams();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadStoreAndTransactions = async () => {
      if (!user || !params.storeId) return;

      try {
        // Load store details
        const storeDoc = await getDoc(doc(db, 'stores', params.storeId as string));
        if (storeDoc.exists()) {
          setStore({
            name: storeDoc.data().name,
            price: storeDoc.data().price
          });
        }

        // Load all transactions
        const transactionsQuery = query(
          collection(db, 'passes'),
          where('storeId', '==', params.storeId),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(transactionsQuery);
        const transactionsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Transaction[];

        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoreAndTransactions();
  }, [params.storeId, user]);

  if (loading || isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link 
            href="/admin"
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">{store?.name} - All Transactions</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.createdAt.toDate().toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.active ? store?.price : 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.active ? 'Active' : 'Inactive'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.phoneNumber}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 