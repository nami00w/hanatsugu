'use client'

import { useEffect, useState } from 'react'
import { useFavorites } from '@/hooks/useFavorites'
import DressCard from '@/components/DressCard'
import Header from '@/components/Header'
import AuthGuard from '@/components/AuthGuard'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// ダミーデータ（実際のアプリでは API から取得）
// ProductList.tsxと同じデータ構造に統一
const dressesData = [
  {
    id: "1",
    brand: "VERA WANG",
    model: "Liesel",
    size: "9号",
    price: 128000,
    originalPrice: 380000,
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0801ba5fe65?w=800&h=1200",
    condition: "未使用に近い"
  },
  {
    id: "2",
    brand: "Pronovias",
    model: "Draco",
    size: "11号",
    price: 95000,
    originalPrice: 280000,
    imageUrl: "https://images.unsplash.com/photo-1525258801829-654deb0e0a5e?w=800&h=1200",
    condition: "目立った傷や汚れなし"
  },
  {
    id: "3",
    brand: "ANTONIO RIVA",
    model: "Gemma",
    size: "7号",
    price: 168000,
    originalPrice: 420000,
    imageUrl: "https://images.unsplash.com/photo-1606800052052-a3b87400edf4?w=800&h=1200",
    condition: "新品・未使用"
  },
  {
    id: "4",
    brand: "Temperley London",
    model: "Iris",
    size: "9号",
    price: 145000,
    originalPrice: 350000,
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0801ba5fe65?w=800&h=1200",
    condition: "やや傷や汚れあり"
  },
  {
    id: "5",
    brand: "JENNY PACKHAM",
    model: "Hermione",
    size: "13号",
    price: 198000,
    originalPrice: 480000,
    imageUrl: "https://images.unsplash.com/photo-1525258801829-654deb0e0a5e?w=800&h=1200",
    condition: "未使用に近い"
  }
]

export default function FavoritesPage() {
  const { favorites, favoritesCount } = useFavorites()
  const [favoriteDresses, setFavoriteDresses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFavoriteDresses = async () => {
      if (favorites.length === 0) {
        setFavoriteDresses([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Supabaseから実際のお気に入り商品データを取得
        const { data: listings, error } = await supabase
          .from('listings')
          .select('*')
          .in('id', favorites)
          .eq('status', 'published')

        if (error) {
          console.error('お気に入り商品取得エラー:', error)
          setFavoriteDresses([])
          return
        }
        
        // DressCardに渡すための形式に変換
        const formattedDresses = listings?.map(listing => ({
          id: listing.id,
          brand: listing.brand,
          model: listing.title,
          size: listing.size,
          price: listing.price,
          originalPrice: listing.original_price,
          imageUrl: listing.images?.[0] || '',
          condition: listing.condition
        })) || []

        setFavoriteDresses(formattedDresses)
      } catch (error) {
        console.error('お気に入り取得エラー:', error)
        setFavoriteDresses([])
      } finally {
        setLoading(false)
      }
    }

    fetchFavoriteDresses()
  }, [favorites, favoritesCount])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
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
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-lg text-gray-600">読み込み中...</div>
            </div>
          ) : favoriteDresses.length > 0 ? (
            <div className="dress-grid">
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
                  condition={(dress as any).condition}
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
                className="btn-primary"
              >
                ドレスを探す
              </Link>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}