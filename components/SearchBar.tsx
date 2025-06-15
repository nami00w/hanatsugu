'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { searchBrands, getPopularBrands, type Brand } from '@/lib/brandAPI'

export interface SearchFilters {
  brand: string
  size: string
  maxPrice: string
}

// interface SearchBarProps {
//   onSearch: (filters: SearchFilters) => void
// }

const SIZES = [
  { value: '', label: 'サイズを選択' },
  { value: 'XS', label: 'XS (5号・US00-0)' },
  { value: 'S', label: 'S (7号・US0-2)' },
  { value: 'S+', label: 'S (9号・US2-4)' },
  { value: 'M', label: 'M (11号・US6-8)' },
  { value: 'M+', label: 'M (13号・US8-10)' },
  { value: 'L', label: 'L (15号・US10-12)' },
  { value: 'L+', label: 'L (17号・US12-14)' },
  { value: 'XL', label: 'XL (19号・US14-16)' },
  { value: 'XXL', label: 'XXL (21号・US16-18)' }
]
const PRICE_OPTIONS = [
  { value: '', label: '価格上限' },
  { value: '50000', label: '5万円以下' },
  { value: '100000', label: '10万円以下' },
  { value: '200000', label: '20万円以下' },
  { value: '300000', label: '30万円以下' },
  { value: '500000', label: '50万円以下' },
  { value: '1000000', label: '100万円以下' },
]

// 動的にブランドを取得するため、静的なリストは削除

