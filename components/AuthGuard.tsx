'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { User } from 'lucide-react'
import Link from 'next/link'
import Header from './Header'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function AuthGuard({ children, redirectTo = '/auth/login' }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, loading, router, redirectTo])

  // ローディング中
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-16">
          <div className="text-lg text-gray-600">読み込み中...</div>
        </div>
      </div>
    )
  }

  // 未認証の場合
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-medium text-gray-900">ログインが必要です</h2>
            <p className="mt-2 text-sm text-gray-600">
              このページを表示するにはログインしてください
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link href="/auth/login" className="btn-primary">
                ログイン
              </Link>
              <Link href="/auth/signup" className="btn-secondary">
                新規登録
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 認証済みの場合、子コンポーネントを表示
  return <>{children}</>
}