'use client';

import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title, className }) => {
  return (
    <div className={`min-h-screen bg-background ${className || ''}`}>
      <div>
        <title>{title}</title>
      </div>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;