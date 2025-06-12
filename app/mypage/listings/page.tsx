'use client'

import { useState, useEffect } from 'react'
import { Package, ArrowLeft, Edit, Trash2, Eye, MessageCircle, RotateCcw, Play, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { dressesAPI } from '@/lib/supabase'
import type { MyListing } from '@/lib/types'
import Header from '@/components/Header'

type StatusTab = 'all' | 'active' | 'sold' | 'draft' | 'inactive'

export default function MyListingsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [myListings, setMyListings] = useState<MyListing[]>([])
  const [activeTab, setActiveTab] = useState<StatusTab>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [showStopModal, setShowStopModal] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // 実際のデータベースから出品データを取得（エラー時はダミーデータを使用）
  useEffect(() => {
    const loadUserDresses = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const dresses = await dressesAPI.getUserDresses(user.id)
        
        // Dress型をMyListing型に変換
        const listings: MyListing[] = dresses.map(dress => ({
          id: dress.id,
          status: dress.status === 'published' ? 'active' : dress.status,
          createdAt: dress.created_at,
          views: 0, // TODO: 実際の閲覧数をトラッキングする仕組みを実装
          inquiries: 0, // TODO: 実際の問い合わせ数をトラッキングする仕組みを実装
          dress: dress
        }))
        
        setMyListings(listings)
      } catch (error) {
        console.error('Failed to load user dresses:', error)
        
        // データベース接続に問題がある場合、開発用のダミーデータを表示
        console.log('Using fallback dummy data for development')
        const dummyListings: MyListing[] = [
          {
            id: 'demo-listing-1',
            status: 'active',
            createdAt: '2024-01-15T10:00:00Z',
            views: 42,
            inquiries: 3,
            dress: {
              id: 'demo-dress-1',
              title: 'Vera Wang プリンセスライン ウェディングドレス',
              description: '一度着用のみの美品です。',
              price: 180000,
              original_price: 350000,
              images: ['https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=400&h=600&fit=crop'],
              size: 'M',
              brand: 'Vera Wang',
              condition: '未使用に近い',
              color: 'ホワイト',
              category: 'プリンセスライン',
              seller_id: user.id,
              owner_history: '1人目（新品購入）',
              status: 'published',
              created_at: '2024-01-15T10:00:00Z',
              updated_at: '2024-01-15T10:00:00Z'
            }
          },
          {
            id: 'demo-listing-2',
            status: 'sold',
            createdAt: '2024-01-10T14:30:00Z',
            views: 89,
            inquiries: 7,
            dress: {
              id: 'demo-dress-2',
              title: 'Carolina Herrera マーメイドライン',
              description: '結婚式で1回着用しました。',
              price: 220000,
              original_price: 400000,
              images: ['https://images.unsplash.com/photo-1565378781267-616ed0977ce5?w=400&h=600&fit=crop'],
              size: 'S',
              brand: 'Carolina Herrera',
              condition: '目立った傷や汚れなし',
              color: 'アイボリー',
              category: 'マーメイドライン',
              seller_id: user.id,
              owner_history: '1人目（新品購入）',
              status: 'sold',
              created_at: '2024-01-10T14:30:00Z',
              updated_at: '2024-01-20T16:45:00Z'
            }
          },
          {
            id: 'demo-listing-3',
            status: 'draft',
            createdAt: '2024-01-20T09:15:00Z',
            views: 0,
            inquiries: 0,
            dress: {
              id: 'demo-dress-3',
              title: 'TAKAMI BRIDAL Aライン ウェディングドレス',
              description: '写真撮影のみ使用。',
              price: 150000,
              original_price: 280000,
              images: ['https://images.unsplash.com/photo-1522653216850-4f1415a174fb?w=400&h=600&fit=crop'],
              size: 'L',
              brand: 'TAKAMI BRIDAL',
              condition: '新品・未使用',
              color: 'ホワイト',
              category: 'Aライン',
              seller_id: user.id,
              owner_history: '1人目（新品購入）',
              status: 'draft',
              created_at: '2024-01-20T09:15:00Z',
              updated_at: '2024-01-20T09:15:00Z'
            }
          }
        ]
        
        setMyListings(dummyListings)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserDresses()
  }, [isAuthenticated, user])

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

  // 編集ページへ遷移
  const handleEdit = (listingId: string) => {
    router.push(`/sell/edit/${listingId}`)
  }

  // 商品停止/再開
  const handleToggleStatus = async (listingId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'published'
    setActionLoading(listingId)
    
    try {
      const success = await dressesAPI.updateDress(listingId, { status: newStatus })
      
      if (success) {
        setMyListings(prev => prev.map(listing => 
          listing.id === listingId 
            ? { ...listing, status: newStatus === 'published' ? 'active' : 'inactive' }
            : listing
        ))
        setShowStopModal(null)
      } else {
        alert('ステータスの更新に失敗しました')
      }
    } catch (error) {
      console.error('Status update error:', error)
      alert('ステータスの更新に失敗しました')
    } finally {
      setActionLoading(null)
    }
  }

  // 商品削除
  const handleDelete = async (listingId: string) => {
    setActionLoading(listingId)
    
    try {
      const success = await dressesAPI.deleteDress(listingId)
      
      if (success) {
        setMyListings(prev => prev.filter(listing => listing.id !== listingId))
        setShowDeleteModal(null)
      } else {
        alert('削除に失敗しました')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('削除に失敗しました')
    } finally {
      setActionLoading(null)
    }
  }

  // 下書きを公開
  const handlePublish = async (listingId: string) => {
    setActionLoading(listingId)
    
    try {
      const success = await dressesAPI.updateDress(listingId, { status: 'published' })
      
      if (success) {
        setMyListings(prev => prev.map(listing => 
          listing.id === listingId 
            ? { ...listing, status: 'active' }
            : listing
        ))
      } else {
        alert('公開に失敗しました')
      }
    } catch (error) {
      console.error('Publish error:', error)
      alert('公開に失敗しました')
    } finally {
      setActionLoading(null)
    }
  }

  if (!isAuthenticated) {
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
    <>
      <Header />
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
          
          <Link href="/sell" className="btn btn-primary">
            新規出品
          </Link>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex overflow-x-auto scrollbar-hide px-6">
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
                  className={`py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
                    activeTab === tab.key
                      ? 'border-b-2 border-[var(--primary-green)] text-[var(--primary-green)] bg-[var(--primary-green)]/5'
                      : 'border-transparent text-[var(--neutral-600)] hover:text-[var(--neutral-800)] hover:border-[var(--neutral-300)] hover:bg-[var(--neutral-100)]'
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
              <Link href="/sell" className="btn btn-primary">
                新規出品
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* デスクトップ版 */}
            <div className="hidden md:block space-y-4">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-6">
                    {/* 商品画像 */}
                    <div className="flex-shrink-0 w-24 h-24 relative">
                      <Link href={`/products/${listing.dress.id}`} className="block rounded-lg overflow-hidden hover:opacity-90 transition-opacity">
                        <Image
                          src={listing.dress.images[0]}
                          alt={listing.dress.title}
                          fill
                          className="object-cover"
                        />
                      </Link>
                    </div>
                    
                    {/* 商品情報 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link 
                            href={`/products/${listing.dress.id}`}
                            className="block hover:text-[var(--primary-green)] transition-colors"
                          >
                            <h3 className="font-semibold text-gray-900 text-lg truncate">
                              {listing.dress.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-600 mt-1">
                            {listing.dress.brand} • サイズ {listing.dress.size}
                          </p>
                          <p className="text-lg font-bold text-[var(--primary-green)] mt-2">
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
                    <div className="flex flex-col gap-[var(--space-2)]">
                      <button 
                        onClick={() => handleEdit(listing.id)}
                        disabled={actionLoading === listing.id}
                        className="btn btn-sm btn-primary"
                      >
                        <Edit className="w-4 h-4" />
                        編集
                      </button>
                      
                      {listing.status === 'active' && (
                        <button 
                          onClick={() => setShowStopModal(listing.id)}
                          disabled={actionLoading === listing.id}
                          className="btn btn-sm bg-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/90 text-white"
                        >
                          <Package className="w-4 h-4" />
                          停止
                        </button>
                      )}
                      
                      {listing.status === 'inactive' && (
                        <button 
                          onClick={() => handleToggleStatus(listing.id, listing.status)}
                          disabled={actionLoading === listing.id}
                          className="btn btn-sm bg-[var(--primary-green-light)] hover:bg-[var(--primary-green)] text-white"
                        >
                          <Play className="w-4 h-4" />
                          再開
                        </button>
                      )}
                      
                      {listing.status === 'draft' && (
                        <button 
                          onClick={() => handlePublish(listing.id)}
                          disabled={actionLoading === listing.id}
                          className="btn btn-sm bg-[var(--primary-green-light)] hover:bg-[var(--primary-green)] text-white"
                        >
                          <Play className="w-4 h-4" />
                          公開
                        </button>
                      )}
                      
                      <button 
                        onClick={() => setShowDeleteModal(listing.id)}
                        disabled={actionLoading === listing.id}
                        className="btn btn-sm bg-[var(--neutral-500)] hover:bg-[var(--neutral-600)] text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* モバイル版 */}
            <div className="md:hidden space-y-4">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  {/* 画像と基本情報 */}
                  <div className="flex gap-4 mb-4">
                    <div className="flex-shrink-0 w-20 h-20 relative">
                      <Link href={`/products/${listing.dress.id}`} className="block rounded-lg overflow-hidden">
                        <Image
                          src={listing.dress.images[0]}
                          alt={listing.dress.title}
                          fill
                          className="object-cover"
                        />
                      </Link>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/products/${listing.dress.id}`}
                        className="block hover:text-[var(--primary-green)] transition-colors"
                      >
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                          {listing.dress.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-600 mb-1">
                        {listing.dress.brand} • {listing.dress.size}
                      </p>
                      <p className="text-lg font-bold text-[var(--primary-green)]">
                        ¥{listing.dress.price.toLocaleString()}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusStyle(listing.status)}`}>
                        {getStatusLabel(listing.status)}
                      </span>
                    </div>
                  </div>
                  
                  {/* 統計情報 */}
                  <div className="flex justify-around text-center mb-4 py-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">閲覧</p>
                      <p className="font-semibold text-sm">{listing.views}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">お気に入り</p>
                      <p className="font-semibold text-sm">0</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">問い合わせ</p>
                      <p className="font-semibold text-sm">{listing.inquiries}</p>
                    </div>
                  </div>
                  
                  {/* アクションボタン */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(listing.id)}
                      disabled={actionLoading === listing.id}
                      className="btn btn-primary flex-1"
                    >
                      編集
                    </button>
                    
                    {listing.status === 'active' && (
                      <button 
                        onClick={() => setShowStopModal(listing.id)}
                        disabled={actionLoading === listing.id}
                        className="btn flex-1 bg-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/90 text-white"
                      >
                        停止
                      </button>
                    )}
                    
                    {listing.status === 'inactive' && (
                      <button 
                        onClick={() => handleToggleStatus(listing.id, listing.status)}
                        disabled={actionLoading === listing.id}
                        className="btn flex-1 bg-[var(--primary-green-light)] hover:bg-[var(--primary-green)] text-white"
                      >
                        再開
                      </button>
                    )}
                    
                    {listing.status === 'draft' && (
                      <button 
                        onClick={() => handlePublish(listing.id)}
                        disabled={actionLoading === listing.id}
                        className="btn flex-1 bg-[var(--primary-green-light)] hover:bg-[var(--primary-green)] text-white"
                      >
                        公開
                      </button>
                    )}
                    
                    <button 
                      onClick={() => setShowDeleteModal(listing.id)}
                      disabled={actionLoading === listing.id}
                      className="btn flex-1 bg-[var(--neutral-500)] hover:bg-[var(--neutral-600)] text-white"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {/* 停止確認モーダル */}
        {showStopModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">商品を停止しますか？</h3>
                  <p className="text-sm text-gray-600 mt-1">停止すると商品は検索結果に表示されなくなります</p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowStopModal(null)}
                  className="btn btn-ghost"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleToggleStatus(showStopModal, 'active')}
                  disabled={actionLoading === showStopModal}
                  className="btn bg-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/90 text-white"
                >
                  停止する
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 削除確認モーダル */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">商品を削除しますか？</h3>
                  <p className="text-sm text-gray-600 mt-1">この操作は取り消せません。本当に削除しますか？</p>
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-gray-700">
                  ⚠️ 削除されたデータは復元できません
                </p>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="btn btn-ghost"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  disabled={actionLoading === showDeleteModal}
                  className="btn bg-[var(--neutral-500)] hover:bg-[var(--neutral-600)] text-white"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}