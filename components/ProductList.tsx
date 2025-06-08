'use client'

import DressCard from './DressCard'
import { FilterState } from './ProductFilter'

// ダミーデータを拡張
const allProducts = [
  { id: "1", brand: "VERA WANG", model: "Liesel", size: "9号", price: 128000, originalPrice: 380000, condition: "未使用に近い" },
  { id: "2", brand: "Pronovias", model: "Draco", size: "11号", price: 95000, originalPrice: 280000, condition: "未使用に近い" },
  { id: "3", brand: "ANTONIO RIVA", model: "Gemma", size: "7号", price: 168000, originalPrice: 420000, condition: "未使用に近い" },
  { id: "4", brand: "Temperley London", model: "Iris", size: "9号", price: 145000, originalPrice: 350000, condition: "未使用に近い" },
  { id: "5", brand: "JENNY PACKHAM", model: "Hermione", size: "13号", price: 198000, originalPrice: 480000, condition: "未使用に近い" },
  { id: "6", brand: "Marchesa", model: "Grecian", size: "9号", price: 178000, originalPrice: 450000, condition: "未使用に近い" },
  { id: "7", brand: "Oscar de la Renta", model: "Botanical", size: "7号", price: 85000, originalPrice: 250000, condition: "目立った傷や汚れなし" },
  { id: "8", brand: "Monique Lhuillier", model: "Swan", size: "S", price: 220000, originalPrice: 550000, condition: "新品・未使用" },
  { id: "9", brand: "Carolina Herrera", model: "Grace", size: "M", price: 135000, originalPrice: 320000, condition: "やや傷や汚れあり" },
  { id: "10", brand: "Elie Saab", model: "Dream", size: "L", price: 195000, originalPrice: 480000, condition: "未使用に近い" },
  { id: "11", brand: "Reem Acra", model: "Enchanted", size: "XS", price: 75000, originalPrice: 180000, condition: "目立った傷や汚れなし" },
  { id: "12", brand: "Hayley Paige", model: "Cosmos", size: "15号", price: 110000, originalPrice: 280000, condition: "未使用に近い" },
]

interface ProductListProps {
  filters: FilterState
}

export default function ProductList({ filters }: ProductListProps) {
  const filteredProducts = allProducts.filter(product => {
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

  return (
    <div className="flex-1">
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
              model={product.model}
              size={product.size}
              price={product.price}
              originalPrice={product.originalPrice}
            />
          ))}
        </div>
      )}
    </div>
  )
}