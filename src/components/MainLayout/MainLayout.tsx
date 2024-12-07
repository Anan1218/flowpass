'use client';

import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className={`min-h-screen bg-background ${className || ''}`}>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}