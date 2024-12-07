'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import ScanResult from '@/components/scanner/ScanResult';

interface PassData {
  active: boolean;
  userId: string;
  storeId: string;
  createdAt: Date;
  expiresAt: Date;
}

export default function PassValidationPage() {
  const params = useParams();
  const [passData, setPassData] = useState<PassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validatePass = async () => {
      try {
        const q = query(
          collection(db, 'passes'),
          where('passId', '==', params.passId),
          where('active', '==', true)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          const now = new Date();
          const expiresAt = data.expiresAt.toDate();
          
          setPassData({
            active: data.active,
            userId: data.userId,
            storeId: data.storeId,
            createdAt: data.createdAt.toDate(),
            expiresAt: expiresAt
          });

          const isValid = now < expiresAt && data.active;
          return {
            isValid,
            message: isValid ? 'Pass is valid' : 'Pass has expired'
          };
        }
        return {
          isValid: false,
          message: 'Pass not found or inactive'
        };
      } catch (err) {
        console.error(err);
        return {
          isValid: false,
          message: 'Error validating pass'
        };
      } finally {
        setLoading(false);
      }
    };

    if (params.passId) {
      validatePass();
    }
  }, [params.passId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Pass Validation</h1>
      <ScanResult
        isValid={!!passData?.active && new Date() < passData.expiresAt}
        message={passData ? 
          new Date() < passData.expiresAt ? 'Pass is valid' : 'Pass has expired'
          : 'Pass not found'
        }
      />
    </div>
  );
} 