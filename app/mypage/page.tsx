'use client'

import { useState, useEffect } from 'react'
import { User, Heart, Eye, Package, Settings, Clock, List, DollarSign, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import AuthGuard from '@/components/AuthGuard'
import { useFavorites } from '@/hooks/useFavorites'
import { useAuth } from '@/contexts/AuthContext'
import { dressesAPI, salesAPI, bankAccountAPI, type Sale, type BankAccount } from '@/lib/supabase'
import type { UserStats, ViewHistoryItem, MyListing } from '@/lib/types'

export default function MyPage() {
  const { favoritesCount } = useFavorites()
  const { user } = useAuth()
  const [userStats, setUserStats] = useState<UserStats>({
    listingsCount: 0,
    favoritesCount: 0,
    viewHistoryCount: 0,
    totalViews: 0,
    totalInquiries: 0
  })
  const [salesBalance, setSalesBalance] = useState<number>(0)
  const [recentSales, setRecentSales] = useState<Sale[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')

  // ユーザー情報
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'ユーザー'
  const userEmail = user?.email || ''
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' }) : '2024年1月'
  
  const userInfo = {
    name: displayName,
    email: userEmail,
    avatar: '/api/placeholder/80/80',
    joinDate: joinDate + 'から利用',
    totalSales: 12, // TODO: 実際の取引数を取得
    rating: 4.8 // TODO: 実際の評価を取得
  }

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return
      
      try {
        // 並行してデータを取得
        const [stats, balance, sales, accounts] = await Promise.all([
          dressesAPI.getUserStats(user.id),
          salesAPI.getUserBalance(user.id),
          salesAPI.getRecentSales(user.id, 3),
          bankAccountAPI.getUserBankAccounts(user.id)
        ])
        
        // localStorage から閲覧履歴を取得（軽量）
        const viewHistory: ViewHistoryItem[] = JSON.parse(localStorage.getItem('viewHistory') || '[]')
        
        setUserStats({
          listingsCount: stats.activeListings, // 出品中のみカウント
          favoritesCount,
          viewHistoryCount: viewHistory.length,
          totalViews: 0, // 削除予定
          totalInquiries: 0 // 削除予定
        })
        
        setSalesBalance(balance)
        setRecentSales(sales)
        setBankAccounts(accounts)
      } catch (error) {
        console.error('Failed to load user data:', error)
        // エラー時はお気に入りと閲覧履歴のみ表示
        const viewHistory: ViewHistoryItem[] = JSON.parse(localStorage.getItem('viewHistory') || '[]')
        setUserStats({
          listingsCount: 0,
          favoritesCount,
          viewHistoryCount: viewHistory.length,
          totalViews: 0,
          totalInquiries: 0
        })
      }
    }

    loadUserData()
  }, [favoritesCount, user])

  // 振込申請処理
  const handleWithdraw = async () => {
    if (!user || !bankAccounts.length) return
    
    const amount = parseInt(withdrawAmount)
    if (isNaN(amount) || amount <= 0 || amount > salesBalance) {
      alert('有効な金額を入力してください')
      return
    }
    
    try {
      const defaultAccount = bankAccounts.find(acc => acc.is_default) || bankAccounts[0]
      const withdrawalId = await salesAPI.createWithdrawal(user.id, amount, defaultAccount.id)
      
      if (withdrawalId) {
        alert('振込申請を受け付けました。処理には3-5営業日かかります。')
        setShowWithdrawModal(false)
        setWithdrawAmount('')
        // 残高を再読み込み
        const newBalance = await salesAPI.getUserBalance(user.id)
        setSalesBalance(newBalance)
      } else {
        alert('振込申請に失敗しました。再度お試しください。')
      }
    } catch (error) {
      console.error('Withdrawal error:', error)
      alert('振込申請に失敗しました。再度お試しください。')
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />
        {/* ユーザー情報ヘッダー */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full overflow-hidden">
                {user?.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="プロフィール"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{userInfo.name}</h1>
                <p className="text-sm text-gray-600">{userInfo.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {userInfo.joinDate}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* サイドナビゲーション（PC版） */}
            <div className="hidden lg:block">
              <nav className="bg-white rounded-lg shadow-sm p-6">
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/mypage"
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md"
                    >
                      <User className="w-4 h-4" />
                      ダッシュボード
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/mypage/messages"
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      <MessageSquare className="w-4 h-4" />
                      メッセージ
                      {/* TODO: 未読数バッジ */}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/mypage/listings"
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      <Package className="w-4 h-4" />
                      出品管理
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/favorites"
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      <Heart className="w-4 h-4" />
                      お気に入り
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/mypage/history"
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      <Clock className="w-4 h-4" />
                      閲覧履歴
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/mypage/sales"
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      <DollarSign className="w-4 h-4" />
                      売上管理
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/mypage/settings"
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      <Settings className="w-4 h-4" />
                      設定
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* メインコンテンツ */}
            <div className="lg:col-span-3">
              {/* 統計カード */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                  <Package className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{userStats.listingsCount}</p>
                  <p className="text-xs text-gray-600">出品中</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                  <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{userStats.favoritesCount}</p>
                  <p className="text-xs text-gray-600">お気に入り</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                  <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{userStats.viewHistoryCount}</p>
                  <p className="text-xs text-gray-600">閲覧履歴</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                  <div className="w-6 h-6 text-green-500 mx-auto mb-2 flex items-center justify-center font-bold text-lg">¥</div>
                  <p className="text-2xl font-bold text-green-600">¥{salesBalance.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">売上管理</p>
                </div>
              </div>

              {/* クイックアクセスメニュー */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">クイックアクセス</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link
                    href="/mypage/messages"
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors relative"
                  >
                    <MessageSquare className="w-6 h-6 text-primary mb-2" />
                    <h3 className="font-medium text-gray-900 mb-1">メッセージ</h3>
                    <p className="text-sm text-gray-600">お問い合わせ・連絡</p>
                    {/* TODO: 未読数バッジ */}
                    {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">3</span> */}
                  </Link>
                  
                  <Link
                    href="/sell"
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <Package className="w-6 h-6 text-primary mb-2" />
                    <h3 className="font-medium text-gray-900 mb-1">新規出品</h3>
                    <p className="text-sm text-gray-600">ドレスを出品する</p>
                  </Link>
                  
                  <Link
                    href="/mypage/listings"
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <List className="w-6 h-6 text-primary mb-2" />
                    <h3 className="font-medium text-gray-900 mb-1">出品管理</h3>
                    <p className="text-sm text-gray-600">出品した商品を管理</p>
                  </Link>
                  
                  <Link
                    href="/favorites"
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <Heart className="w-6 h-6 text-primary mb-2" />
                    <h3 className="font-medium text-gray-900 mb-1">お気に入り</h3>
                    <p className="text-sm text-gray-600">気になる商品をチェック</p>
                  </Link>
                  
                  <Link
                    href="/mypage/history"
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <Clock className="w-6 h-6 text-primary mb-2" />
                    <h3 className="font-medium text-gray-900 mb-1">閲覧履歴</h3>
                    <p className="text-sm text-gray-600">最近見た商品</p>
                  </Link>
                  
                  <Link
                    href="/mypage/settings"
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <Settings className="w-6 h-6 text-primary mb-2" />
                    <h3 className="font-medium text-gray-900 mb-1">アカウント設定</h3>
                    <p className="text-sm text-gray-600">プロフィール・通知設定</p>
                  </Link>
                  
                  <Link
                    href="/search"
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <Eye className="w-6 h-6 text-primary mb-2" />
                    <h3 className="font-medium text-gray-900 mb-1">商品を探す</h3>
                    <p className="text-sm text-gray-600">理想のドレスを見つける</p>
                  </Link>
                </div>
              </div>

              {/* 売上管理セクション */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">売上管理</h2>
                  <Link href="/mypage/sales" className="text-sm text-primary hover:text-primary/80 transition-colors">
                    すべての取引を見る →
                  </Link>
                </div>
                
                {/* 現在の売上残高 */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 mb-1">現在の売上残高</p>
                      <p className="text-3xl font-bold text-green-800">¥{salesBalance.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => setShowWithdrawModal(true)}
                      disabled={salesBalance <= 0}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      振込申請
                    </button>
                  </div>
                </div>
                
                {/* 最近の取引履歴 */}
                {recentSales.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">最近の取引</h3>
                    <div className="space-y-3">
                      {recentSales.map((sale) => (
                        <div key={sale.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-gray-900">取引完了</p>
                            <p className="text-xs text-gray-500">
                              {new Date(sale.completed_at || sale.created_at).toLocaleDateString('ja-JP')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">+¥{sale.net_amount.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">手数料込み</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-8 h-8 text-gray-300 mx-auto mb-2 flex items-center justify-center font-bold text-xl">¥</div>
                    <p className="text-sm text-gray-500">まだ売上がありません</p>
                    <p className="text-xs text-gray-400">商品が売れると、ここに履歴が表示されます</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* 振込申請モーダル */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">振込申請</h2>
              
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-700 mb-1">振込可能額</p>
                <p className="text-2xl font-bold text-green-800">¥{salesBalance.toLocaleString()}</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">振込金額</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="振込したい金額を入力"
                    max={salesBalance}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                {bankAccounts.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">振込先口座</label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium">{bankAccounts[0].bank_name} {bankAccounts[0].branch_name}</p>
                      <p className="text-sm text-gray-600">
                        {bankAccounts[0].account_type === 'checking' ? '普通' : '貯蓄'} {bankAccounts[0].account_number}
                      </p>
                      <p className="text-sm text-gray-600">{bankAccounts[0].account_holder}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {bankAccounts.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                  <p className="text-sm text-yellow-800">
                    振込先口座が登録されていません。設定ページで口座を登録してください。
                  </p>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-800">
                  振込は3-5営業日以内に処理されます。
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || parseInt(withdrawAmount) <= 0 || bankAccounts.length === 0}
                  className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  申請する
                </button>
                <button
                  onClick={() => {
                    setShowWithdrawModal(false)
                    setWithdrawAmount('')
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}