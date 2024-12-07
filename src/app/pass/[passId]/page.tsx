'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import ScanResult from '@/components/scanner/ScanResult';
import QRScanner from '@/components/scanner/QRScanner';

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
  const [hasScanned, setHasScanned] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    const validatePass = async () => {
      try {
        const passQuery = query(
          collection(db, 'passes'),
          where('passId', '==', params.passId),
          where('active', '==', true)
        );

        const passSnapshot = await getDocs(passQuery);

        if (!passSnapshot.empty) {
          const data = passSnapshot.docs[0].data();
          const now = new Date();
          const expiresAt = data.expiresAt.toDate();
          
          const storeQuery = query(
            collection(db, 'stores'),
            where('storeId', '==', data.storeId),
            where('active', '==', true)
          );

          const storeSnapshot = await getDocs(storeQuery);
          const isStoreValid = !storeSnapshot.empty;
          
          setPassData({
            active: data.active && isStoreValid,
            userId: data.userId,
            storeId: data.storeId,
            createdAt: data.createdAt.toDate(),
            expiresAt: expiresAt
          });

          const isValid = now < expiresAt && data.active && isStoreValid;
          return {
            isValid,
            message: isValid 
              ? 'Pass is valid' 
              : !isStoreValid 
                ? 'Invalid store'
                : 'Pass has expired'
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

  const handleScan = (scannedData: string | null) => {
    if (!scannedData) return;
    
    try {
      console.log('Scanned Data:', scannedData);
      
      // Extract storeId from the URL
      const scannedStoreId = scannedData.split('/store/')[1];
      console.log('Extracted Store ID:', scannedStoreId);
      console.log('Expected Store ID:', passData?.storeId);
      
      // Verify that the scanned QR code matches the expected store
      if (passData && scannedStoreId === passData.storeId) {
        setHasScanned(true);
        setScanError(null);
      } else {
        setScanError('Invalid QR code for this pass');
      }
    } catch (err) {
      console.error('Scan Error:', err);
      setScanError('Error processing QR code');
    }
  };

  const handleError = (err: Error) => {
    setScanError(err.message);
  };

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
      
      {!hasScanned ? (
        <div>
          <p className="mb-4">Please scan the store's QR code to validate your pass</p>
          <QRScanner onScan={handleScan} onError={handleError} />
          {scanError && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded">
              {scanError}
            </div>
          )}
        </div>
      ) : (
        <ScanResult
          isValid={!!passData?.active && new Date() < passData.expiresAt}
          message={
            !passData 
              ? 'Pass not found'
              : !passData.active 
                ? 'Invalid store or pass'
                : new Date() < passData.expiresAt 
                  ? 'Pass is valid' 
                  : 'Pass has expired'
          }
        />
      )}
    </div>
  );
} 