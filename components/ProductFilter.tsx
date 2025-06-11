'use client'

import { useState, useEffect } from 'react'
import { sizeMapping, getSizeGou } from '@/lib/types'

export interface FilterState {
  priceRange: [number, number]
  sizes: string[]
  conditions: string[]
  brand?: string
}

interface ProductFilterProps {
  onFilterChange: (filters: FilterState) => void
  initialFilters?: FilterState
  isModal?: boolean
  onClose?: () => void
}

// 新しいサイズシステム: S・M・L + 号数対応
const MAIN_SIZES = Object.keys(sizeMapping) // ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const GOU_SIZES = ['7号', '9号', '11号', '13号', '15号', '17号']
const CONDITIONS = ['新品・未使用', '未使用に近い', '目立った傷や汚れなし', 'やや傷や汚れあり']

export default function ProductFilter({ onFilterChange, initialFilters, isModal = false, onClose }: ProductFilterProps) {
  const [filters, setFilters] = useState<FilterState>(
    initialFilters || {
      priceRange: [0, 1000000],
      sizes: [],
      conditions: []
    }
  )

  // 折りたたみ状態
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    size: true,
    condition: true
  })

  // initialFiltersが変更されたときに状態を更新
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters)
    }
  }, [initialFilters])

  const toggleSection = (section: 'price' | 'size' | 'condition') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const handlePriceChange = (index: number, value: number) => {
    const newRange: [number, number] = [...filters.priceRange]
    newRange[index] = value
    if (index === 0 && value > newRange[1]) {
      newRange[1] = value
    }
    if (index === 1 && value < newRange[0]) {
      newRange[0] = value
    }
    updateFilters({ priceRange: newRange })
  }

  const handleSizeToggle = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter(s => s !== size)
      : [...filters.sizes, size]
    updateFilters({ sizes: newSizes })
  }

  const handleConditionToggle = (condition: string) => {
    const newConditions = filters.conditions.includes(condition)
      ? filters.conditions.filter(c => c !== condition)
      : [...filters.conditions, condition]
    updateFilters({ conditions: newConditions })
  }

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      priceRange: [0, 1000000],
      sizes: [],
      conditions: []
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) count++
    if (filters.sizes.length > 0) count++
    if (filters.conditions.length > 0) count++
    return count
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${isModal ? '' : 'p-6'}`}>
      {isModal && (
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">フィルター</h2>
          <button onClick={onClose} className="p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      <div className={isModal ? 'p-4' : ''}>
        {!isModal && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">フィルター</h2>
            {getActiveFilterCount() > 0 && (
              <div className="flex items-center gap-2">
                <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs font-medium">
                  {getActiveFilterCount()}個選択中
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-gray-500 hover:text-gray-700 text-sm underline"
                >
                  クリア
                </button>
              </div>
            )}
          </div>
        )}

        {/* 価格フィルター */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full text-left mb-4"
          >
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              価格帯
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) && (
                <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs font-medium">
                  設定済
                </span>
              )}
            </h3>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                expandedSections.price ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.price && (
            <div className="space-y-6 overflow-hidden transition-all duration-300 pt-2">
              {/* 価格レンジスライダー */}
              <div className="px-1">
                <div className="relative mb-6">
                  {/* スライダートラック */}
                  <div className="relative h-2 bg-gray-200 rounded-full">
                    <div
                      className="absolute h-2 bg-pink-500 rounded-full"
                      style={{
                        left: `${(filters.priceRange[0] / 1000000) * 100}%`,
                        width: `${((filters.priceRange[1] - filters.priceRange[0]) / 1000000) * 100}%`
                      }}
                    />
                  </div>
                  
                  {/* スライダー入力（最小値） */}
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceChange(0, Number(e.target.value))}
                    className="absolute inset-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb z-10"
                  />
                  
                  {/* スライダー入力（最大値） */}
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                    className="absolute inset-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb z-10"
                  />
                </div>
                
                {/* 価格表示 */}
                <div className="flex justify-between text-sm text-gray-600 px-1">
                  <span className="font-medium">¥{filters.priceRange[0].toLocaleString()}</span>
                  <span className="font-medium">¥{filters.priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

      {/* サイズフィルター */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('size')}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            サイズ
            {filters.sizes.length > 0 && (
              <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs font-medium">
                {filters.sizes.length}個
              </span>
            )}
          </h3>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              expandedSections.size ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSections.size && (
          <div className="space-y-4 overflow-hidden transition-all duration-300">
            {/* メインサイズ (S・M・L) */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">標準サイズ</h4>
              <div className="grid grid-cols-3 gap-2">
                {MAIN_SIZES.map((size) => (
                  <label
                    key={size}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={filters.sizes.includes(size)}
                      onChange={() => handleSizeToggle(size)}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">{size}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 号数サイズ */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">号数</h4>
              <div className="grid grid-cols-3 gap-2">
                {GOU_SIZES.map((size) => (
                  <label
                    key={size}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={filters.sizes.includes(size)}
                      onChange={() => handleSizeToggle(size)}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">{size}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 状態フィルター */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('condition')}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            商品の状態
            {filters.conditions.length > 0 && (
              <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs font-medium">
                {filters.conditions.length}個
              </span>
            )}
          </h3>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              expandedSections.condition ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {expandedSections.condition && (
          <div className="space-y-2 overflow-hidden transition-all duration-300">
            {CONDITIONS.map((condition) => (
              <label
                key={condition}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={filters.conditions.includes(condition)}
                  onChange={() => handleConditionToggle(condition)}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">{condition}</span>
              </label>
            ))}
          </div>
        )}
      </div>

        {isModal && (
          <div className="p-4 border-t">
            {getActiveFilterCount() > 0 && (
              <div className="flex items-center justify-between mb-4">
                <span className="bg-pink-100 text-pink-600 px-3 py-2 rounded-full text-sm font-medium">
                  {getActiveFilterCount()}個選択中
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-gray-500 hover:text-gray-700 text-sm underline"
                >
                  クリア
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}