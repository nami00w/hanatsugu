'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { X, User, UserPlus } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  // ESCキーで閉じる
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* 背景オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />
      
      {/* モーダルコンテンツ */}
      <div className="relative z-10 flex items-center justify-center min-h-full p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-auto transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              アカウント
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* コンテンツ */}
          <div className="p-6 space-y-4">
            <p className="text-center text-gray-600 text-sm mb-6">
              Hanatsuguの全ての機能をご利用いただくには<br />
              ログインまたは新規登録が必要です
            </p>
            
            {/* ログインボタン */}
            <Link
              href="/auth/login"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
              style={{ backgroundColor: '#6B8E4A' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5A7A3A'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6B8E4A'}
            >
              <User className="w-5 h-5" />
              <span>ログイン</span>
            </Link>
            
            {/* 新規登録ボタン */}
            <Link
              href="/auth/signup"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 text-gray-700 bg-white rounded-lg font-medium transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 transform hover:-translate-y-0.5"
            >
              <UserPlus className="w-5 h-5" />
              <span>新規登録</span>
            </Link>
            
            {/* 説明テキスト */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 space-y-2">
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#6B8E4A' }}></span>
                  お気に入り商品の保存
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#6B8E4A' }}></span>
                  出品・購入機能の利用
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#6B8E4A' }}></span>
                  閲覧履歴とマイページ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}