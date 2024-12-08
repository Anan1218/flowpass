import { Metadata } from 'next';
import PaymentForm from '@/components/payment/PaymentForm';

export const metadata: Metadata = {
  title: 'FlowPass - Purchase',
  description: 'FlowPass - QR Code Validation System',
};

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8">
        Welcome to FlowPass
      </h1>
      {/* <PaymentForm /> */}
      <p>This is the landing page. We will ask people to either search for a store or scan a QR code.</p>
      <p>We will also ask business owners to create a store and add passes to sell.</p>
    </div>
  );
}
