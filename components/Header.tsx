'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useFavorites } from '@/hooks/useFavorites'
import MobileMenu from './MobileMenu'

export default function Header() {
  // 開発中はダミーの認証状態を使用
  const [user] = useState<null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isLoggedIn, favoritesCount } = useFavorites()

  const handleLogout = async () => {
    // 開発中は何もしない
    console.log('ログアウト（開発中）')
  }

  // ダミーログイン
  const handleDummyLogin = () => {
    console.log('🔧 Logging in...')
    localStorage.setItem('dummyAuth', 'true')
    localStorage.setItem('dummyUserId', 'demo-user-123')
    
    // カスタムイベントを発火してコンポーネントに通知
    window.dispatchEvent(new Event('dummyAuthChange'))
    
    console.log('✅ Logged in as demo user')
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
  }

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* モバイル版レイアウト */}
          <div className="lg:hidden flex items-center justify-between w-full">
            {/* ハンバーガーメニュー（左） */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* ロゴ（中央） */}
            <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-gray-900">
              Hanatsugu
            </Link>
            
            {/* 空のスペース（右） */}
            <div className="w-10"></div>
          </div>

          {/* PC版レイアウト */}
          <div className="hidden lg:flex justify-between items-center w-full">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Hanatsugu
            </Link>

            <div className="flex items-center gap-6">
              {/* お気に入りリンク（ログイン時のみ） */}
              {isLoggedIn && (
                <Link 
                  href="/favorites" 
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>お気に入り</span>
                  {favoritesCount > 0 && (
                    <span className="bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded">
                      {favoritesCount}
                    </span>
                  )}
                </Link>
              )}

              {/* 出品ボタン */}
              <Link
                href="/sell"
                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-sm hover:shadow-md"
              >
                出品
              </Link>
              
              {user ? (
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-gray-900"
                >
                  ログアウト
                </button>
              ) : (
                <>
                  {/* ダミー認証がログイン状態の場合、ログアウトボタンを表示 */}
                  {isLoggedIn ? (
                    <button
                      onClick={handleDummyLogout}
                      className="text-gray-700 hover:text-gray-900"
                    >
                      ログアウト
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleDummyLogin}
                        className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        🔧 デモログイン
                      </button>
                      <Link
                        href="/auth/login"
                        className="text-gray-700 hover:text-gray-900"
                      >
                        ログイン
                      </Link>
                      <Link
                        href="/auth/signup"
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        新規登録
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* モバイルメニュー */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  )
}