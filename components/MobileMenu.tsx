'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useFavorites } from '@/hooks/useFavorites'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { isLoggedIn, favoritesCount } = useFavorites()

  // ESCキーでメニューを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // スクロールを防止
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // ダミーログイン
  const handleDummyLogin = () => {
    console.log('🔧 Logging in...')
    localStorage.setItem('dummyAuth', 'true')
    localStorage.setItem('dummyUserId', 'demo-user-123')
    
    // カスタムイベントを発火してコンポーネントに通知
    window.dispatchEvent(new Event('dummyAuthChange'))
    
    console.log('✅ Logged in as demo user')
    onClose()
  }

  // ダミーログアウト
  const handleDummyLogout = () => {
    console.log('🔧 Logging out...')
    localStorage.setItem('dummyAuth', 'false')
    localStorage.removeItem('dummyUserId')
    localStorage.removeItem('favorites')
    
    // カスタムイベントを発火してコンポーネントに通知
    window.dispatchEvent(new Event('dummyAuthChange'))
    
    console.log('✅ Logged out')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* オーバーレイ */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* メニューパネル */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold text-gray-900">メニュー</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* メニュー項目 */}
          <nav className="flex-1 py-6">
            <div className="space-y-2 px-4">
              {/* ショップ */}
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="font-medium">ショップ</span>
              </Link>

              {/* お気に入り（ログイン時のみ） */}
              {isLoggedIn && (
                <Link
                  href="/favorites"
                  onClick={onClose}
                  className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="relative">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {favoritesCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {favoritesCount > 99 ? '99+' : favoritesCount}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">お気に入り</span>
                </Link>
              )}

              {/* 出品する */}
              <Link
                href="/sell"
                onClick={onClose}
                className="flex items-center gap-3 py-3 px-4 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-medium">出品する</span>
              </Link>

              {/* ヘルプ */}
              <button className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full text-left">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">ヘルプ</span>
              </button>
            </div>
          </nav>

          {/* 認証エリア */}
          <div className="border-t p-4">
            {isLoggedIn ? (
              <button
                onClick={handleDummyLogout}
                className="flex items-center gap-3 py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">ログアウト</span>
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleDummyLogin}
                  className="flex items-center gap-3 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full text-left"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">🔧 デモログイン</span>
                </button>
                <Link
                  href="/auth/login"
                  onClick={onClose}
                  className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">ログイン</span>
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={onClose}
                  className="flex items-center gap-3 py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span className="font-medium">新規登録</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}