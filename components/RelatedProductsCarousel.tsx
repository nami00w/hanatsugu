'use client'

import { useState, useRef } from 'react'
import DressCard from './DressCard'

interface Product {
  id: string
  brand: string
  model: string
  size: string
  price: number
  originalPrice: number
  imageUrl: string
}

interface RelatedProductsCarouselProps {
  currentProductId: string
  currentBrand: string
  allProducts: Product[]
}

export default function RelatedProductsCarousel({ 
  currentProductId, 
  currentBrand, 
  allProducts 
}: RelatedProductsCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // 関連商品を取得（同じブランド、現在の商品を除外）
  const relatedProducts = allProducts.filter(product => 
    product.brand === currentBrand && product.id !== currentProductId
  )

  // 関連商品が少ない場合は表示しない
  if (relatedProducts.length === 0) {
    return null
  }

  const scrollTo = (direction: 'left' | 'right') => {
    if (!containerRef.current) return

    const container = containerRef.current
    const cardWidth = 280 // DressCardの幅 + gap
    const scrollAmount = cardWidth * 2 // 2枚分スクロール
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            こちらもおすすめ
          </h2>
          <p className="text-gray-600">
            {currentBrand}の他の素敵なドレス
          </p>
        </div>

        <div className="relative">
          {/* 左矢印 */}
          <button
            onClick={() => scrollTo('left')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 hidden sm:block"
            aria-label="前の商品を表示"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* 右矢印 */}
          <button
            onClick={() => scrollTo('right')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 hidden sm:block"
            aria-label="次の商品を表示"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* 商品カルーセル */}
          <div
            ref={containerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide px-0 sm:px-12 py-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {relatedProducts.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-64 snap-start"
              >
                <DressCard
                  id={product.id}
                  brand={product.brand}
                  model={product.model}
                  size={product.size}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  imageUrl={product.imageUrl}
                />
              </div>
            ))}
          </div>
        </div>

        {/* モバイル用スクロールヒント */}
        <div className="sm:hidden text-center mt-4">
          <p className="text-sm text-gray-500">
            左右にスワイプして他の商品を見る
          </p>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}