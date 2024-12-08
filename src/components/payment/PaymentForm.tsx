'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  storeId: string;
  quantity: number;
  price: number;
  phoneNumber: string;
  disabled: boolean;
  onSuccess?: () => void;
}

// Wrapper component to provide Stripe context
const PaymentForm = ({ storeId, quantity, price, phoneNumber, disabled, onSuccess }: PaymentFormProps) => {
  const [clientSecret, setClientSecret] = useState<string>();

  // Only fetch payment intent if phone number is valid
  useEffect(() => {
    const fetchPaymentIntent = async () => {
      if (disabled) return; // Don't fetch if phone number is invalid

      try {
        const response = await fetch('/api/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            storeId,
            quantity,
            amount: price * quantity 
          }),
        });
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error fetching payment intent:', error);
      }
    };

    fetchPaymentIntent();
  }, [storeId, quantity, price, disabled]);

  if (disabled) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow">
        <div className="text-center text-gray-600">
          Please enter a valid phone number to proceed with payment
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return <div>Loading...</div>;
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0066cc',
          },
        },
      }}
    >
      <CheckoutForm 
        storeId={storeId} 
        quantity={quantity} 
        phoneNumber={phoneNumber}
        disabled={disabled}
        onSuccess={onSuccess}
      />
    </Elements>
  );
};

// Internal checkout form component
const CheckoutForm = ({ 
  storeId, 
  quantity, 
  phoneNumber,
  disabled,
  onSuccess 
}: { 
  storeId: string; 
  quantity: number;
  phoneNumber: string;
  disabled: boolean;
  onSuccess?: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || disabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (result.error) {
        setError(result.error.message ?? 'An error occurred');
        setLoading(false);
        return;
      }

      if (result.paymentIntent?.status === 'succeeded') {
        const response = await fetch(`/api/stripe?paymentIntentId=${result.paymentIntent.id}`, {
          method: 'GET'
        });
        
        const data = await response.json();
        if (data.passId) {
          // Include phone number in the passes API call
          const passResponse = await fetch('/api/passes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              paymentIntentId: result.paymentIntent.id,
              storeId,
              phoneNumber // Add phone number to the request
            }),
          });
          
          const passData = await passResponse.json();
          if (passData.passId) {
            onSuccess?.(); // Call onSuccess callback if provided
            router.push(`/order-confirmation/${passData.passId}`);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <form onSubmit={handleSubmit} className="space-y-6">
        <PaymentElement 
          options={{
            fields: {
              billingDetails: 'auto'
            },
            wallets: {
              applePay: 'auto',
              googlePay: 'auto'
            }
          }}
        />
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading && (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          Pay with Stripe
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
