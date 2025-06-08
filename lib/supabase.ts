import { createBrowserClient } from '@supabase/ssr'

// 環境変数をデバッグ
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// デバッグログ（開発時のみ）
if (typeof window !== 'undefined') {
  console.log('Supabase URL:', supabaseUrl?.substring(0, 20) + '...')
  console.log('Supabase Key:', supabaseAnonKey?.substring(0, 20) + '...')
  console.log('Is dummy data?', supabaseUrl?.includes('dummy'))
}

export function createClient() {
  // ダミー値の場合は警告を表示
  if (supabaseUrl?.includes('dummy') || supabaseAnonKey?.includes('dummy')) {
    console.warn('⚠️ Supabase is using dummy credentials. Authentication will not work.')
    console.warn('Please update .env.local with real Supabase credentials.')
  }

  return createBrowserClient(
    supabaseUrl || 'https://dummy.supabase.co',
    supabaseAnonKey || 'dummy-key'
  )
}

// 共通のSupabaseクライアント
export const supabase = createClient()

// 実際のSupabaseに接続されているかチェック
export const isSupabaseConfigured = () => {
  return !supabaseUrl?.includes('dummy') && !supabaseAnonKey?.includes('dummy')
}

// Favorites テーブルの型定義
export interface Favorite {
  id: string
  user_id: string
  dress_id: string
  created_at: string
}

// Favorites 操作関数
export const favoritesAPI = {
  // お気に入り一覧取得
  async getFavorites(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('dress_id')
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error fetching favorites:', error)
      return []
    }
    
    return data?.map(item => item.dress_id) || []
  },

  // お気に入り追加
  async addFavorite(userId: string, dressId: string): Promise<boolean> {
    const { error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, dress_id: dressId }])
    
    if (error) {
      console.error('Error adding favorite:', error)
      return false
    }
    
    return true
  },

  // お気に入り削除
  async removeFavorite(userId: string, dressId: string): Promise<boolean> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('dress_id', dressId)
    
    if (error) {
      console.error('Error removing favorite:', error)
      return false
    }
    
    return true
  },

  // お気に入り状態確認
  async isFavorite(userId: string, dressId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('dress_id', dressId)
      .single()
    
    if (error) {
      return false
    }
    
    return !!data
  }
}