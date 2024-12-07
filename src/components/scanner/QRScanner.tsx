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

  useEffect(() => {
    // Check for camera permissions
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));
  }, []);

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
          delay={300}
          onError={onError}
          onScan={onScan}
          style={{ width: '100%' }}
        />
        <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none" />
      </div>
    </div>
  );
} 