'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { User, ChevronDown, LogOut, Plus, Settings } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { useAuth } from '@/contexts/AuthContext'
import { isAdmin } from '@/lib/admin'
import MobileMenu from './MobileMenu'
import AuthModal from './AuthModal'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const { favoritesCount } = useFavorites()
  const { user, isAuthenticated, signOut } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAccountDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    await signOut()
    setShowAccountDropdown(false)
  }

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'ユーザー'

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:justify-between">
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
            
            {/* 右上アカウントボタン */}
            <div className="flex items-center">
              {isAuthenticated ? (
                <Link
                  href="/mypage"
                  className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <User className="w-6 h-6" />
                </Link>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <User className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>

          {/* PC版レイアウト */}
          <Link href="/" className="hidden lg:block text-2xl font-bold text-gray-900">
            Hanatsugu
          </Link>

          {/* PC版ナビゲーション */}
          <div className="hidden lg:flex items-center gap-4">
            {/* お気に入りアイコン（ログイン時のみ） */}
            {isAuthenticated && (
              <Link 
                href="/favorites" 
                className="relative p-2 text-gray-700 hover:text-primary transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </span>
                )}
              </Link>
            )}
            
            {isAuthenticated ? (
              /* ログイン時：アカウントドロップダウン */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <User className="w-5 h-5" />
                  <span>{displayName}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAccountDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* ドロップダウンメニュー */}
                {showAccountDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      href="/mypage"
                      onClick={() => setShowAccountDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>マイページ</span>
                    </Link>
                    <Link
                      href="/sell"
                      onClick={() => setShowAccountDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>出品する</span>
                    </Link>
                    {isAdmin(user) && (
                      <Link
                        href="/admin"
                        onClick={() => setShowAccountDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>管理画面</span>
                      </Link>
                    )}
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>ログアウト</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* 未ログイン時：ログイン・新規登録ボタン */
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-gray-900"
                >
                  ログイン
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn-secondary"
                >
                  新規登録
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      
      {/* モバイルメニュー */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      {/* 認証モーダル */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </header>
  )
}