'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import QRCode from 'react-qr-code';
import { nanoid } from 'nanoid';
import { db } from '@/utils/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

interface QRCodeData {
  id: string;
  code: string;
  createdAt: Date;
}

export default function AdminDashboard() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [newQRCode, setNewQRCode] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
    } else {
      loadQRCodes();
    }
  }, [user, router]);

  const loadQRCodes = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'qrcodes'),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const codes: QRCodeData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        codes.push({
          id: doc.id,
          code: data.code,
          createdAt: data.createdAt.toDate(),
        });
      });

      setQrCodes(codes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      setError('');
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to load QR codes: ${err.message}`);
      } else {
        setError('Failed to load QR codes');
      }
      console.error('Load QR codes error:', err);
    }
  };

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const generateStoreQRCode = async () => {
    if (!user) return;

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
        name: 'My Store',
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

  const deleteQRCode = async (qrCodeId: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'qrcodes', qrCodeId));
      await loadQRCodes(); // Reload the list after deletion
      setError('');
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to delete QR code: ${err.message}`);
      } else {
        setError('Failed to delete QR code');
      }
      console.error('Delete QR code error:', err);
    }
  };

  useEffect(() => {
    console.log('newQRCode state updated:', newQRCode);
  }, [newQRCode]);

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <button 
              onClick={generateStoreQRCode}
              disabled={isGenerating}
              className="w-full btn btn-primary"
            >
              {isGenerating ? 'Generating...' : 'Generate Store QR Code'}
            </button>

            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}

            {console.log('Rendering newQRCode section:', newQRCode)}
            {newQRCode && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">New QR Code</h3>
                <div className="bg-white p-4 rounded-lg border">
                  <QRCode
                    value={newQRCode}
                    size={200}
                    className="w-full h-auto"
                  />
                  <p className="mt-2 text-sm text-gray-600 text-center">
                    Generated: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Account Info</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">User ID:</span> {user.uid}</p>
          </div>
        </div>

        {/* Updated QR Codes Display with Delete Button */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your QR Codes</h2>
          {qrCodes.length === 0 ? (
            <p className="text-gray-500">No QR codes generated yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {qrCodes.map((qrCode) => (
                <div key={qrCode.id} className="border rounded-lg p-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    {qrCode.storefrontUrl ? (
                      <QRCode
                        value={qrCode.storefrontUrl}
                        size={200}
                        className="w-full h-auto"
                      />
                    ) : (
                      <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-100 text-gray-400">
                        Invalid QR Code
                      </div>
                    )}
                    <div className="mt-2 text-sm text-gray-600 text-center">
                      <p className="break-all">{qrCode.storefrontUrl || 'No URL available'}</p>
                    </div>
                    <button
                      onClick={() => deleteQRCode(qrCode.id)}
                      className="mt-2 w-full btn bg-red-500 hover:bg-red-600 text-white text-sm py-1"
                    >
                      Delete QR Code
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {error && (
            <div className="mt-4 text-red-500">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 