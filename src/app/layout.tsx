import type { Metadata } from "next";
import "./globals.css";
import { AuthContextProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar/Navbar';

export const metadata: Metadata = {
  title: "ScanPass",
  description: "QR Code Validation System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthContextProvider>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </AuthContextProvider>
      </body>
    </html>
  );
}
