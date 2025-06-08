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

    const newFilters: FilterState = {
      priceRange: [
        minPrice ? parseInt(minPrice) : 0,
        maxPrice ? parseInt(maxPrice) : 1000000
      ],
      sizes: sizes ? sizes.split(',').filter(s => s) : [],
      conditions: conditions ? conditions.split(',').filter(c => c) : []
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
      <section className="relative bg-gradient-to-br from-pink-50 via-white to-purple-50 py-20 sm:py-32">
        {/* 装飾的な背景要素 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 sm:text-6xl lg:text-7xl">
              大切なドレスに、<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                次の物語を
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 sm:text-xl lg:text-2xl">
              あなたの特別な一着が、次の花嫁の特別な一日を彩ります
            </p>
            
            {/* 検索バーを中央に統合 */}
            <div className="mt-12 max-w-2xl mx-auto">
              <SearchBar />
              
              {/* 詳細フィルターボタン */}
              <div className="mt-6">
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 border border-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
