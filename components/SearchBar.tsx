'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export interface SearchFilters {
  brand: string
  size: string
  maxPrice: string
}

// interface SearchBarProps {
//   onSearch: (filters: SearchFilters) => void
// }

const SIZES = ['', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '5号', '7号', '9号', '11号', '13号', '15号', '17号']
const PRICE_OPTIONS = [
  { value: '', label: '価格上限' },
  { value: '50000', label: '5万円以下' },
  { value: '100000', label: '10万円以下' },
  { value: '200000', label: '20万円以下' },
  { value: '300000', label: '30万円以下' },
  { value: '500000', label: '50万円以下' },
  { value: '1000000', label: '100万円以下' },
]

const POPULAR_BRANDS = [
  'VERA WANG', 'Pronovias', 'ANTONIO RIVA', 'Temperley London',
  'JENNY PACKHAM', 'Marchesa', 'Oscar de la Renta', 'Monique Lhuillier',
  'Carolina Herrera', 'Elie Saab', 'Reem Acra', 'Hayley Paige',
  'Tadashi Shoji', 'Maggie Sottero', 'Allure Bridals', "David's Bridal"
]

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

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBrandDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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

  const handleBrandSelect = (brand: string) => {
    setFilters(prev => ({ ...prev, brand }))
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
            />
            
            {/* ブランドドロップダウン（モバイル用） */}
            {showBrandDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                <div className="p-3 border-b border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">人気ブランド</h4>
                </div>
                <div className="p-2">
                  {POPULAR_BRANDS.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => handleBrandSelect(brand)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleSearch}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
          />
          
          {/* ブランドドロップダウン */}
          {showBrandDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              <div className="p-3 border-b border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">人気ブランド</h4>
              </div>
              <div className="p-2">
                {POPULAR_BRANDS.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => handleBrandSelect(brand)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* サイズ選択 */}
        <div className="flex-1 lg:max-w-48">
          <select
            value={filters.size}
            onChange={(e) => handleInputChange('size', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base bg-white"
          >
            <option value="">サイズを選択</option>
            {SIZES.slice(1).map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* 価格上限選択 */}
        <div className="flex-1 lg:max-w-48">
          <select
            value={filters.maxPrice}
            onChange={(e) => handleInputChange('maxPrice', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base bg-white"
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
          className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
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