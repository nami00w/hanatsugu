'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { favoritesAPI } from '@/lib/supabase'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    const loadFavorites = async () => {
      if (!isAuthenticated || !user) {
        setFavorites([])
        return
      }

      try {
        const userFavorites = await favoritesAPI.getFavorites(user.id)
        setFavorites(userFavorites)
      } catch (error) {
        console.error('Failed to load favorites:', error)
        setFavorites([])
      }
    }

    loadFavorites()
  }, [isAuthenticated, user])

  const toggleFavorite = async (dressId: string | number) => {
    if (!isAuthenticated || !user) {
      return false // ログインが必要
    }

    const normalizedDressId = dressId.toString()
    const isCurrentlyFavorite = favorites.includes(normalizedDressId)

    try {
      // まずUIを即座に更新（楽観的アップデート）
      const newFavorites = isCurrentlyFavorite
        ? favorites.filter(id => id !== normalizedDressId)
        : [...favorites, normalizedDressId]
      
      setFavorites(newFavorites)

      // Supabase APIを呼び出し
      const success = isCurrentlyFavorite
        ? await favoritesAPI.removeFavorite(user.id, normalizedDressId)
        : await favoritesAPI.addFavorite(user.id, normalizedDressId)

      if (!success) {
        // 失敗した場合、UIを元に戻す
        setFavorites(favorites)
        return false
      }

      // カスタムイベントを発火して他のコンポーネントに通知
      window.dispatchEvent(new CustomEvent('favoritesChange', { 
        detail: { favorites: newFavorites } 
      }))

      return true
    } catch (error) {
      console.error('Toggle favorite failed:', error)
      // エラーの場合、UIを元に戻す
      setFavorites(favorites)
      return false
    }
  }

  const isFavorite = (dressId: string | number) => {
    const normalizedDressId = dressId.toString()
    return isAuthenticated && favorites.includes(normalizedDressId)
  }

  const favoritesCount = isAuthenticated ? favorites.length : 0

  return {
    favorites,
    isLoggedIn: isAuthenticated,
    favoritesCount,
    toggleFavorite,
    isFavorite
  }
}