import { NextRequest, NextResponse } from 'next/server';
import { stripe, calculatePlatformFee } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { amount, productId, sellerId } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: '無効な金額です' },
        { status: 400 }
      );
    }

    const platformFee = calculatePlatformFee(amount);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'jpy',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        productId,
        sellerId,
        platformFee: platformFee.toString(),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      platformFee,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: '決済の準備中にエラーが発生しました' },
      { status: 500 }
    );
  }
}