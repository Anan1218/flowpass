import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/utils/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { paymentIntentId, storeId } = await req.json();
    
    // Verify the payment intent is successful
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not successful' },
        { status: 400 }
      );
    }

    const passId = paymentIntent.metadata.passId;
    
    // Calculate expiration time (8 AM next day)
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 1);
    expiresAt.setHours(8, 0, 0, 0);
    
    await setDoc(doc(db, 'passes', passId), {
      passId,
      storeId,
      paymentIntentId,
      active: true,
      quantity: 1,
      createdAt: now,
      expiresAt: expiresAt,
    });

    return NextResponse.json({ passId });
  } catch (error) {
    console.error('Pass creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create pass' },
      { status: 500 }
    );
  }
} 