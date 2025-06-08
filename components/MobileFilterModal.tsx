'use client'

import { useEffect } from 'react'
import ProductFilter, { FilterState } from './ProductFilter'

interface MobileFilterModalProps {
  isOpen: boolean
  onClose: () => void
  onFilterChange: (filters: FilterState) => void
  initialFilters: FilterState
}

export default function MobileFilterModal({ 
  isOpen, 
  onClose, 
  onFilterChange, 
  initialFilters 
}: MobileFilterModalProps) {
  // モーダルが開いているときはスクロールを防ぐ
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* 背景オーバーレイ */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* モーダルコンテンツ */}
      <div 
        className={`
          fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <ProductFilter
          onFilterChange={onFilterChange}
          initialFilters={initialFilters}
          isModal={true}
          onClose={onClose}
        />
      </div>
    </div>
  )
}