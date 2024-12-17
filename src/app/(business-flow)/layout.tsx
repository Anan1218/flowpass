import type { Metadata } from "next";
import "../globals.css";
import { AuthContextProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';

export const metadata: Metadata = {
  title: "ScanPass",
  description: "QR Code Validation System",
  icons: {
    icon: '/scanpasslogo.png',
    apple: '/scanpasslogo.png',
  },
};

export default function BusinessFlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthContextProvider>
          <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="container mx-auto px-4 py-8 flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </AuthContextProvider>
      </body>
    </html>
  );
} 