'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useFavorites } from '@/hooks/useFavorites'

export default function Header() {
  // 開発中はダミーの認証状態を使用
  const [user] = useState<null>(null)
  const { isLoggedIn, favoritesCount } = useFavorites()

  const handleLogout = async () => {
    // 開発中は何もしない
    console.log('ログアウト（開発中）')
  }

  // テスト用ログイン切り替え
  // const toggleAuth = () => {
  //   const currentAuth = localStorage.getItem('dummyAuth')
  //   const newAuth = currentAuth === 'true' ? 'false' : 'true'
  //   localStorage.setItem('dummyAuth', newAuth)
  //   
  //   // カスタムイベントを発火してコンポーネントに通知
  //   window.dispatchEvent(new Event('dummyAuthChange'))
  //   
  //   console.log('🔄 Auth toggled to:', newAuth)
  // }

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
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Hanatsugu
          </Link>

          <div className="flex items-center gap-4">
            {/* お気に入りアイコン（ログイン時のみ） */}
            {isLoggedIn && (
              <Link 
                href="/favorites" 
                className="relative p-2 text-gray-700 hover:text-pink-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </span>
                )}
              </Link>
            )}
            
            {user ? (
              <>
                <Link
                  href="/sell"
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  ドレスを出品
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-gray-900"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                {/* ダミー認証がログイン状態の場合、ログアウトボタンを表示 */}
                {isLoggedIn ? (
                  <button
                    onClick={handleDummyLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    🔧 ダミーログアウト
                  </button>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="text-gray-700 hover:text-gray-900"
                    >
                      ログイン
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                    >
                      新規登録
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}