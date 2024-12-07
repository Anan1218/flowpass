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
      <PaymentForm />
    </div>
  );
}
