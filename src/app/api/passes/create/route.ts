import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/utils/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { nanoid } from 'nanoid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { paymentIntentId, storeId } = await req.json();
    
    // Verify the payment intent is successful
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return new Response(
        JSON.stringify({ error: 'Payment not successful' }),
        { status: 400 }
      );
    }

    // Create a new pass
    const passId = nanoid();
    
    await setDoc(doc(db, 'passes', passId), {
      passId,
      storeId,
      paymentIntentId,
      active: true,
      quantity: 1,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    });

    return new Response(
      JSON.stringify({ passId }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Pass creation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create pass' }),
      { status: 500 }
    );
  }
} 