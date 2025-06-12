import { NextRequest, NextResponse } from 'next/server';

// 注文ステータスの型定義
export type OrderStatus = 'paid' | 'shipped' | 'delivered' | 'completed' | 'cancelled';

// ダミーの注文データストア（本番環境ではデータベースを使用）
const orders = new Map();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = orders.get(params.id);
  
  if (!order) {
    return NextResponse.json(
      { error: '注文が見つかりません' },
      { status: 404 }
    );
  }

  return NextResponse.json(order);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, trackingNumber } = await request.json();
    const order = orders.get(params.id);

    if (!order) {
      return NextResponse.json(
        { error: '注文が見つかりません' },
        { status: 404 }
      );
    }

    // ステータス遷移のバリデーション
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      'paid': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': ['completed'],
      'completed': [],
      'cancelled': []
    };

    if (!validTransitions[order.status].includes(status)) {
      return NextResponse.json(
        { error: '無効なステータス遷移です' },
        { status: 400 }
      );
    }

    // 注文を更新
    const updatedOrder = {
      ...order,
      status,
      ...(trackingNumber && { trackingNumber }),
      updatedAt: new Date().toISOString()
    };

    orders.set(params.id, updatedOrder);

    // ステータスに応じた処理
    if (status === 'completed') {
      // TODO: 売主への入金処理をトリガー
      console.log(`Order ${params.id} completed. Triggering payout to seller.`);
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: '注文の更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// テスト用: 注文を作成
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = await request.json();
  orders.set(params.id, {
    ...order,
    id: params.id,
    status: 'paid',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  return NextResponse.json(orders.get(params.id));
}