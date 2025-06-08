'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter()

  // モーダルが開いているときはスクロールを防ぐ
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // ESCキーで閉じる
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.keyCode === 27) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleLogin = () => {
    router.push('/auth/login')
    onClose()
  }

  const handleSignup = () => {
    router.push('/auth/signup')
    onClose()
  }

  // デモログイン機能（開発用）
  const handleDemoLogin = () => {
    console.log('🔧 Demo login from modal...')
    localStorage.setItem('dummyAuth', 'true')
    localStorage.setItem('dummyUserId', 'demo-user-123')
    
    // カスタムイベントを発火してコンポーネントに通知
    window.dispatchEvent(new Event('dummyAuthChange'))
    
    console.log('✅ Demo logged in')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* モーダルコンテンツ */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 transform transition-all">
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* モーダル内容 */}
        <div className="p-8">
          {/* アイコン */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* タイトル */}
          <h2 className="text-xl font-bold text-center text-gray-900 mb-3">
            お気に入りに追加するには
          </h2>
          <p className="text-center text-gray-600 mb-8">
            ログインが必要です
          </p>

          {/* ボタン */}
          <div className="space-y-3">
            <button
              onClick={handleDemoLogin}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              🔧 デモログイン（開発用）
            </button>
            <button
              onClick={handleLogin}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              ログイン
            </button>
            <button
              onClick={handleSignup}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              新規登録
            </button>
          </div>

          {/* 補足テキスト */}
          <p className="text-xs text-center text-gray-500 mt-6">
            アカウント作成で、お気に入り商品の管理や<br />
            新着情報の通知を受け取ることができます
          </p>
        </div>
      </div>
    </div>
  )
}