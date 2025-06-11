'use client'

import { useState, useEffect } from 'react'
import type { ViewHistoryItem } from '@/lib/types'

export function useViewHistory() {
  const [viewHistory, setViewHistory] = useState<ViewHistoryItem[]>([])

  useEffect(() => {
    // 初回読み込み時にlocalStorageから取得
    const storedHistory = localStorage.getItem('viewHistory')
    if (storedHistory) {
      try {
        const history: ViewHistoryItem[] = JSON.parse(storedHistory)
        setViewHistory(history)
      } catch (error) {
        console.error('閲覧履歴の読み込みに失敗しました:', error)
        setViewHistory([])
      }
    }
  }, [])

  const addToHistory = (dressData: {
    id: string
    title: string
    brand: string
    price: number
    images: string[]
    size: string
    condition: string
  }) => {
    const newItem: ViewHistoryItem = {
      id: `${dressData.id}-${Date.now()}`, // ユニークなIDを生成
      viewedAt: new Date().toISOString(),
      dress: dressData
    }

    // 既存の履歴を取得
    const storedHistory = localStorage.getItem('viewHistory')
    let currentHistory: ViewHistoryItem[] = []
    
    if (storedHistory) {
      try {
        currentHistory = JSON.parse(storedHistory)
      } catch (error) {
        console.error('既存の閲覧履歴の読み込みに失敗しました:', error)
      }
    }

    // 同じ商品の履歴があれば削除（重複を避けるため）
    const filteredHistory = currentHistory.filter(
      item => item.dress.id !== dressData.id
    )

    // 新しいアイテムを先頭に追加
    const updatedHistory = [newItem, ...filteredHistory]

    // 最大20件まで保持
    const limitedHistory = updatedHistory.slice(0, 20)

    // localStorageに保存
    localStorage.setItem('viewHistory', JSON.stringify(limitedHistory))
    
    // ステートを更新
    setViewHistory(limitedHistory)

    console.log('📝 閲覧履歴に追加:', dressData.title)
  }

  const removeFromHistory = (itemId: string) => {
    const updatedHistory = viewHistory.filter(item => item.id !== itemId)
    localStorage.setItem('viewHistory', JSON.stringify(updatedHistory))
    setViewHistory(updatedHistory)
  }

  const clearHistory = () => {
    localStorage.removeItem('viewHistory')
    setViewHistory([])
  }

  return {
    viewHistory,
    addToHistory,
    removeFromHistory,
    clearHistory
  }
}