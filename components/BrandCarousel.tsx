'use client'

import { useState, useRef } from 'react'

interface Brand {
  name: string
  image: string
  searchQuery: string
}

const brands: Brand[] = [
  { name: 'VERA WANG', image: '/api/placeholder/180/180', searchQuery: 'VERA WANG' },
  { name: 'Pronovias', image: '/api/placeholder/180/180', searchQuery: 'Pronovias' },
  { name: 'ANTONIO RIVA', image: '/api/placeholder/180/180', searchQuery: 'ANTONIO RIVA' },
  { name: 'Temperley London', image: '/api/placeholder/180/180', searchQuery: 'Temperley London' },
  { name: 'JENNY PACKHAM', image: '/api/placeholder/180/180', searchQuery: 'JENNY PACKHAM' },
  { name: 'Marchesa', image: '/api/placeholder/180/180', searchQuery: 'Marchesa' },
  { name: 'Galia Lahav', image: '/api/placeholder/180/180', searchQuery: 'Galia Lahav' },
  { name: 'Enzoani', image: '/api/placeholder/180/180', searchQuery: 'Enzoani' },
  { name: 'Milla Nova', image: '/api/placeholder/180/180', searchQuery: 'Milla Nova' },
]

export default function BrandCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleBrandClick = (brand: Brand) => {
    // 商品一覧セクションまでスクロール
    const productSection = document.querySelector('[data-section="products"]')
    if (productSection) {
      productSection.scrollIntoView({ behavior: 'smooth' })
    }
    // TODO: ブランドフィルターを適用する処理
    console.log('Selected brand:', brand.searchQuery)
  }

  const scrollTo = (direction: 'left' | 'right') => {
    if (!containerRef.current) return

    const container = containerRef.current
    const scrollAmount = container.clientWidth * 0.8
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            人気ブランド
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            世界中の花嫁に愛され続けるブランドのウェディングドレスをお探しください
          </p>
        </div>

        <div className="relative">
          {/* 左矢印 */}
          <button
            onClick={() => scrollTo('left')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            aria-label="前のブランドを表示"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* 右矢印 */}
          <button
            onClick={() => scrollTo('right')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            aria-label="次のブランドを表示"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* ブランドカルーセル */}
          <div
            ref={containerRef}
            className="flex gap-8 overflow-x-auto scrollbar-hide px-12 py-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {brands.map((brand, index) => (
              <div
                key={brand.name}
                onClick={() => handleBrandClick(brand)}
                className="flex-shrink-0 text-center cursor-pointer group"
              >
                {/* ブランド画像 */}
                <div className="relative mb-4">
                  <div className="w-40 h-40 lg:w-44 lg:h-44 mx-auto bg-white rounded-full shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 flex items-center justify-center border-2 border-gray-100">
                    {/* プレースホルダー画像 */}
                    <div className="w-32 h-32 lg:w-36 lg:h-36 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 text-xs font-medium">
                        {brand.name.substring(0, 2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ブランド名 */}
                <h3 className="text-sm lg:text-base font-medium text-gray-800 group-hover:text-pink-600 transition-colors duration-200">
                  {brand.name}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {/* レスポンシブ用のドット表示（モバイル） */}
        <div className="flex justify-center mt-8 lg:hidden">
          <div className="flex space-x-2">
            {Array.from({ length: Math.ceil(brands.length / 3) }).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === Math.floor(currentIndex / 3) ? 'bg-pink-600' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(index * 3)}
              />
            ))}
          </div>
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