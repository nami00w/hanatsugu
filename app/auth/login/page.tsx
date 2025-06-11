'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient, isSupabaseConfigured } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

  // デバッグ用：ダミーログイン機能（モバイル対応強化）
  const handleDummyLogin = async (e?: React.MouseEvent | React.TouchEvent) => {
    try {
      console.log('🔧 [Mobile Debug] Starting dummy login...')
      console.log('🔧 [Mobile Debug] Event type:', e?.type || 'programmatic')
      console.log('🔧 [Mobile Debug] User agent:', navigator.userAgent)
      console.log('🔧 [Mobile Debug] Touch support:', 'ontouchstart' in window)
      
      // デバウンス処理（連続タップ防止）
      if (loading) {
        console.log('🔧 [Mobile Debug] Already processing, ignoring...')
        return
      }
      
      setLoading(true)
      setError('')
      
      // モバイルでの操作確認
      console.log('🔧 [Mobile Debug] Setting localStorage...')
      
      // localStorage操作を try-catch で囲む
      try {
        localStorage.setItem('dummyAuth', 'true')
        localStorage.setItem('dummyUserId', 'dummy-user-id')
        console.log('🔧 [Mobile Debug] localStorage set successfully')
        
        // 設定確認
        const authCheck = localStorage.getItem('dummyAuth')
        const userIdCheck = localStorage.getItem('dummyUserId')
        console.log('🔧 [Mobile Debug] Verification - Auth:', authCheck, 'UserId:', userIdCheck)
      } catch (storageError) {
        console.error('🚨 [Mobile Debug] localStorage error:', storageError)
        setError('ストレージエラー: 設定の保存に失敗しました')
        setLoading(false)
        return
      }
      
      // イベント発火
      try {
        console.log('🔧 [Mobile Debug] Dispatching events...')
        window.dispatchEvent(new Event('dummyAuthChange'))
        console.log('🔧 [Mobile Debug] Events dispatched successfully')
      } catch (eventError) {
        console.error('🚨 [Mobile Debug] Event dispatch error:', eventError)
      }
      
      // 少し待ってからリダイレクト（モバイルでの処理時間を考慮）
      console.log('🔧 [Mobile Debug] Preparing redirect...')
      setTimeout(() => {
        console.log('✅ [Mobile Debug] Redirecting to home...')
        router.push('/')
      }, 100)
      
    } catch (error) {
      console.error('🚨 [Mobile Debug] Dummy login failed:', error)
      setError(`ダミーログインエラー: ${error instanceof Error ? error.message : '不明なエラー'}`)
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Supabaseが設定されていない場合
    if (!isSupabaseConfigured()) {
      setError('Supabase認証が設定されていません。')
      setLoading(false)
      return
    }

    try {
      console.log('🔐 Attempting login with:', { email, password: '***' })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('🔐 Login response:', { data, error })

      if (error) {
        console.error('🚨 Login error:', error)
        throw error
      }

      console.log('✅ Login successful')
      router.push('/')
    } catch (error: unknown) {
      console.error('🚨 Login catch error:', error)
      
      let errorMessage = 'ログインに失敗しました'
      
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
          アカウントにログイン
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          または{' '}
          <Link href="/auth/signup" className="font-medium text-pink-600 hover:text-pink-500">
            新規登録はこちら
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

          {/* ダミーログインボタン（開発時のみ） - モバイル対応強化 */}
          {!isSupabaseConfigured() && (
            <div className="mb-6">
              <button
                type="button"
                onClick={handleDummyLogin}
                onTouchEnd={handleDummyLogin}
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 active:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none'
                }}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-800 mr-2"></div>
                    処理中...
                  </div>
                ) : (
                  '開発用ダミーログイン'
                )}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                ※ 開発環境用。実際の認証は Supabase 設定後に利用可能です
              </p>
              {/* モバイルデバッグ情報 */}
              <div className="mt-2 text-xs text-gray-400 text-center">
                Touch: {'ontouchstart' in window ? 'Yes' : 'No'} | 
                Mobile: {/Mobi|Android/i.test(navigator.userAgent) ? 'Yes' : 'No'}
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                {loading ? 'ログイン中...' : 'ログイン'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}