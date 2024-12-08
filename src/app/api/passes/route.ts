import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/utils/firebase';
import { doc, setDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { paymentIntentId, storeId, phoneNumber, quantity } = await req.json();
    
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
    
    // Create a single pass document with all fields
    await setDoc(doc(db, 'passes', passId), {
      passId,
      storeId,
      paymentIntentId,
      phoneNumber,
      quantity,
      active: true,
      createdAt: now,
      expiresAt: expiresAt,
      used: false
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