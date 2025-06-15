'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, RefreshCw, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'

function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const { resendConfirmationEmail } = useAuth()
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState('')
  const [cooldownTime, setCooldownTime] = useState(0)
  const cooldownInterval = useRef<NodeJS.Timeout | null>(null)

  // コンポーネントアンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (cooldownInterval.current) {
        clearInterval(cooldownInterval.current)
      }
    }
  }, [])

  const startCooldown = () => {
    setCooldownTime(50)
    cooldownInterval.current = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          if (cooldownInterval.current) {
            clearInterval(cooldownInterval.current)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleResendEmail = async () => {
    if (!email || isResending || cooldownTime > 0) return

    setIsResending(true)
    setResendError('')
    setResendSuccess(false)

    const result = await resendConfirmationEmail(email)
    
    if (result.success) {
      setResendSuccess(true)
      startCooldown() // 成功時にクールダウン開始
    } else {
      // Supabaseのセキュリティエラーの場合
      if (result.error?.includes('50 seconds')) {
        setResendError('セキュリティのため、50秒後に再送信できます')
        startCooldown()
      } else {
        setResendError(result.error || 'メールの再送信に失敗しました')
      }
    }
    
    setIsResending(false)
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* アイコン */}
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>

            {/* メインメッセージ */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              確認メールを送信しました
            </h1>
            
            <p className="text-gray-600 mb-6">
              以下のメールアドレスに確認メールをお送りしました。<br />
              メール内のリンクをクリックして登録を完了してください。
            </p>

            {/* メールアドレス表示 */}
            {email && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">送信先</p>
                <p className="font-medium text-gray-900">{email}</p>
              </div>
            )}

            {/* 注意事項 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-yellow-800 mb-2">📧 メールが届かない場合</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 迷惑メールフォルダをご確認ください</li>
                <li>• メールアドレスに間違いがないかご確認ください</li>
                <li>• しばらく時間を置いてから再度お試しください</li>
              </ul>
            </div>

            {/* 再送信機能 */}
            <div className="space-y-4">
              {resendSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">確認メールを再送信しました</span>
                  </div>
                </div>
              )}

              {resendError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{resendError}</p>
                </div>
              )}

              <button
                onClick={handleResendEmail}
                disabled={isResending || !email || cooldownTime > 0}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                {isResending 
                  ? '送信中...' 
                  : cooldownTime > 0 
                    ? `再送信まであと ${cooldownTime}秒` 
                    : '確認メールを再送信'
                }
              </button>

              <div className="pt-4 border-t border-gray-200">
                <Link
                  href="/"
                  className="text-[var(--primary-green)] hover:text-green-700 text-sm font-medium"
                >
                  トップページに戻る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-green)] mx-auto mb-4"></div>
            <p>読み込み中...</p>
          </div>
        </div>
      </>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}