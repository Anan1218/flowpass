'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface OrderData {
  passId: string;
  quantity: number;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      const passQuery = query(
        collection(db, 'passes'),
        where('passId', '==', params.orderId)
      );

      const passSnapshot = await getDocs(passQuery);
      if (!passSnapshot.empty) {
        const data = passSnapshot.docs[0].data();
        setOrderData({
          passId: data.passId,
          quantity: data.quantity || 1,
        });
      }
    };

    if (params.orderId) {
      fetchOrderData();
    }
  }, [params.orderId]);

  const handleScanNow = () => {
    if (orderData?.passId) {
      router.push(`/pass/${orderData.passId}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-8">Order Confirmation</h1>
      <p className="mb-6">You are almost in! Please show this screen to the person at the door.</p>
      
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-2">Valid For:</h2>
        <div className="text-6xl font-bold text-green-500 mb-2">
          {orderData?.quantity || 1}
        </div>
        <div className="text-xl">Guest{(orderData?.quantity || 1) > 1 ? 's' : ''}</div>
      </div>

      <p className="text-sm text-gray-600 mb-8">
        Your pass will remain valid until it is scanned. If you exit this screen, 
        you can retrieve your passes via the text message you were sent.
      </p>

      <button
        onClick={handleScanNow}
        className="w-full py-4 bg-green-500 text-white text-lg font-medium rounded-lg hover:bg-green-600 transition-colors"
      >
        Scan Now
      </button>
    </div>
  );
}
