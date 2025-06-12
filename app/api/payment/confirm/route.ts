import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: '決済IDが必要です' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: '決済が完了していません' },
        { status: 400 }
      );
    }

    // TODO: ここでデータベースに注文情報を保存
    // - 注文ステータス: 'paid'
    // - 配送先住所（shippingAddressパラメータから）
    // - 決済情報

    return NextResponse.json({
      success: true,
      orderId: `ORDER-${Date.now()}`, // 仮の注文ID
      amount: paymentIntent.amount,
      metadata: paymentIntent.metadata,
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: '決済確認中にエラーが発生しました' },
      { status: 500 }
    );
  }
}