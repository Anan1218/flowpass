import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { nanoid } from 'nanoid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { storeId, amount } = await req.json();
    
    const passId = nanoid();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
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

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      passId
    });
  } catch (error) {
    console.error('Stripe API error:', error);
    return NextResponse.json(
      { error: 'Payment intent creation failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const paymentIntentId = url.searchParams.get('paymentIntentId');
    
    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    return NextResponse.json({ 
      passId: paymentIntent.metadata.passId 
    });
  } catch (error) {
    console.error('Stripe confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}