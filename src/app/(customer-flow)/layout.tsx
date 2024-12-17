import type { Metadata } from "next";
import "../globals.css";
import { AuthContextProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: "ScanPass",
  description: "QR Code Validation System",
  icons: {
    icon: '/scanpasslogo.png',
    apple: '/scanpasslogo.png',
  },
};

// This layout should apply to customer-flow routes only
export default function CustomerFlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthContextProvider>
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </AuthContextProvider>
      </body>
    </html>
  );
} 