'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

function PurchaseCompleteContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    // URLパラメータまたはセッションから注文IDを取得
    const id = searchParams.get('orderId') || `ORDER-${Date.now()}`;
    setOrderId(id);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          
          <h1 className="text-2xl font-bold mb-2">ご購入ありがとうございました</h1>
          <p className="text-gray-600 mb-6">
            ご注文を確認いたしました。商品の発送準備を開始いたします。
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">注文番号</p>
            <p className="font-semibold">{orderId}</p>
          </div>

          <div className="space-y-4 text-left bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="font-semibold mb-3">次のステップ</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <span className="bg-pink-100 text-pink-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mr-3">1</span>
                <div>
                  <p className="font-medium">注文確認メールをお送りしました</p>
                  <p className="text-gray-600">登録されたメールアドレスに詳細をお送りしています</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="bg-pink-100 text-pink-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mr-3">2</span>
                <div>
                  <p className="font-medium">出品者が商品を発送します</p>
                  <p className="text-gray-600">通常2-3営業日以内に発送されます</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="bg-pink-100 text-pink-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mr-3">3</span>
                <div>
                  <p className="font-medium">商品到着後、受取確認をお願いします</p>
                  <p className="text-gray-600">商品に問題がなければマイページから受取確認をしてください</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>重要：</strong>商品到着後、3日以内に受取確認をお願いします。
              受取確認後に出品者への入金処理が行われます。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/mypage/history"
              className="flex-1 bg-pink-500 text-white py-3 px-4 rounded-md hover:bg-pink-600 transition-colors text-center"
            >
              購入履歴を確認
            </Link>
            <Link
              href="/"
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors text-center"
            >
              トップページへ戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PurchaseCompletePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-lg">読み込み中...</div></div>}>
      <PurchaseCompleteContent />
    </Suspense>
  );
}