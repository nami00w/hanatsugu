'use client'

import { useState, useEffect } from 'react'
import DressCard from './DressCard'
import { FilterState } from './ProductFilter'
import { supabase } from '@/lib/supabase'
import type { Dress } from '@/lib/types'

// フォールバック用ダミーデータ
const fallbackProducts = [
  { 
    id: "1", 
    brand: "VERA WANG", 
    model: "Liesel", 
    size: "9号", 
    price: 128000, 
    originalPrice: 380000, 
    condition: "未使用に近い",
    imageUrl: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
  },
  { 
    id: "2", 
    brand: "Pronovias", 
    model: "Draco", 
    size: "11号", 
    price: 95000, 
    originalPrice: 280000, 
    condition: "未使用に近い",
    imageUrl: "https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
  },
  { 
    id: "3", 
    brand: "ANTONIO RIVA", 
    model: "Gemma", 
    size: "7号", 
    price: 168000, 
    originalPrice: 420000, 
    condition: "未使用に近い",
    imageUrl: "https://images.unsplash.com/photo-1518136247453-74e7b5265980?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
  },
  { 
    id: "4", 
    brand: "Temperley London", 
    model: "Iris", 
    size: "9号", 
    price: 145000, 
    originalPrice: 350000, 
    condition: "未使用に近い",
    imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
  },
  { 
    id: "5", 
    brand: "JENNY PACKHAM", 
    model: "Hermione", 
    size: "13号", 
    price: 198000, 
    originalPrice: 480000, 
    condition: "未使用に近い",
    imageUrl: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
  },
  { 
    id: "6", 
    brand: "Marchesa", 
    model: "Grecian", 
    size: "9号", 
    price: 178000, 
    originalPrice: 450000, 
    condition: "未使用に近い",
    imageUrl: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
  },
  { 
    id: "7", 
    brand: "Oscar de la Renta", 
    model: "Botanical", 
    size: "7号", 
    price: 85000, 
    originalPrice: 250000, 
    condition: "目立った傷や汚れなし",
    imageUrl: "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
  },
  { 
    id: "8", 
    brand: "Monique Lhuillier", 
    model: "Swan", 
    size: "S", 
    price: 220000, 
    originalPrice: 550000, 
    condition: "新品・未使用",
    imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
  },
  { 
    id: "9", 
    brand: "Carolina Herrera", 
    model: "Grace", 
    size: "M", 
    price: 135000, 
    originalPrice: 320000, 
    condition: "やや傷や汚れあり",
    imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
  },
  { 
    id: "10", 
    brand: "Elie Saab", 
    model: "Dream", 
    size: "L", 
    price: 195000, 
    originalPrice: 480000, 
    condition: "未使用に近い",
    imageUrl: "https://images.unsplash.com/photo-1495298599282-d8920eb5009b?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
  },
  { 
    id: "11", 
    brand: "Reem Acra", 
    model: "Enchanted", 
    size: "XS", 
    price: 75000, 
    originalPrice: 180000, 
    condition: "目立った傷や汚れなし",
    imageUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
  },
  { 
    id: "12", 
    brand: "Hayley Paige", 
    model: "Cosmos", 
    size: "15号", 
    price: 110000, 
    originalPrice: 280000, 
    condition: "未使用に近い",
    imageUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
  },
]

interface ProductListProps {
  filters: FilterState
}

export default function ProductList({ filters }: ProductListProps) {
  const [products, setProducts] = useState<Dress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Supabaseからデータを取得
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(50)

        if (fetchError) {
          console.error('商品データ取得エラー:', fetchError)
          // エラー時はフォールバックデータを使用
          setProducts(fallbackProducts.map(p => ({
            ...p,
            id: p.id,
            title: `${p.brand} ${p.model}`,
            description: '',
            images: [p.imageUrl],
            category: 'mermaid',
            seller_id: 'dummy',
            owner_history: 'first',
            status: 'published' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            color: '白',
            original_price: p.originalPrice
          })))
          setError('商品データの読み込みに失敗しました（フォールバックデータを表示中）')
        } else {
          setProducts(data || [])
          setError(null)
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setProducts(fallbackProducts.map(p => ({
          ...p,
          id: p.id,
          title: `${p.brand} ${p.model}`,
          description: '',
          images: [p.imageUrl],
          category: 'mermaid',
          seller_id: 'dummy',
          owner_history: 'first',
          status: 'published' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          color: '白',
          original_price: p.originalPrice
        })))
        setError('予期しないエラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = products.filter(product => {
    // ブランドフィルター
    if (filters.brand && product.brand.toLowerCase() !== filters.brand.toLowerCase()) {
      return false
    }

    // 価格フィルター
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
      return false
    }

    // サイズフィルター
    if (filters.sizes.length > 0 && !filters.sizes.includes(product.size)) {
      return false
    }

    // 状態フィルター
    if (filters.conditions.length > 0 && !filters.conditions.includes(product.condition)) {
      return false
    }

    return true
  })

  // ローディング状態の表示
  if (loading) {
    return (
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">商品一覧</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="w-full h-72 bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">{error}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          商品一覧
        </h2>
        <div className="text-sm text-gray-600">
          {filteredProducts.length}件の商品が見つかりました
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">商品が見つかりませんでした</h3>
          <p className="text-gray-500">フィルターを調整してもう一度お試しください</p>
        </div>
      ) : (
        <div className="dynamic-grid">
          {filteredProducts.map((product) => (
            <DressCard
              key={product.id}
              id={product.id}
              brand={product.brand}
              model={product.model_name || (product as any).model}
              title={product.title}
              size={product.size}
              price={product.price}
              originalPrice={product.original_price || (product as any).originalPrice}
              imageUrl={(product as any).imageUrl}
              images={product.images}
            />
          ))}
        </div>
      )}
    </div>
  )
}