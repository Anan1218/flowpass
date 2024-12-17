import type { Metadata } from "next";
import "./globals.css";
import { AuthContextProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: "ScanPass",
  description: "QR Code Validation System",
  icons: {
    icon: '/scanpasslogo.png',
    apple: '/scanpasslogo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}
