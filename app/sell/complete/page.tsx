'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Heart, Share, Eye, MessageCircle, Home } from 'lucide-react'
import { Suspense } from 'react'

function CompletePageContent() {
  const searchParams = useSearchParams()
  const listingId = searchParams.get('id')
  const isDraft = searchParams.get('draft') === 'true'

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          
          {/* 成功アイコンとメッセージ */}
          <div className="text-center mb-8">
            <div className="relative">
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
              <div className="absolute -top-2 -right-2 animate-bounce">
                <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {isDraft ? '下書きを保存しました！' : '出品が完了しました！'}
            </h1>
            
            <p className="text-lg text-gray-600 mb-2">
              {isDraft 
                ? 'いつでも編集して公開できます' 
                : 'あなたの素敵なドレスが多くの花嫁様に届きますように'
              }
            </p>
            
            {listingId && (
              <p className="text-sm text-gray-500">
                出品ID: {listingId}
              </p>
            )}
          </div>

          {/* アクションカード */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            
            {/* 商品を見る */}
            {listingId && !isDraft && (
              <Link
                href={`/products/${listingId}`}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center mb-3">
                  <Eye className="w-6 h-6 text-pink-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">商品を確認</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  出品した商品がどのように表示されるか確認できます
                </p>
                <div className="text-pink-600 text-sm font-medium group-hover:text-pink-700">
                  商品ページを見る →
                </div>
              </Link>
            )}

            {/* シェア */}
            {listingId && !isDraft && (
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Hanatsugu - ウェディングドレス出品',
                      text: '素敵なウェディングドレスを出品しました！',
                      url: `${window.location.origin}/products/${listingId}`
                    })
                  } else {
                    navigator.clipboard.writeText(`${window.location.origin}/products/${listingId}`)
                    alert('商品URLをクリップボードにコピーしました！')
                  }
                }}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group text-left"
              >
                <div className="flex items-center mb-3">
                  <Share className="w-6 h-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">シェアする</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  SNSや友人にシェアして購入者を見つけましょう
                </p>
                <div className="text-blue-600 text-sm font-medium group-hover:text-blue-700">
                  シェアする →
                </div>
              </button>
            )}

            {/* 下書き編集 */}
            {isDraft && (
              <Link
                href="/sell"
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-yellow-300 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center mb-3">
                  <MessageCircle className="w-6 h-6 text-yellow-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">下書きを編集</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  保存した下書きを編集して公開しましょう
                </p>
                <div className="text-yellow-600 text-sm font-medium group-hover:text-yellow-700">
                  編集する →
                </div>
              </Link>
            )}

          </div>

          {/* 次のステップ */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isDraft ? '次にやること' : '出品後のポイント'}
            </h3>
            
            <div className="space-y-3">
              {isDraft ? (
                <>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-xs font-medium text-pink-600">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">写真や説明文を確認</p>
                      <p className="text-xs text-gray-600">魅力的な写真と詳しい説明で購入者の心を掴みましょう</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-xs font-medium text-pink-600">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">価格設定を最終チェック</p>
                      <p className="text-xs text-gray-600">AI価格提案を参考に競争力のある価格を設定</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-xs font-medium text-pink-600">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">公開して購入者を待つ</p>
                      <p className="text-xs text-gray-600">準備ができたら公開して、素敵な花嫁様との出会いを待ちましょう</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-green-600" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">購入希望者からの問い合わせに対応</p>
                      <p className="text-xs text-gray-600">質問には丁寧かつ迅速に回答しましょう</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-green-600" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">定期的に商品をチェック</p>
                      <p className="text-xs text-gray-600">閲覧数や問い合わせ状況を確認して必要に応じて価格調整</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-green-600" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">安全な取引を心がける</p>
                      <p className="text-xs text-gray-600">身元確認済みの購入者との取引を推奨します</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ナビゲーションボタン */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex-1 bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              ホームに戻る
            </Link>
            
            <Link
              href="/sell"
              className="flex-1 bg-white text-pink-600 px-6 py-3 rounded-lg font-medium border border-pink-600 hover:bg-pink-50 transition-colors text-center"
            >
              他の商品も出品する
            </Link>
          </div>

          {/* サポート情報 */}
          <div className="text-center mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              ご不明な点がございましたら、
              <Link href="/support" className="text-pink-600 hover:text-pink-700 underline">
                サポートセンター
              </Link>
              までお気軽にお問い合わせください。
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function SellCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    }>
      <CompletePageContent />
    </Suspense>
  )
}