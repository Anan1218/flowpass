'use client';

import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuthContext();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-800">
              ScanPass
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/admin" className="btn btn-secondary">
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="btn btn-primary"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/signin" className="btn btn-primary">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 