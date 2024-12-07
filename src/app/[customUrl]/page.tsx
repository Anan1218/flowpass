'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import QRScanner from '@/components/scanner/QRScanner';
import ScanResult from '@/components/scanner/ScanResult';

export default function ScanPage() {
  const params = useParams();
  const [scanResult, setScanResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  const handleScan = async (data: string | null) => {
    if (data) {
      // Here we'll add the validation logic later
      setScanResult({
        isValid: true,
        message: 'Valid QR Code scanned!',
      });
    }
  };

  const handleError = (error: Error) => {
    console.error(error);
    setScanResult({
      isValid: false,
      message: 'Error scanning QR code. Please try again.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">
        Scan QR Code
      </h1>
      <QRScanner onScan={handleScan} onError={handleError} />
      {scanResult && (
        <ScanResult
          isValid={scanResult.isValid}
          message={scanResult.message}
        />
      )}
    </div>
  );
} 