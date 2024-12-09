import Navbar from '@/components/Navbar/Navbar';
import { AuthContextProvider } from '@/contexts/AuthContext';

export default function Home() {
  return (
    <AuthContextProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8">
              Welcome to ScanPass
            </h1>
            <p className="text-center mb-4">
              The easiest way to manage and validate passes for your business.
            </p>
            {/* Add more landing page content here */}
          </div>
        </main>
      </div>
    </AuthContextProvider>
  );
}
