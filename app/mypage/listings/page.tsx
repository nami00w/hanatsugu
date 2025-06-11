'use client'

import { useState, useEffect } from 'react'
import { Package, ArrowLeft, Edit, Trash2, Eye, MessageCircle, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useFavorites } from '@/hooks/useFavorites'
import type { MyListing } from '@/lib/types'

type StatusTab = 'all' | 'active' | 'sold' | 'draft' | 'inactive'

export default function MyListingsPage() {
  const { isLoggedIn } = useFavorites()
  const [myListings, setMyListings] = useState<MyListing[]>([])
  const [activeTab, setActiveTab] = useState<StatusTab>('all')
  const [isLoading, setIsLoading] = useState(true)

  // ダミーデータを生成
  useEffect(() => {
    if (!isLoggedIn) {
      setIsLoading(false)
      return
    }

    // ダミーの出品データを作成
    const dummyListings: MyListing[] = [
      {
        id: 'listing-1',
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        views: 42,
        inquiries: 3,
        dress: {
          id: 'dress-1',
          title: 'Vera Wang プリンセスライン ウェディングドレス',
          description: '一度着用のみの美品です。',
          price: 180000,
          original_price: 350000,
          images: ['/api/placeholder/400/600'],
          size: 'M',
          brand: 'Vera Wang',
          condition: '未使用に近い',
          color: 'ホワイト',
          category: 'プリンセスライン',
          seller_id: 'user-1',
          owner_history: '1人目（新品購入）',
          status: 'published',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        }
      },
      {
        id: 'listing-2',
        status: 'sold',
        createdAt: '2024-01-10T14:30:00Z',
        views: 89,
        inquiries: 7,
        dress: {
          id: 'dress-2',
          title: 'Caroline Herrera マーメイドライン',
          description: '結婚式で1回着用しました。',
          price: 220000,
          original_price: 400000,
          images: ['/api/placeholder/400/600'],
          size: 'S',
          brand: 'Carolina Herrera',
          condition: '目立った傷や汚れなし',
          color: 'アイボリー',
          category: 'マーメイドライン',
          seller_id: 'user-1',
          owner_history: '1人目（新品購入）',
          status: 'sold',
          created_at: '2024-01-10T14:30:00Z',
          updated_at: '2024-01-20T16:45:00Z'
        }
      },
      {
        id: 'listing-3',
        status: 'draft',
        createdAt: '2024-01-20T09:15:00Z',
        views: 0,
        inquiries: 0,
        dress: {
          id: 'dress-3',
          title: 'TAKAMI BRIDAL Aライン ウェディングドレス',
          description: '写真撮影のみ使用。',
          price: 150000,
          original_price: 280000,
          images: ['/api/placeholder/400/600'],
          size: 'L',
          brand: 'TAKAMI BRIDAL',
          condition: '新品・未使用',
          color: 'ホワイト',
          category: 'Aライン',
          seller_id: 'user-1',
          owner_history: '1人目（新品購入）',
          status: 'draft',
          created_at: '2024-01-20T09:15:00Z',
          updated_at: '2024-01-20T09:15:00Z'
        }
      }
    ]

    setMyListings(dummyListings)
    setIsLoading(false)
  }, [isLoggedIn])

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '出品中'
      case 'sold': return '売却済み'
      case 'draft': return '下書き'
      case 'inactive': return '停止中'
      default: return status
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'sold': return 'bg-gray-100 text-gray-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredListings = myListings.filter(listing => {
    if (activeTab === 'all') return true
    return listing.status === activeTab
  })

  const getTabCount = (status: StatusTab) => {
    if (status === 'all') return myListings.length
    return myListings.filter(listing => listing.status === status).length
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-medium text-gray-900">ログインが必要です</h2>
            <p className="mt-2 text-sm text-gray-600">
              出品管理を表示するにはログインしてください
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
              <h1 className="text-2xl font-bold text-gray-900">出品管理</h1>
              <p className="text-sm text-gray-600 mt-1">
                あなたが出品した商品を管理できます
              </p>
            </div>
          </div>
          
          <Link href="/sell" className="btn-primary">
            新規出品
          </Link>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'all', label: 'すべて' },
                { key: 'active', label: '出品中' },
                { key: 'sold', label: '売却済み' },
                { key: 'draft', label: '下書き' },
                { key: 'inactive', label: '停止中' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as StatusTab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({getTabCount(tab.key as StatusTab)})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600">読み込み中...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-medium text-gray-900">
              {activeTab === 'all' ? '出品した商品がありません' : `${getStatusLabel(activeTab)}の商品がありません`}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              ドレスを出品して、ここで管理しましょう
            </p>
            <div className="mt-6">
              <Link href="/sell" className="btn-primary">
                新規出品
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start gap-6">
                  {/* 商品画像 */}
                  <div className="flex-shrink-0 w-24 h-24 relative">
                    <Link href={`/products/${listing.dress.id}`}>
                      <Image
                        src={listing.dress.images[0]}
                        alt={listing.dress.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </Link>
                  </div>
                  
                  {/* 商品情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link 
                          href={`/products/${listing.dress.id}`}
                          className="block hover:text-primary transition-colors"
                        >
                          <h3 className="font-semibold text-gray-900 text-lg truncate">
                            {listing.dress.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          {listing.dress.brand} • サイズ {listing.dress.size}
                        </p>
                        <p className="text-lg font-bold text-primary mt-2">
                          ¥{listing.dress.price.toLocaleString()}
                        </p>
                      </div>
                      
                      {/* ステータスバッジ */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(listing.status)}`}>
                        {getStatusLabel(listing.status)}
                      </span>
                    </div>
                    
                    {/* 統計情報 */}
                    <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{listing.views} 閲覧</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{listing.inquiries} 問い合わせ</span>
                      </div>
                      <span>出品日: {formatDate(listing.createdAt)}</span>
                    </div>
                  </div>
                  
                  {/* アクションボタン */}
                  <div className="flex flex-col gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      <Edit className="w-4 h-4" />
                      編集
                    </button>
                    
                    {listing.status === 'active' && (
                      <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                        <Package className="w-4 h-4" />
                        停止
                      </button>
                    )}
                    
                    {listing.status === 'inactive' && (
                      <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-white border border-primary rounded-md hover:bg-primary/5 transition-colors">
                        <RotateCcw className="w-4 h-4" />
                        再出品
                      </button>
                    )}
                    
                    {listing.status === 'draft' && (
                      <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-white border border-primary rounded-md hover:bg-primary/5 transition-colors">
                        <Package className="w-4 h-4" />
                        公開
                      </button>
                    )}
                    
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}