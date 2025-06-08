'use client'

import { useState, useEffect } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuthStatus = () => {
      // クライアントサイドでのみ実行
      if (typeof window === 'undefined') return
      
      // ダミー実装: localStorageでログイン状態を管理
      const authStatus = localStorage.getItem('dummyAuth')
      const dummyUserId = localStorage.getItem('dummyUserId') || 'dummy-user-id'
      
      console.log('🔍 Checking dummy auth:', authStatus)
      
      if (authStatus === 'true') {
        setIsLoggedIn(true)
        setUserId(dummyUserId)
        
        // 開発中はlocalStorageから取得
        const savedFavorites = localStorage.getItem('favorites')
        if (savedFavorites) {
          try {
            setFavorites(JSON.parse(savedFavorites))
          } catch (e) {
            console.error('Failed to parse favorites:', e)
            setFavorites([])
          }
        }
        console.log('✅ Dummy auth: logged in')
      } else {
        setIsLoggedIn(false)
        setUserId(null)
        setFavorites([])
        console.log('❌ Dummy auth: not logged in')
      }
    }

    checkAuthStatus()

    // localStorage の変更を監視（ダミー認証用）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dummyAuth' || e.key === 'favorites') {
        console.log('🔄 Storage change detected:', e.key, e.newValue)
        checkAuthStatus()
      }
    }

    // ページ内での localStorage 変更を監視
    const handleDummyAuthChange = () => {
      console.log('🔄 Dummy auth change detected')
      checkAuthStatus()
    }

    // favorites変更イベントを監視
    const handleFavoritesChange = (e: CustomEvent) => {
      console.log('🔄 Favorites change detected:', e.detail.favorites)
      setFavorites(e.detail.favorites)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('dummyAuthChange', handleDummyAuthChange)
    window.addEventListener('favoritesChange', handleFavoritesChange as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('dummyAuthChange', handleDummyAuthChange)
      window.removeEventListener('favoritesChange', handleFavoritesChange as EventListener)
    }
  }, [])

  const toggleFavorite = async (dressId: string | number) => {
    if (typeof window === 'undefined') return false
    
    if (!isLoggedIn || !userId) {
      return false // ログインが必要
    }

    // IDを文字列に統一
    const normalizedDressId = dressId.toString()
    const isCurrentlyFavorite = favorites.includes(normalizedDressId)
    
    console.log('🔄 Toggle favorite:', { dressId: normalizedDressId, isCurrentlyFavorite, currentFavorites: favorites })
    
    // まずUIを即座に更新
    const newFavorites = isCurrentlyFavorite
      ? favorites.filter(id => id !== normalizedDressId)
      : [...favorites, normalizedDressId]
    
    console.log('✨ New favorites state:', newFavorites)
    setFavorites(newFavorites)

    // 開発中はlocalStorageに保存
    try {
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
      console.log('💾 Favorites saved to localStorage:', newFavorites)
      
      // カスタムイベントを発火して他のコンポーネントに通知
      window.dispatchEvent(new CustomEvent('favoritesChange', { 
        detail: { favorites: newFavorites } 
      }))
      
      // 強制的にstorageイベントも発火（同一ページ内での更新通知）
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'favorites',
        newValue: JSON.stringify(newFavorites),
        oldValue: JSON.stringify(favorites)
      }))
    } catch (e) {
      console.error('Failed to save favorites:', e)
    }
    
    return true // 成功
  }

  const isFavorite = (dressId: string | number) => {
    const normalizedDressId = dressId.toString()
    return isLoggedIn && favorites.includes(normalizedDressId)
  }

  const favoritesCount = isLoggedIn ? favorites.length : 0

  return {
    favorites,
    isLoggedIn,
    favoritesCount,
    toggleFavorite,
    isFavorite
  }
}