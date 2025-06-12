'use client'

import { useState, useEffect } from 'react'
import { Clock, ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import type { ViewHistoryItem } from '@/lib/types'

export default function ViewHistoryPage() {
  const { isAuthenticated } = useAuth()
  const [viewHistory, setViewHistory] = useState<ViewHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }

    // localStorage から閲覧履歴を取得
    const storedHistory = localStorage.getItem('viewHistory')
    if (storedHistory) {
      try {
        const history: ViewHistoryItem[] = JSON.parse(storedHistory)
        // 新しい順にソート
        const sortedHistory = history.sort(
          (a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
        )
        setViewHistory(sortedHistory)
      } catch (error) {
        console.error('閲覧履歴の読み込みに失敗しました:', error)
        setViewHistory([])
      }
    }
    setIsLoading(false)
  }, [isAuthenticated])

  const clearHistory = () => {
    if (confirm('閲覧履歴をすべて削除しますか？')) {
      localStorage.removeItem('viewHistory')
      setViewHistory([])
    }
  }

  const removeHistoryItem = (itemId: string) => {
    const updatedHistory = viewHistory.filter(item => item.id !== itemId)
    setViewHistory(updatedHistory)
    localStorage.setItem('viewHistory', JSON.stringify(updatedHistory))
  }

  const formatViewedAt = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'たった今'
    } else if (diffInHours < 24) {
      return `${diffInHours}時間前`
    } else if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24)
      return `${days}日前`
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-medium text-gray-900">ログインが必要です</h2>
            <p className="mt-2 text-sm text-gray-600">
              閲覧履歴を表示するにはログインしてください
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/mypage"
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">閲覧履歴</h1>
              <p className="text-sm text-gray-600 mt-1">
                最近見た商品が時系列で表示されます
              </p>
            </div>
          </div>
          
          {viewHistory.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              履歴を削除
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600">読み込み中...</p>
          </div>
        ) : viewHistory.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-medium text-gray-900">閲覧履歴がありません</h2>
            <p className="mt-2 text-sm text-gray-600">
              商品を見ると、ここに履歴が表示されます
            </p>
            <div className="mt-6">
              <Link href="/search" className="btn-primary">
                商品を探す
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {viewHistory.map((item) => (
              <div key={`${item.id}-${item.viewedAt}`} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-start gap-4">
                  {/* 商品画像 */}
                  <div className="flex-shrink-0 w-20 h-20 relative rounded-lg overflow-hidden bg-gray-100">
                    <Link href={`/products/${item.dress.id}`}>
                      <Image
                        src={item.dress.images[0]}
                        alt={item.dress.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </Link>
                  </div>
                  
                  {/* 商品情報 */}
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/products/${item.dress.id}`}
                      className="block hover:bg-gray-50 rounded p-2 -m-2 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 truncate mb-1">
                        {item.dress.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span>{item.dress.brand}</span>
                        <span>•</span>
                        <span>サイズ {item.dress.size}</span>
                        <span>•</span>
                        <span>{item.dress.condition}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-primary">
                          ¥{item.dress.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatViewedAt(item.viewedAt)}に閲覧
                        </p>
                      </div>
                    </Link>
                  </div>
                  
                  {/* 削除ボタン */}
                  <button
                    onClick={() => removeHistoryItem(item.id)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="履歴から削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* フッター情報 */}
        {viewHistory.length > 0 && (
          <div className="mt-8 text-center text-xs text-gray-500">
            最大20件の閲覧履歴が保存されます • 古い履歴は自動的に削除されます
          </div>
        )}
      </div>
    </div>
  )
}