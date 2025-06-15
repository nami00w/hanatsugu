'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Heart, Search, MessageCircle, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'

export default function WelcomePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 認証状態の確認
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleGetStarted = () => {
    router.push('/')
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-green)] mx-auto mb-4"></div>
            <p>登録を確認中...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* 成功アイコン */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            {/* ウェルカムメッセージ */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🌸 Hanatuguへようこそ！
            </h1>
            
            <p className="text-xl text-gray-600 mb-2">
              登録が完了しました
            </p>
            
            {user?.user_metadata?.display_name && (
              <p className="text-lg text-gray-700 mb-8">
                {user.user_metadata.display_name}さん、お疲れさまでした！
              </p>
            )}

            {/* サービス説明 */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Hanatuguでできること
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start gap-3">
                  <Search className="w-5 h-5 text-[var(--primary-green)] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900">理想のドレスを探す</h3>
                    <p className="text-sm text-gray-600">ブランド・サイズ・価格で絞り込み検索</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900">お気に入り機能</h3>
                    <p className="text-sm text-gray-600">気になるドレスを保存して比較</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900">出品者と直接やりとり</h3>
                    <p className="text-sm text-gray-600">安心のメッセージ機能</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900">かんたん出品</h3>
                    <p className="text-sm text-gray-600">思い出のドレスを次の花嫁さまへ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* クイックアクション */}
            <div className="space-y-4">
              <button
                onClick={handleGetStarted}
                className="w-full bg-[var(--primary-green)] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
              >
                さっそく始める
              </button>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/search"
                  className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-[var(--primary-green)] text-[var(--primary-green)] rounded-lg hover:bg-green-50 transition-colors font-medium"
                >
                  <Search className="w-4 h-4" />
                  ドレスを探す
                </Link>
                
                <Link
                  href="/sell"
                  className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-pink-500 text-pink-600 rounded-lg hover:bg-pink-50 transition-colors font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  ドレスを出品
                </Link>
              </div>
            </div>

            {/* 補足情報 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                ご質問やお困りのことがございましたら、<br />
                <Link href="/contact" className="text-[var(--primary-green)] hover:underline">
                  お問い合わせ
                </Link>
                からお気軽にご連絡ください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}