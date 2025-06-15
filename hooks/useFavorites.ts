'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { favoritesAPI } from '@/lib/supabase'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [updateTrigger, setUpdateTrigger] = useState(0)
  const [forceUpdate, setForceUpdate] = useState(0)
  const favoritesRef = useRef<string[]>([])
  const { user, isAuthenticated } = useAuth()

  // favoritesRefを常に同期
  useEffect(() => {
    favoritesRef.current = favorites
  }, [favorites])

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
        console.error('Error fetching favorites:', error)
        setFavorites([])
      }
    }

    loadFavorites()
  }, [isAuthenticated, user?.id]) // user全体ではなくuser.idのみを依存関係に

  const toggleFavorite = useCallback(async (dressId: string | number) => {
    console.log('🔄 toggleFavorite called:', { dressId, isAuthenticated, user: !!user })
    
    if (!isAuthenticated || !user) {
      console.log('❌ 認証エラー - ログインが必要')
      return false // ログインが必要
    }

    const normalizedDressId = dressId.toString()

    try {
      // 現在の状態を確認
      const isCurrentlyFavorite = favorites.includes(normalizedDressId)
      
      console.log('🎯 シンプル更新開始:', { normalizedDressId, isCurrentlyFavorite, action: isCurrentlyFavorite ? 'remove' : 'add' })
      
      // 1. まず状態を即座に更新
      if (isCurrentlyFavorite) {
        setFavorites(prev => prev.filter(id => id !== normalizedDressId))
      } else {
        setFavorites(prev => [...prev, normalizedDressId])
      }
      
      console.log('⚡ UI即座更新完了')
      
      // 2. APIを実行（失敗時は戻す）
      const success = isCurrentlyFavorite
        ? await favoritesAPI.removeFavorite(user.id, normalizedDressId)
        : await favoritesAPI.addFavorite(user.id, normalizedDressId)

      if (!success) {
        console.log('❌ API失敗 - 状態を元に戻します')
        // 失敗時は元の状態に戻す
        if (isCurrentlyFavorite) {
          setFavorites(prev => [...prev, normalizedDressId])
        } else {
          setFavorites(prev => prev.filter(id => id !== normalizedDressId))
        }
        return false
      }

      console.log('✅ 完全成功')
      return true
    } catch (error) {
      console.error('❌ Toggle favorite failed:', error)
      // エラーの場合、状態を再読み込み
      if (user) {
        try {
          const userFavorites = await favoritesAPI.getFavorites(user.id)
          setFavorites(userFavorites)
        } catch (reloadError) {
          console.error('❌ Failed to reload favorites:', reloadError)
        }
      }
      return false
    }
  }, [isAuthenticated, user, favorites])

  const isFavorite = (dressId: string | number) => {
    const normalizedDressId = dressId.toString()
    return isAuthenticated && favorites.includes(normalizedDressId)
  }

  const favoritesCount = isAuthenticated ? favorites.length : 0

  // favoritesCountの変化を追跡
  useEffect(() => {
    console.log('🔢 useFavorites: favoritesCount calculated:', { 
      favoritesCount, 
      favoritesLength: favorites.length, 
      isAuthenticated,
      favorites,
      timestamp: new Date().toLocaleTimeString()
    })
  }, [favoritesCount, favorites, isAuthenticated])

  return {
    favorites,
    isLoggedIn: isAuthenticated,
    favoritesCount,
    toggleFavorite,
    isFavorite,
    updateTrigger, // Headerの強制更新用
    forceUpdate   // 追加の強制更新用
  }
}