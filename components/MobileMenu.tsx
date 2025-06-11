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

  const handleLinkClick = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* 背景オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />
      
      {/* スライドメニュー */}
      <div className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Link href="/" onClick={handleLinkClick} className="text-2xl font-bold text-gray-900">
            Hanatsugu
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* メニュー項目 */}
        <nav className="p-6">
          <div className="space-y-4">
            {/* ショップ */}
            <Link
              href="/"
              onClick={handleLinkClick}
              className="flex items-center gap-4 py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v5a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
              </svg>
              <span className="font-medium">ショップ</span>
            </Link>

            {/* マイページ */}
            {isLoggedIn && (
              <Link
                href="/mypage"
                onClick={handleLinkClick}
                className="flex items-center gap-4 py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">マイページ</span>
              </Link>
            )}

            {/* お気に入り */}
            {isLoggedIn && (
              <Link
                href="/favorites"
                onClick={handleLinkClick}
                className="flex items-center gap-4 py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="relative">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {favoritesCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
              onClick={handleLinkClick}
              className="flex items-center gap-4 py-4 px-4 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors shadow-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-medium">出品する</span>
            </Link>

            {/* ヘルプ */}
            <Link
              href="/help"
              onClick={handleLinkClick}
              className="flex items-center gap-4 py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">ヘルプ</span>
            </Link>
          </div>

          {/* 認証関連 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            {isLoggedIn ? (
              <button
                onClick={handleDummyLogout}
                className="flex items-center gap-4 py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">ログアウト</span>
              </button>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/auth/login"
                  onClick={handleLinkClick}
                  className="flex items-center gap-4 py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">ログイン</span>
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={handleLinkClick}
                  className="flex items-center gap-4 py-3 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span className="font-medium">新規登録</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  )
}