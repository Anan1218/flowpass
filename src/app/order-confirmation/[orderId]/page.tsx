'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@utils/firebase';

interface OrderData {
  passId: string;
  quantity: number;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [passId, setPassId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPassData = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const quantity = parseInt(searchParams.get('quantity') || '1', 10);
      
      try {
        const passDoc = await getDoc(doc(db, 'passes', params.orderId as string));
        if (passDoc.exists()) {
          const passData = passDoc.data();
          setPassId(passData.passId);
          setOrderData({
            passId: passData.passId,
            quantity: quantity
          });
        }
      } catch (error) {
        console.error('Error fetching pass:', error);
      }
    };

    if (params.orderId) {
      fetchPassData();
    }
  }, [params.orderId]);

  const handleScanNow = () => {
    if (passId) {
      router.push(`/pass/${passId}`);
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
