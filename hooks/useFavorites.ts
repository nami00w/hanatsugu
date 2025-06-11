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
      
      try {
        // ダミー実装: localStorageでログイン状態を管理（モバイル対応強化）
        const authStatus = localStorage.getItem('dummyAuth')
        const dummyUserId = localStorage.getItem('dummyUserId') || 'dummy-user-id'
        
        console.log('🔍 [Mobile Debug] Checking dummy auth:', authStatus)
        console.log('🔍 [Mobile Debug] User agent:', navigator.userAgent)
        console.log('🔍 [Mobile Debug] localStorage available:', typeof Storage !== 'undefined')
        
        if (authStatus === 'true') {
          setIsLoggedIn(true)
          setUserId(dummyUserId)
          
          // 開発中はlocalStorageから取得（エラーハンドリング強化）
          try {
            const savedFavorites = localStorage.getItem('favorites')
            if (savedFavorites) {
              const parsedFavorites = JSON.parse(savedFavorites)
              setFavorites(Array.isArray(parsedFavorites) ? parsedFavorites : [])
              console.log('🔍 [Mobile Debug] Loaded favorites:', parsedFavorites)
            } else {
              setFavorites([])
              console.log('🔍 [Mobile Debug] No saved favorites found')
            }
          } catch (e) {
            console.error('🚨 [Mobile Debug] Failed to parse favorites:', e)
            setFavorites([])
            // 破損したデータをクリア
            try {
              localStorage.removeItem('favorites')
            } catch (clearError) {
              console.error('🚨 [Mobile Debug] Failed to clear corrupted favorites:', clearError)
            }
          }
          console.log('✅ [Mobile Debug] Dummy auth: logged in')
        } else {
          setIsLoggedIn(false)
          setUserId(null)
          setFavorites([])
          console.log('❌ [Mobile Debug] Dummy auth: not logged in')
        }
      } catch (error) {
        console.error('🚨 [Mobile Debug] Auth check failed:', error)
        // フォールバック: ログアウト状態にする
        setIsLoggedIn(false)
        setUserId(null)
        setFavorites([])
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
    
    try {
      console.log('🔄 [Mobile Debug] Toggle favorite called:', dressId)
      console.log('🔄 [Mobile Debug] Current auth state:', { isLoggedIn, userId })
      
      if (!isLoggedIn || !userId) {
        console.log('❌ [Mobile Debug] Not logged in, toggle failed')
        return false // ログインが必要
      }

      // IDを文字列に統一
      const normalizedDressId = dressId.toString()
      const isCurrentlyFavorite = favorites.includes(normalizedDressId)
      
      console.log('🔄 [Mobile Debug] Toggle favorite:', { 
        dressId: normalizedDressId, 
        isCurrentlyFavorite, 
        currentFavorites: favorites,
        favoritesLength: favorites.length
      })
      
      // まずUIを即座に更新
      const newFavorites = isCurrentlyFavorite
        ? favorites.filter(id => id !== normalizedDressId)
        : [...favorites, normalizedDressId]
      
      console.log('✨ [Mobile Debug] New favorites state:', newFavorites)
      setFavorites(newFavorites)

      // 開発中はlocalStorageに保存（モバイル対応強化）
      try {
        const favoritesJson = JSON.stringify(newFavorites)
        localStorage.setItem('favorites', favoritesJson)
        console.log('💾 [Mobile Debug] Favorites saved to localStorage:', newFavorites)
        
        // 保存確認
        const savedCheck = localStorage.getItem('favorites')
        console.log('💾 [Mobile Debug] Save verification:', savedCheck)
        
        // カスタムイベントを発火して他のコンポーネントに通知（エラーハンドリング強化）
        try {
          window.dispatchEvent(new CustomEvent('favoritesChange', { 
            detail: { favorites: newFavorites } 
          }))
          console.log('📡 [Mobile Debug] Custom event dispatched')
        } catch (eventError) {
          console.error('🚨 [Mobile Debug] Custom event dispatch failed:', eventError)
        }
        
        // 強制的にstorageイベントも発火（同一ページ内での更新通知）
        try {
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'favorites',
            newValue: favoritesJson,
            oldValue: JSON.stringify(favorites)
          }))
          console.log('📡 [Mobile Debug] Storage event dispatched')
        } catch (storageEventError) {
          console.error('🚨 [Mobile Debug] Storage event dispatch failed:', storageEventError)
        }
        
      } catch (storageError) {
        console.error('🚨 [Mobile Debug] Failed to save favorites:', storageError)
        // 保存に失敗した場合、UIを元に戻す
        setFavorites(favorites)
        return false
      }
      
      console.log('✅ [Mobile Debug] Toggle favorite completed successfully')
      return true // 成功
      
    } catch (error) {
      console.error('🚨 [Mobile Debug] Toggle favorite failed:', error)
      return false
    }
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