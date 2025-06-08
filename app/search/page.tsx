'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import SearchBar from '@/components/SearchBar'
import { FilterState } from '@/components/ProductFilter'
import ProductList from '@/components/ProductList'

// Dynamic rendering を強制
export const dynamic = 'force-dynamic'

// 詳細フィルターの定義
interface DetailedFilters {
  category: string[]
  brand: string[]
  size: string[]
  status: string[]
  priceRange: [number, number]
  condition: string[]
  color: string[]
  format: string[]
  shipping: string[]
}

const FILTER_OPTIONS = {
  category: ['ウェディングドレス', 'カラードレス', 'アクセサリー', 'ヴェール', 'シューズ'],
  brand: ['VERA WANG', 'Pronovias', 'ANTONIO RIVA', 'Temperley London', 'JENNY PACKHAM'],
  size: ['XS', 'S', 'M', 'L', 'XL', '5号', '7号', '9号', '11号', '13号', '15号'],
  status: ['販売中', '売り切れ', '予約販売'],
  condition: ['新品・未使用', '未使用に近い', '目立った傷や汚れなし', 'やや傷や汚れあり'],
  color: ['ホワイト', 'オフホワイト', 'アイボリー', 'シャンパン', 'ピンク', 'ブルー'],
  format: ['即決価格', 'オークション', '価格交渉可'],
  shipping: ['送料込み', '送料別', '着払い', '手渡し']
}

// useSearchParamsを使用するコンポーネントを分離
function SearchContent() {
  const searchParams = useSearchParams()
  
  const [detailedFilters, setDetailedFilters] = useState<DetailedFilters>({
    category: [],
    brand: [],
    size: [],
    status: [],
    priceRange: [0, 1000000],
    condition: [],
    color: [],
    format: [],
    shipping: []
  })

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    brand: true,
    size: false,
    status: false,
    price: false,
    condition: false,
    color: false,
    format: false,
    shipping: false
  })

  const [sortBy, setSortBy] = useState('おすすめ順')

  // URLパラメータから初期値を設定
  useEffect(() => {
    const brand = searchParams.get('brand')
    const size = searchParams.get('size')
    const maxPrice = searchParams.get('maxPrice')

    if (brand) setDetailedFilters(prev => ({ ...prev, brand: [brand] }))
    if (size) setDetailedFilters(prev => ({ ...prev, size: [size] }))
    if (maxPrice) setDetailedFilters(prev => ({ ...prev, priceRange: [0, parseInt(maxPrice)] }))
  }, [searchParams])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const toggleFilter = (category: keyof DetailedFilters, value: string) => {
    if (category === 'priceRange') return

    setDetailedFilters(prev => {
      const currentValues = prev[category] as string[]
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      
      return { ...prev, [category]: newValues }
    })
  }

  const clearAllFilters = () => {
    setDetailedFilters({
      category: [],
      brand: [],
      size: [],
      status: [],
      priceRange: [0, 1000000],
      condition: [],
      color: [],
      format: [],
      shipping: []
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    Object.entries(detailedFilters).forEach(([key, value]) => {
      if (key === 'priceRange') {
        if (value[0] > 0 || value[1] < 1000000) count++
      } else if (Array.isArray(value) && value.length > 0) {
        count += value.length
      }
    })
    return count
  }

  const getSelectedFilterTags = () => {
    const tags: { category: string, value: string }[] = []
    Object.entries(detailedFilters).forEach(([category, values]) => {
      if (category === 'priceRange') {
        const [min, max] = values as [number, number]
        if (min > 0 || max < 1000000) {
          tags.push({ category, value: `¥${min.toLocaleString()} - ¥${max.toLocaleString()}` })
        }
      } else if (Array.isArray(values)) {
        values.forEach(value => {
          tags.push({ category, value })
        })
      }
    })
    return tags
  }

  // ProductListで使用するためのフィルター変換
  const convertToFilterState = (): FilterState => {
    return {
      priceRange: detailedFilters.priceRange,
      sizes: detailedFilters.size,
      conditions: detailedFilters.condition
    }
  }

  // const handleSearch = () => {
  //   // 検索処理（現在のページを更新）
  //   console.log('検索実行:', detailedFilters)
  // }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50">
        {/* 検索バー */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <SearchBar />
          </div>
        </section>

        {/* メインコンテンツ */}
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 xl:px-12 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 左サイドバー - フィルター */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">フィルター</h2>
                  {getActiveFilterCount() > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-pink-600 hover:text-pink-800"
                    >
                      すべてクリア
                    </button>
                  )}
                </div>

                {/* フィルター項目 */}
                {Object.entries(FILTER_OPTIONS).map(([key, options]) => (
                  <div key={key} className="mb-6">
                    <button
                      onClick={() => toggleSection(key)}
                      className="flex items-center justify-between w-full text-left mb-3"
                    >
                      <h3 className="text-sm font-medium text-gray-900">
                        {key === 'category' && 'カテゴリー'}
                        {key === 'brand' && 'ブランド'}
                        {key === 'size' && 'サイズ'}
                        {key === 'status' && '販売状況'}
                        {key === 'condition' && '商品の状態'}
                        {key === 'color' && '色'}
                        {key === 'format' && '出品形式'}
                        {key === 'shipping' && '発送オプション'}
                      </h3>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          expandedSections[key] ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {expandedSections[key] && (
                      <div className="space-y-2">
                        {options.map((option) => (
                          <label key={option} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={(detailedFilters[key as keyof DetailedFilters] as string[]).includes(option)}
                              onChange={() => toggleFilter(key as keyof DetailedFilters, option)}
                              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500 mr-2"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 右側 - 商品一覧 */}
            <div className="flex-1">
              {/* ソート・フィルタータグ */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-sm border border-gray-300 rounded px-3 py-1"
                    >
                      <option>おすすめ順</option>
                      <option>価格の安い順</option>
                      <option>価格の高い順</option>
                      <option>新着順</option>
                    </select>
                    
                    {getActiveFilterCount() > 0 && (
                      <span className="text-sm text-gray-600">
                        {getActiveFilterCount()}件のフィルターを適用中
                      </span>
                    )}
                  </div>
                </div>
                
                {/* 選択中のフィルタータグ */}
                {getSelectedFilterTags().length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {getSelectedFilterTags().map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full"
                      >
                        {tag.value}
                        <button
                          onClick={() => toggleFilter(tag.category as keyof DetailedFilters, tag.value.split(' - ')[0])}
                          className="ml-1 text-pink-600 hover:text-pink-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 商品一覧 */}
              <ProductList filters={convertToFilterState()} />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

// メインのSearchPageコンポーネント
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}