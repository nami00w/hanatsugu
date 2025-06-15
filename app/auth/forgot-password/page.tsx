'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { resetPassword } = useAuth()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await resetPassword(email)
    
    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || 'パスワードリセットに失敗しました')
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              {/* 成功アイコン */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-green-600" />
              </div>

              {/* メッセージ */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                リセットメールを送信しました
              </h1>
              
              <p className="text-gray-600 mb-6">
                以下のメールアドレスにパスワードリセット用のリンクをお送りしました。<br />
                メール内のリンクをクリックして新しいパスワードを設定してください。
              </p>

              {/* メールアドレス表示 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">送信先</p>
                <p className="font-medium text-gray-900">{email}</p>
              </div>

              {/* 注意事項 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-yellow-800 mb-2">📧 メールが届かない場合</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 迷惑メールフォルダをご確認ください</li>
                  <li>• メールアドレスに間違いがないかご確認ください</li>
                  <li>• リンクの有効期限は1時間です</li>
                </ul>
              </div>

              <div className="space-y-4">
                <Link
                  href="/auth/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[var(--primary-green)] text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  ログインページに戻る
                </Link>
                
                <Link
                  href="/"
                  className="block text-gray-500 hover:text-gray-700 text-sm"
                >
                  トップページに戻る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            パスワードをお忘れですか？
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            登録したメールアドレスを入力してください。<br />
            パスワードリセット用のリンクをお送りします。
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleResetPassword}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  メールアドレス
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--primary-green)] focus:border-[var(--primary-green)] sm:text-sm"
                    placeholder="例: hanako@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--primary-green)] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-green)] disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'メール送信中...' : 'リセットメールを送信'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">または</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  href="/auth/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-green)]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ログインページに戻る
                </Link>
                
                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    アカウントをお持ちでない方は{' '}
                    <Link href="/auth/signup" className="font-medium text-[var(--primary-green)] hover:text-green-700">
                      新規登録
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}