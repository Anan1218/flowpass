import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import QR Reader to avoid SSR issues
const QrReader = dynamic(() => import('react-qr-reader-es6'), {
  ssr: false,
});

interface QRScannerProps {
  onScan: (data: string | null) => void;
  onError: (error: Error) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [lastScan, setLastScan] = useState<number>(0);

  useEffect(() => {
    // Check for camera permissions
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));
  }, []);

  const handleScan = (data: string | null) => {
    // Debounce scans by ignoring readings within 2 seconds of the last successful scan
    const now = Date.now();
    if (data && now - lastScan > 2000) {
      setLastScan(now);
      onScan(data);
    }
  };

  if (hasPermission === null) {
    return <div>Requesting camera permission...</div>;
  }

  if (hasPermission === false) {
    return <div>No access to camera</div>;
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="relative aspect-square">
        <QrReader
          delay={500}
          onError={onError}
          onScan={handleScan}
          style={{ width: '100%' }}
        />
        <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none" />
      </div>
    </div>
  );
} 