export default function SearchBar() {
  const router = useRouter()
  const brandInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const [filters, setFilters] = useState<SearchFilters>({
    brand: '',
    size: '',
    maxPrice: ''
  })
  
  const [showBrandDropdown, setShowBrandDropdown] = useState(false)
  const [brandSearchResults, setBrandSearchResults] = useState<Brand[]>([])
  const [popularBrands, setPopularBrands] = useState<Brand[]>([])
  const [isSearchingBrands, setIsSearchingBrands] = useState(false)

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    
    // ブランド入力の場合は検索を実行
    if (field === 'brand') {
      handleBrandSearch(value)
    }
  }

  // デバウンス用のタイマー
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ブランド検索（デバウンス付き）
  const handleBrandSearch = async (searchTerm: string) => {
    // 既存のタイマーをクリア
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!searchTerm.trim()) {
      setBrandSearchResults([])
      return
    }

    // デバウンス: 300ms後に検索実行
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearchingBrands(true)
      try {
        const result = await searchBrands(searchTerm.trim(), 10)
        setBrandSearchResults(result.brands)
      } catch (error) {
        console.error('Brand search error:', error)
        setBrandSearchResults([])
      } finally {
        setIsSearchingBrands(false)
      }
    }, 300)
  }

  // 人気ブランドを取得
  useEffect(() => {
    const loadPopularBrands = async () => {
      try {
        const brands = await getPopularBrands(12)
        setPopularBrands(brands)
      } catch (error) {
        console.error('Popular brands fetch error:', error)
      }
    }

    loadPopularBrands()
  }, [])

  // 外部クリックでドロップダウンを閉じる & クリーンアップ
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBrandDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    
    // クリーンアップ関数
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      // タイマーもクリーンアップ
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const handleSearch = () => {
    // /searchページに遷移
    const params = new URLSearchParams()
    if (filters.brand) params.set('brand', filters.brand)
    if (filters.size) params.set('size', filters.size)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    
    const queryString = params.toString()
    router.push(`/search${queryString ? `?${queryString}` : ''}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleBrandSelect = (brand: Brand | string) => {
    const brandName = typeof brand === 'string' ? brand : (brand.japanese_name || brand.canonical_name)
    setFilters(prev => ({ ...prev, brand: brandName }))
    setBrandSearchResults([])
    setShowBrandDropdown(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* モバイル用シンプル検索 */}
      <div className="lg:hidden">
        <div className="flex gap-2">
          <div className="flex-1 relative" ref={dropdownRef}>
            <input
              ref={brandInputRef}
              type="text"
              placeholder="ブランド名、スタイル、サイズで検索..."
              value={filters.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowBrandDropdown(true)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            />
            
            {/* ブランドドロップダウン（モバイル用） */}
            {showBrandDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {isSearchingBrands && (
                  <div className="p-3 text-center">
                    <div className="text-sm text-gray-500">検索中...</div>
                  </div>
                )}
                
                {/* 検索結果 */}
                {brandSearchResults.length > 0 && (
                  <>
                    <div className="p-3 border-b border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700">検索結果</h4>
                    </div>
                    <div className="p-2">
                      {brandSearchResults.map((brand) => (
                        <button
                          key={brand.id}
                          onClick={() => handleBrandSelect(brand)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                        >
                          <div className="font-medium">{brand.japanese_name || brand.canonical_name}</div>
                          {brand.japanese_name && brand.canonical_name !== brand.japanese_name && (
                            <div className="text-xs text-gray-500">{brand.canonical_name}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                
                {/* 人気ブランド（検索中でない場合のみ表示） */}
                {!isSearchingBrands && brandSearchResults.length === 0 && popularBrands.length > 0 && (
                  <>
                    <div className="p-3 border-b border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700">人気ブランド</h4>
                    </div>
                    <div className="p-2">
                      {popularBrands.map((brand) => (
                        <button
                          key={brand.id}
                          onClick={() => handleBrandSelect(brand)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                        >
                          <div className="font-medium">{brand.japanese_name || brand.canonical_name}</div>
                          {brand.japanese_name && brand.canonical_name !== brand.japanese_name && (
                            <div className="text-xs text-gray-500">{brand.canonical_name}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={handleSearch}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* デスクトップ用詳細検索 */}
      <div className="hidden lg:flex gap-2">
        {/* ブランド名入力 */}
        <div className="flex-1 relative" ref={dropdownRef}>
          <input
            ref={brandInputRef}
            type="text"
            placeholder="ブランド名を入力"
            value={filters.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowBrandDropdown(true)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
          />
          
          {/* ブランドドロップダウン */}
          {showBrandDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {isSearchingBrands && (
                <div className="p-3 text-center">
                  <div className="text-sm text-gray-500">検索中...</div>
                </div>
              )}
              
              {/* 検索結果 */}
              {brandSearchResults.length > 0 && (
                <>
                  <div className="p-3 border-b border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700">検索結果</h4>
                  </div>
                  <div className="p-2">
                    {brandSearchResults.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => handleBrandSelect(brand)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                      >
                        <div className="font-medium">{brand.japanese_name || brand.canonical_name}</div>
                        {brand.japanese_name && brand.canonical_name !== brand.japanese_name && (
                          <div className="text-xs text-gray-500">{brand.canonical_name}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
              
              {/* 人気ブランド（検索中でない場合のみ表示） */}
              {!isSearchingBrands && brandSearchResults.length === 0 && popularBrands.length > 0 && (
                <>
                  <div className="p-3 border-b border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700">人気ブランド</h4>
                  </div>
                  <div className="p-2">
                    {popularBrands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => handleBrandSelect(brand)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                      >
                        <div className="font-medium">{brand.japanese_name || brand.canonical_name}</div>
                        {brand.japanese_name && brand.canonical_name !== brand.japanese_name && (
                          <div className="text-xs text-gray-500">{brand.canonical_name}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* サイズ選択 */}
        <div className="flex-1 lg:max-w-48">
          <select
            value={filters.size}
            onChange={(e) => handleInputChange('size', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base bg-white"
          >
            {SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>

        {/* 価格上限選択 */}
        <div className="flex-1 lg:max-w-48">
          <select
            value={filters.maxPrice}
            onChange={(e) => handleInputChange('maxPrice', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base bg-white"
          >
            {PRICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 検索ボタン */}
        <button
          onClick={handleSearch}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="hidden sm:inline">検索</span>
        </button>
      </div>
    </div>
  )
}