'use client'

import { useState, useEffect } from 'react'
import { supabase, favoritesAPI } from '@/lib/supabase'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuthStatus = async () => {
      // Supabase認証状態をチェック
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setIsLoggedIn(true)
        setUserId(user.id)
        
        // Supabaseからお気に入り一覧を取得
        const userFavorites = await favoritesAPI.getFavorites(user.id)
        setFavorites(userFavorites)
      } else {
        // ダミー実装（開発中）: localStorageでログイン状態を管理
        const authStatus = localStorage.getItem('dummyAuth')
        const dummyUserId = localStorage.getItem('dummyUserId') || 'dummy-user-id'
        
        console.log('🔍 Checking dummy auth:', authStatus)
        
        if (authStatus === 'true') {
          setIsLoggedIn(true)
          setUserId(dummyUserId)
          
          // 開発中はlocalStorageから取得
          const savedFavorites = localStorage.getItem('favorites')
          if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites))
          }
          console.log('✅ Dummy auth: logged in')
        } else {
          setIsLoggedIn(false)
          setUserId(null)
          setFavorites([])
          console.log('❌ Dummy auth: not logged in')
        }
      }
    }

    checkAuthStatus()

    // localStorage の変更を監視（ダミー認証用）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dummyAuth') {
        console.log('🔄 Storage change detected:', e.newValue)
        checkAuthStatus()
      }
    }

    // ページ内での localStorage 変更を監視
    const handleDummyAuthChange = () => {
      console.log('🔄 Dummy auth change detected')
      checkAuthStatus()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('dummyAuthChange', handleDummyAuthChange)

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setIsLoggedIn(true)
          setUserId(session.user.id)
          const userFavorites = await favoritesAPI.getFavorites(session.user.id)
          setFavorites(userFavorites)
        } else {
          // Supabaseログアウト時はダミー認証もチェック
          checkAuthStatus()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('dummyAuthChange', handleDummyAuthChange)
    }
  }, [])

  const toggleFavorite = async (dressId: string) => {
    if (!isLoggedIn || !userId) {
      return false // ログインが必要
    }

    const isCurrentlyFavorite = favorites.includes(dressId)
    
    // まずUIを即座に更新
    const newFavorites = isCurrentlyFavorite
      ? favorites.filter(id => id !== dressId)
      : [...favorites, dressId]
    
    setFavorites(newFavorites)

    // Supabaseを更新（本番環境）
    if (userId !== 'dummy-user-id') {
      const success = isCurrentlyFavorite
        ? await favoritesAPI.removeFavorite(userId, dressId)
        : await favoritesAPI.addFavorite(userId, dressId)
      
      if (!success) {
        // エラーの場合は元に戻す
        setFavorites(favorites)
        return false
      }
    } else {
      // 開発中はlocalStorageに保存
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
    }
    
    return true // 成功
  }

  const isFavorite = (dressId: string) => {
    return isLoggedIn && favorites.includes(dressId)
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