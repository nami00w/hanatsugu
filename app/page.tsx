'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FilterState } from '@/components/ProductFilter'
import ProductList from '@/components/ProductList'
import MobileFilterModal from '@/components/MobileFilterModal'
import Header from '@/components/Header'
import SearchBar from '@/components/SearchBar'

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
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              大切なドレスに、次の物語を
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              あなたの特別な一着が、次の花嫁の特別な一日を彩ります
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 md:py-4 md:text-lg md:px-10">
                  ドレスを探す
                </button>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link href="/sell" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-pink-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                  ドレスを出品
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 検索バーセクション */}
      <section className="bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar />
          
          {/* 詳細フィルターボタン */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              詳細フィルター
            </button>
          </div>
        </div>
      </section>

      {/* 商品一覧セクション */}
      <section className="py-8">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 xl:px-12">
          <ProductList filters={filters} />
        </div>
      </section>

      {/* 価格帯セクション（簡略化） */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            人気の価格帯
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { price: "〜10万円", count: "234" },
              { price: "10〜20万円", count: "456" },
              { price: "20〜30万円", count: "189" },
              { price: "30万円〜", count: "87" },
            ].map((category) => (
              <div
                key={category.price}
                className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer"
              >
                <p className="text-2xl font-bold text-gray-900">{category.price}</p>
                <p className="text-sm text-gray-500 mt-2">{category.count}着</p>
              </div>
            ))}
          </div>
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
