'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FilterState } from '@/components/ProductFilter'
import ProductList from '@/components/ProductList'
import MobileFilterModal from '@/components/MobileFilterModal'
import Header from '@/components/Header'
import SearchBar from '@/components/SearchBar'
import BrandCarousel from '@/components/BrandCarousel'

// Dynamic rendering を強制
export const dynamic = 'force-dynamic'

// useSearchParamsを使用するコンポーネントを分離
function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000000],
    sizes: [],
    conditions: []
  })

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  // const [searchFilters] = useState<SearchFilters>({
  //   brand: '',
  //   size: '',
  //   maxPrice: ''
  // })

  // URLからフィルター状態を復元
  useEffect(() => {
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sizes = searchParams.get('sizes')
    const conditions = searchParams.get('conditions')
    const brand = searchParams.get('brand')

    const newFilters: FilterState = {
      priceRange: [
        minPrice ? parseInt(minPrice) : 0,
        maxPrice ? parseInt(maxPrice) : 1000000
      ],
      sizes: sizes ? sizes.split(',').filter(s => s) : [],
      conditions: conditions ? conditions.split(',').filter(c => c) : [],
      brand: brand || undefined
    }

    setFilters(newFilters)
  }, [searchParams])

  // フィルター変更時にURLを更新
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)

    // URLパラメータを構築
    const params = new URLSearchParams()
    
    // 価格フィルター
    if (newFilters.priceRange[0] > 0) {
      params.set('minPrice', newFilters.priceRange[0].toString())
    }
    if (newFilters.priceRange[1] < 1000000) {
      params.set('maxPrice', newFilters.priceRange[1].toString())
    }
    
    // サイズフィルター
    if (newFilters.sizes.length > 0) {
      params.set('sizes', newFilters.sizes.join(','))
    }
    
    // 状態フィルター
    if (newFilters.conditions.length > 0) {
      params.set('conditions', newFilters.conditions.join(','))
    }

    // URLを更新（ページリロードなし）
    const newURL = params.toString() ? `?${params.toString()}` : '/'
    router.push(newURL, { scroll: false })
  }

  // 検索実行
  // const handleSearch = (newSearchFilters: SearchFilters) => {
  //   // setSearchFilters(newSearchFilters)
  //   console.log('検索フィルター:', newSearchFilters)
  //   // TODO: 検索ロジックを実装
  // }

  return (
    <>
      {/* ページ固有のヘッダー */}
      <Header />
      
      <main className="min-h-screen bg-gray-50">
      {/* ヒーローセクション */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-green-100 overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="text-center">
            <h1 className="hero-title text-gray-900 font-bold">
              大切なドレスに、<br className="mobile-break" />次の<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">物語</span>を
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-subtitle text-gray-600 leading-relaxed">
              あなたの特別な一着が、次の花嫁の特別な一日を彩ります
            </p>
            
            {/* 検索バー */}
            <div className="mt-12 max-w-3xl mx-auto">
              <SearchBar />
              
              {/* 詳細フィルターボタン */}
              <div className="mt-6">
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="btn-secondary text-sm rounded-full"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  詳細フィルター
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ブランドカルーセルセクション */}
      <BrandCarousel />

      {/* 商品一覧セクション */}
      <section className="py-8" data-section="products">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 xl:px-12">
          <ProductList filters={filters} />
        </div>
      </section>
      
      {/* モバイル用フィルターモーダル */}
      <MobileFilterModal
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />
    </main>
    </>
  );
}

// メインのHomeコンポーネント
export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
