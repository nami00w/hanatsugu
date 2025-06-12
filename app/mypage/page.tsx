'use client'

import { useState, useEffect } from 'react'
import { User, Heart, Eye, Package, Settings, Clock, List, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { useFavorites } from '@/hooks/useFavorites'
import type { UserStats, ViewHistoryItem, MyListing } from '@/lib/types'

export default function MyPage() {
  const { isLoggedIn, favoritesCount } = useFavorites()
  const [userStats, setUserStats] = useState<UserStats>({
    listingsCount: 0,
    favoritesCount: 0,
    viewHistoryCount: 0,
    totalViews: 0,
    totalInquiries: 0
  })

  // ダミーユーザー情報
  const dummyUser = {
    name: '田中花子',
    email: 'hanako@example.com',
    avatar: '/api/placeholder/80/80',
    joinDate: '2024年1月',
    totalSales: 12,
    rating: 4.8
  }

  useEffect(() => {
    if (!isLoggedIn) return

    // localStorage から統計情報を取得
    const viewHistory: ViewHistoryItem[] = JSON.parse(localStorage.getItem('viewHistory') || '[]')
    const myListings: MyListing[] = JSON.parse(localStorage.getItem('myListings') || '[]')
    
    // 統計情報を計算
    const totalViews = myListings.reduce((sum, listing) => sum + listing.views, 0)
    const totalInquiries = myListings.reduce((sum, listing) => sum + listing.inquiries, 0)
    
    setUserStats({
      listingsCount: myListings.length,
      favoritesCount,
      viewHistoryCount: viewHistory.length,
      totalViews,
      totalInquiries
    })
  }, [isLoggedIn, favoritesCount])

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-medium text-gray-900">ログインが必要です</h2>
            <p className="mt-2 text-sm text-gray-600">
              マイページを表示するにはログインしてください
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
      {/* ヘッダー */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{dummyUser.name}</h1>
              <p className="text-sm text-gray-600">{dummyUser.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                {dummyUser.joinDate}から利用 • 評価 ⭐ {dummyUser.rating} • 取引完了 {dummyUser.totalSales}件
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
                  <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md w-full text-left">
                    <Settings className="w-4 h-4" />
                    設定
                  </button>
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
                <Eye className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{userStats.totalViews}</p>
                <p className="text-xs text-gray-600">総閲覧数</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <Clock className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{userStats.viewHistoryCount}</p>
                <p className="text-xs text-gray-600">閲覧履歴</p>
              </div>
            </div>

            {/* クイックアクセスメニュー */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">クイックアクセス</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                
                <button className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left">
                  <Settings className="w-6 h-6 text-primary mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">アカウント設定</h3>
                  <p className="text-sm text-gray-600">プロフィール・通知設定</p>
                </button>
                
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

            {/* モバイル版ナビゲーション */}
            <div className="lg:hidden">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">メニュー</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/mypage/listings"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    <Package className="w-4 h-4" />
                    出品管理
                  </Link>
                  <Link
                    href="/favorites"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    <Heart className="w-4 h-4" />
                    お気に入り
                  </Link>
                  <Link
                    href="/mypage/history"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    <Clock className="w-4 h-4" />
                    閲覧履歴
                  </Link>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-left">
                    <Settings className="w-4 h-4" />
                    設定
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}