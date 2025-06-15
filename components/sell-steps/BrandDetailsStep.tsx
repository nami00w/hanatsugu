'use client'

import { useState, useRef, useEffect } from 'react'
import { Tag, FileText } from 'lucide-react'
import { searchBrands, type Brand } from '@/lib/brandAPI'

interface BrandDetailsStepProps {
  title: string
  brand: string
  color: string
  condition: string
  ownerHistory: string
  modelName: string
  manufactureYear: string
  silhouette: string
  neckline: string
  sleeveStyle: string
  skirtLength: string
  features: string
  updateFormData: (updates: any) => void
}

export default function BrandDetailsStep({
  title,
  brand,
  color,
  condition,
  ownerHistory,
  modelName,
  manufactureYear,
  silhouette,
  neckline,
  sleeveStyle,
  skirtLength,
  features,
  updateFormData
}: BrandDetailsStepProps) {

  const [showBrandDropdown, setShowBrandDropdown] = useState(false)
  const [brandSearchResults, setBrandSearchResults] = useState<Brand[]>([])
  const [isSearchingBrands, setIsSearchingBrands] = useState(false)
  const brandInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleInputChange = (field: string, value: string) => {
    updateFormData({ [field]: value })
    
    // ブランド入力の場合は検索を実行
    if (field === 'brand') {
      handleBrandSearch(value)
    }
  }

  // ブランド検索
  const handleBrandSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setBrandSearchResults([])
      setShowBrandDropdown(false)
      return
    }

    setIsSearchingBrands(true)
    setShowBrandDropdown(true)
    try {
      const result = await searchBrands(searchTerm.trim(), 8)
      setBrandSearchResults(result.brands)
    } catch (error) {
      console.error('Brand search error:', error)
      setBrandSearchResults([])
    } finally {
      setIsSearchingBrands(false)
    }
  }

  // ブランド選択
  const handleBrandSelect = (selectedBrand: Brand) => {
    const brandName = selectedBrand.japanese_name || selectedBrand.canonical_name
    updateFormData({ brand: brandName })
    setBrandSearchResults([])
    setShowBrandDropdown(false)
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

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Tag className="mx-auto h-12 w-12 text-[var(--primary-green)] mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          ブランド・商品詳細
        </h3>
        <p className="text-gray-600">
          購入者が知りたい詳細情報を入力してください
        </p>
      </div>

      {/* 必須情報 */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-6">
        <h4 className="text-lg font-semibold text-gray-900">必須情報</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            商品タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="例：VERA WANG バレリーナ ウェディングドレス"
            className="form-input"
          />
          <p className="text-xs text-gray-500 mt-1">
            ブランド名とモデル名を含めると良いです
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ブランド名 <span className="text-red-500">*</span>
            </label>
            <input
              ref={brandInputRef}
              type="text"
              value={brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              onFocus={() => {
                if (brand.trim()) {
                  handleBrandSearch(brand)
                }
              }}
              placeholder="例：VERA WANG、Pronovias"
              className="form-input"
            />
            <p className="text-xs text-gray-500 mt-1">
              ブランド名を入力すると候補が表示されます
            </p>
            
            {/* ブランドオートコンプリートドロップダウン */}
            {showBrandDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                {isSearchingBrands && (
                  <div className="p-3 text-center">
                    <div className="text-sm text-gray-500">検索中...</div>
                  </div>
                )}
                
                {!isSearchingBrands && brandSearchResults.length > 0 && (
                  <div className="p-2">
                    {brandSearchResults.map((searchBrand) => (
                      <button
                        key={searchBrand.id}
                        onClick={() => handleBrandSelect(searchBrand)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                      >
                        <div className="font-medium">{searchBrand.japanese_name || searchBrand.canonical_name}</div>
                        {searchBrand.japanese_name && searchBrand.canonical_name !== searchBrand.japanese_name && (
                          <div className="text-xs text-gray-500">{searchBrand.canonical_name}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                
                {!isSearchingBrands && brandSearchResults.length === 0 && brand.trim() && (
                  <div className="p-3 text-center">
                    <div className="text-sm text-gray-500">検索結果がありません</div>
                    <div className="text-xs text-gray-400 mt-1">新しいブランドとして登録されます</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カラー <span className="text-red-500">*</span>
            </label>
            <select
              value={color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              className="form-input"
            >
              <option value="" className="text-gray-500">選択してください</option>
              <option value="白">白</option>
              <option value="オフホワイト">オフホワイト</option>
              <option value="アイボリー">アイボリー</option>
              <option value="シャンパン">シャンパン</option>
              <option value="ピンク">ピンク</option>
              <option value="その他">その他</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            商品の状態 <span className="text-red-500">*</span>
          </label>
          <select
            value={condition}
            onChange={(e) => handleInputChange('condition', e.target.value)}
            className="form-input"
          >
            <option value="" className="text-gray-500">選択してください</option>
            <option value="新品・未使用">新品・未使用</option>
            <option value="未使用に近い">未使用に近い</option>
            <option value="目立った傷や汚れなし">目立った傷や汚れなし</option>
            <option value="やや傷や汚れあり">やや傷や汚れあり</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            オーナー履歴 <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            <label className="flex items-start cursor-pointer">
              <input
                type="radio"
                name="ownerHistory"
                value="first"
                checked={ownerHistory === 'first'}
                onChange={() => handleInputChange('ownerHistory', 'first')}
                className="mt-1 h-4 w-4 text-[var(--primary-green)] focus:ring-green-500 border-gray-300"
              />
              <div className="ml-3">
                <span className="block text-sm font-medium text-gray-700">ファーストオーナー</span>
                <span className="block text-xs text-gray-500">私が最初の持ち主です</span>
              </div>
            </label>
            <label className="flex items-start cursor-pointer">
              <input
                type="radio"
                name="ownerHistory"
                value="second"
                checked={ownerHistory === 'second'}
                onChange={() => handleInputChange('ownerHistory', 'second')}
                className="mt-1 h-4 w-4 text-[var(--primary-green)] focus:ring-green-500 border-gray-300"
              />
              <div className="ml-3">
                <span className="block text-sm font-medium text-gray-700">セカンドオーナー</span>
                <span className="block text-xs text-gray-500">以前に1度譲渡されています</span>
              </div>
            </label>
            <label className="flex items-start cursor-pointer">
              <input
                type="radio"
                name="ownerHistory"
                value="third_plus"
                checked={ownerHistory === 'third_plus'}
                onChange={() => handleInputChange('ownerHistory', 'third_plus')}
                className="mt-1 h-4 w-4 text-[var(--primary-green)] focus:ring-green-500 border-gray-300"
              />
              <div className="ml-3">
                <span className="block text-sm font-medium text-gray-700">サードオーナー以上</span>
                <span className="block text-xs text-gray-500">複数回譲渡されています</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* 任意詳細情報 */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-6">
        <div className="flex items-center">
          <h4 className="text-lg font-semibold text-gray-900">詳細情報</h4>
          <span className="ml-2 text-sm text-gray-500">(任意)</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              モデル名・品番 <span className="text-gray-500">(任意)</span>
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => handleInputChange('modelName', e.target.value)}
              placeholder="例：バレリーナ、スタイル12345"
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              製造年 <span className="text-gray-500">(任意)</span>
            </label>
            <input
              type="number"
              value={manufactureYear}
              onChange={(e) => handleInputChange('manufactureYear', e.target.value)}
              placeholder="例：2023"
              min="2000"
              max="2024"
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              シルエット <span className="text-gray-500">(任意)</span>
            </label>
            <select
              value={silhouette}
              onChange={(e) => handleInputChange('silhouette', e.target.value)}
              className="form-input"
            >
              <option value="" className="text-gray-500">選択してください</option>
              <option value="Aライン">Aライン</option>
              <option value="ボールガウン">ボールガウン</option>
              <option value="マーメイド">マーメイド</option>
              <option value="スレンダー">スレンダー</option>
              <option value="エンパイア">エンパイア</option>
              <option value="その他">その他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ネックライン <span className="text-gray-500">(任意)</span>
            </label>
            <select
              value={neckline}
              onChange={(e) => handleInputChange('neckline', e.target.value)}
              className="form-input"
            >
              <option value="" className="text-gray-500">選択してください</option>
              <option value="ストラップレス">ストラップレス</option>
              <option value="ハイネック">ハイネック</option>
              <option value="Vネック">Vネック</option>
              <option value="ハートシェイプ">ハートシェイプ</option>
              <option value="オフショルダー">オフショルダー</option>
              <option value="その他">その他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              袖スタイル <span className="text-gray-500">(任意)</span>
            </label>
            <select
              value={sleeveStyle}
              onChange={(e) => handleInputChange('sleeveStyle', e.target.value)}
              className="form-input"
            >
              <option value="" className="text-gray-500">選択してください</option>
              <option value="ノースリーブ">ノースリーブ</option>
              <option value="半袖">半袖</option>
              <option value="長袖">長袖</option>
              <option value="七分袖">七分袖</option>
              <option value="キャップスリーブ">キャップスリーブ</option>
              <option value="その他">その他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              スカート丈 <span className="text-gray-500">(任意)</span>
            </label>
            <select
              value={skirtLength}
              onChange={(e) => handleInputChange('skirtLength', e.target.value)}
              className="form-input"
            >
              <option value="" className="text-gray-500">選択してください</option>
              <option value="フロアレングス">フロアレングス</option>
              <option value="チャペルレングス">チャペルレングス</option>
              <option value="カテドラルレングス">カテドラルレングス</option>
              <option value="ひざ丈">ひざ丈</option>
              <option value="ミディ丈">ミディ丈</option>
              <option value="その他">その他</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            特徴・装飾 <span className="text-gray-500">(任意)</span>
          </label>
          <input
            type="text"
            value={features}
            onChange={(e) => handleInputChange('features', e.target.value)}
            placeholder="例：ビーズ、レース、刺繍、パール"
            className="form-input"
          />
        </div>
      </div>

    </div>
  )
}