'use client';

import { useState, useEffect } from 'react';
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
  onSuccess?: (passId: string) => void;
}

// Wrapper component to provide Stripe context
const PaymentForm = ({ storeId, quantity, price, phoneNumber, disabled, onSuccess }: PaymentFormProps) => {
  const [clientSecret, setClientSecret] = useState<string>();

  // Only fetch payment intent if phone number is valid
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/stripe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storeId,
            amount: price * quantity * 100, // Convert to cents and multiply by quantity
          }),
        });

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
      }
    };

    if (storeId && price && quantity) {
      createPaymentIntent();
    }
  }, [storeId, price, quantity]); // Add quantity to dependency array

  if (disabled) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow space-y-4">
        <div className="text-center text-gray-600">
          Please enter a valid phone number to proceed with payment
        </div>
        <div className="text-xs text-gray-500 text-center">
          By purchasing, you authorize ScanPass to send a text message with a link to your pass. Message/data rates apply.
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
        price={price}
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
  price,
  phoneNumber,
  disabled,
  onSuccess 
}: { 
  storeId: string; 
  quantity: number;
  price: number;
  phoneNumber: string;
  disabled: boolean;
  onSuccess?: (passId: string) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
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
        // Create the pass with all necessary data
        const passResponse = await fetch('/api/passes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            paymentIntentId: result.paymentIntent.id,
            storeId,
            phoneNumber,
            quantity
          }),
        });
        
        const passData = await passResponse.json();
        if (passData.passId) {
          onSuccess?.(passData.passId); // Only call the callback
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
            },
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
            defaultValues: {
              billingDetails: {
                email: '' // This helps prevent the Link prompt
              }
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
          {loading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            `Pay $${(price * quantity).toFixed(2)}`
          )}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
