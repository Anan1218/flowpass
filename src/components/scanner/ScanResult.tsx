import React from 'react';

interface ScanResultProps {
  isValid: boolean;
  message: string;
}

export default function ScanResult({ isValid, message }: ScanResultProps) {
  return (
    <div className={`mt-8 p-4 rounded-lg text-center ${
      isValid 
        ? 'bg-green-50 border-2 border-green-500' 
        : 'bg-red-50 border-2 border-red-500'
    }`}>
      <div className={`text-xl font-bold mb-2 ${
        isValid ? 'text-green-700' : 'text-red-700'
      }`}>
        {isValid ? '✓ Verified' : '✗ Invalid'}
      </div>
      <p className={isValid ? 'text-green-600' : 'text-red-600'}>
        {message}
      </p>
    </div>
  );
} 