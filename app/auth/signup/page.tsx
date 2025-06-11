'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient, isSupabaseConfigured } from '@/lib/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Supabase設定状態をチェック
    if (!isSupabaseConfigured()) {
      setError('Supabase認証は現在利用できません（ダミー設定のため）')
      setDebugInfo('開発環境：実際のSupabase認証を使用するには .env.local の設定が必要です')
    }
  }, [])

  // デバッグ用：ダミーログイン機能
  const handleDummyLogin = () => {
    console.log('🔧 Setting dummy auth...')
    localStorage.setItem('dummyAuth', 'true')
    localStorage.setItem('dummyUserId', 'dummy-user-id')
    
    // カスタムイベントを発火してコンポーネントに通知
    window.dispatchEvent(new Event('dummyAuthChange'))
    
    console.log('✅ Dummy auth set, redirecting...')
    router.push('/')
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    // Supabaseが設定されていない場合
    if (!isSupabaseConfigured()) {
      setError('Supabase認証が設定されていません。')
      return
    }

    setLoading(true)

    try {
      console.log('📝 Attempting signup with:', { email, name })
      
      // サインアップ
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      })

      console.log('📝 Signup response:', { data, error: signupError })

      if (signupError) throw signupError

      // ユーザープロファイルを作成
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: name,
          })

        if (profileError) {
          console.warn('Profile creation failed:', profileError)
          // プロファイル作成エラーは無視して続行
        }
      }

      alert('登録が完了しました！メールを確認してアカウントを有効化してください。')
      router.push('/auth/login')
    } catch (error: unknown) {
      console.error('🚨 Signup error:', error)
      
      let errorMessage = '登録に失敗しました'
      
      if (error instanceof Error && error.message) {
        errorMessage = error.message
      }
      
      if (error instanceof Error && error.message?.includes('fetch')) {
        errorMessage = '接続エラー: Supabaseサーバーに接続できません'
        setDebugInfo(`詳細: ${error.message}`)
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          新規アカウント登録
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          または{' '}
          <Link href="/auth/login" className="font-medium text-pink-600 hover:text-pink-500">
            ログインはこちら
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* デバッグ情報表示 */}
          {debugInfo && (
            <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded text-sm mb-6">
              <p className="font-medium">開発情報:</p>
              <p>{debugInfo}</p>
            </div>
          )}

          {/* ダミーログインボタン（開発時のみ） */}
          {!isSupabaseConfigured() && (
            <div className="mb-6">
              <button
                type="button"
                onClick={handleDummyLogin}
                className="w-full flex justify-center py-2 px-4 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none"
              >
                🔧 開発用ダミーログイン
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                ※ 開発環境用。実際の認証は Supabase 設定後に利用可能です
              </p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSignup}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
                {debugInfo && (
                  <div className="mt-2 text-xs opacity-75">
                    {debugInfo}
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                お名前
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                />
              </div>
            </div>

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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                パスワード（確認）
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:bg-gray-400"
              >
                {loading ? '登録中...' : '登録する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}