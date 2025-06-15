'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import AuthGuard from '@/components/AuthGuard'
import Header from '@/components/Header'

export default function ChangeEmailPage() {
  const { user, updateEmail } = useAuth()
  const router = useRouter()
  const [newEmail, setNewEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!newEmail || !confirmEmail) {
      setError('すべての項目を入力してください')
      return
    }

    if (newEmail !== confirmEmail) {
      setError('メールアドレスが一致しません')
      return
    }

    if (newEmail === user?.email) {
      setError('現在と同じメールアドレスです')
      return
    }

    // 簡単なメールアドレス形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      setError('有効なメールアドレスを入力してください')
      return
    }

    setLoading(true)

    const result = await updateEmail(newEmail)
    
    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || 'メールアドレスの変更に失敗しました')
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <>
        <Header />
        <AuthGuard>
          <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                {/* 成功アイコン */}
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>

                {/* メッセージ */}
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  確認メールを送信しました
                </h1>
                
                <p className="text-gray-600 mb-6">
                  新しいメールアドレスに確認メールをお送りしました。<br />
                  メール内のリンクをクリックして変更を完了してください。
                </p>

                {/* 新しいメールアドレス表示 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-500 mb-1">新しいメールアドレス</p>
                  <p className="font-medium text-gray-900">{newEmail}</p>
                </div>

                {/* 注意事項 */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                  <div className="flex">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-yellow-800 mb-2">重要な注意事項</h3>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• 確認が完了するまで、古いメールアドレスでログインできます</li>
                        <li>• メールが届かない場合は、迷惑メールフォルダをご確認ください</li>
                        <li>• リンクの有効期限は24時間です</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Link
                    href="/mypage/settings"
                    className="w-full inline-flex items-center justify-center py-3 px-4 bg-[var(--primary-green)] text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    設定ページに戻る
                  </Link>
                  
                  <Link
                    href="/mypage"
                    className="block text-gray-500 hover:text-gray-700 text-sm"
                  >
                    マイページに戻る
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </AuthGuard>
      </>
    )
  }

  return (
    <>
      <Header />
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              メールアドレスを変更
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              新しいメールアドレスに確認メールが送信されます
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              {/* 現在のメールアドレス */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  現在のメールアドレス
                </label>
                <p className="text-gray-900 font-medium">{user?.email}</p>
              </div>

              <form className="space-y-6" onSubmit={handleChangeEmail}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700">
                    新しいメールアドレス
                  </label>
                  <div className="mt-1">
                    <input
                      id="newEmail"
                      name="newEmail"
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--primary-green)] focus:border-[var(--primary-green)] sm:text-sm"
                      placeholder="new-email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-700">
                    メールアドレス（確認）
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmEmail"
                      name="confirmEmail"
                      type="email"
                      required
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--primary-green)] focus:border-[var(--primary-green)] sm:text-sm"
                      placeholder="上と同じメールアドレス"
                    />
                  </div>
                </div>

                {/* セキュリティ注意事項 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">🔒 セキュリティについて</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 新しいメールアドレスで確認が必要です</li>
                    <li>• 確認完了まで古いアドレスでログイン可能</li>
                    <li>• 第三者がアクセスできないメールアドレスを使用してください</li>
                  </ul>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--primary-green)] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-green)] disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? '変更申請中...' : 'メールアドレスを変更'}
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

                <div className="mt-6">
                  <Link
                    href="/mypage/settings"
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-green)]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    設定ページに戻る
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    </>
  )
}