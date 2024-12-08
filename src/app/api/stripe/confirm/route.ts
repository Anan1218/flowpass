import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { paymentIntentId } = await req.json();
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    return new Response(
      JSON.stringify({ 
        passId: paymentIntent.metadata.passId 
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Stripe confirmation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to confirm payment' }),
      { status: 500 }
    );
  }
} 