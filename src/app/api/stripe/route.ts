import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { nanoid } from 'nanoid';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { storeId } = await req.json();
    
    // Fixed amount of $10.00
    const amountInCents = 1000;
    const passId = nanoid();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always'
      },
      metadata: {
        passId,
        storeId,
      }
    });

    return new Response(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
        passId
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Stripe API error:', error);
    return new Response(
      JSON.stringify({ error: 'Payment intent creation failed' }),
      { status: 500 }
    );
  }
}
