'use client'

import { useEffect, useState } from 'react'
import { useFavorites } from '@/hooks/useFavorites'
import DressCard from '@/components/DressCard'
import Link from 'next/link'

// ダミーデータ（実際のアプリでは API から取得）
const dressesData = [
  {
    id: 1,
    brand: "VERA WANG",
    model: "Elegant Mermaid",
    size: "9号",
    price: 180000,
    originalPrice: 350000,
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0801ba5fe65?w=800&h=1200"
  },
  {
    id: 2,
    brand: "Carolina Herrera",
    model: "Classic Ball Gown",
    size: "7号",
    price: 220000,
    originalPrice: 450000,
    imageUrl: "https://images.unsplash.com/photo-1525258801829-654deb0e0a5e?w=800&h=1200"
  },
  {
    id: 3,
    brand: "Monique Lhuillier",
    model: "Romantic A-Line",
    size: "9号",
    price: 160000,
    originalPrice: 320000,
    imageUrl: "https://images.unsplash.com/photo-1606800052052-a3b87400edf4?w=800&h=1200"
  }
]

export default function FavoritesPage() {
  const { favorites, isLoggedIn, favoritesCount } = useFavorites()
  const [favoriteDresses, setFavoriteDresses] = useState<typeof dressesData>([])

  useEffect(() => {
    if (isLoggedIn && favorites.length > 0) {
      // お気に入りのドレスデータを取得
      const filteredDresses = dressesData.filter(dress => 
        favorites.includes(dress.id.toString())
      )
      setFavoriteDresses(filteredDresses)
    } else {
      setFavoriteDresses([])
    }
  }, [favorites, isLoggedIn])

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              お気に入り機能をご利用ください
            </h1>
            <p className="text-gray-600 mb-8">
              ログインして、気になるドレスをお気に入りに追加しましょう
            </p>
            <div className="space-x-4">
              <Link
                href="/auth/login"
                className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                ログイン
              </Link>
              <Link
                href="/auth/signup"
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900">お気に入り</h1>
          </div>
          <p className="text-gray-600">
            {favoritesCount > 0 
              ? `${favoritesCount}件のドレスがお気に入りに登録されています`
              : 'お気に入りのドレスはまだありません'
            }
          </p>
        </div>

        {/* コンテンツ */}
        {favoriteDresses.length > 0 ? (
          <div className="dynamic-grid">
            {favoriteDresses.map((dress) => (
              <DressCard
                key={dress.id}
                id={dress.id}
                brand={dress.brand}
                model={dress.model}
                size={dress.size}
                price={dress.price}
                originalPrice={dress.originalPrice}
                imageUrl={dress.imageUrl}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              お気に入りのドレスはまだありません
            </h2>
            <p className="text-gray-600 mb-6">
              気になるドレスを見つけたら、ハートマークをタップしてお気に入りに追加しましょう
            </p>
            <Link
              href="/"
              className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              ドレスを探す
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}