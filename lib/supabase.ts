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
    console.log('🕐 API addFavorite 開始:', { userId, dressId, timestamp: new Date().toLocaleTimeString() })
    
    try {
      const { error } = await Promise.race([
        supabase
          .from('favorites')
          .insert([{ user_id: userId, dress_id: dressId }]),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout')), 10000) // 10秒タイムアウト
        )
      ]) as any
      
      if (error) {
        console.error('Error adding favorite:', error)
        return false
      }
      
      console.log('✅ API addFavorite 完了:', { timestamp: new Date().toLocaleTimeString() })
      return true
    } catch (error) {
      console.error('❌ API addFavorite エラー:', error)
      return false
    }
  },

  // お気に入り削除
  async removeFavorite(userId: string, dressId: string): Promise<boolean> {
    console.log('🕐 API removeFavorite 開始:', { userId, dressId, timestamp: new Date().toLocaleTimeString() })
    
    try {
      const { error } = await Promise.race([
        supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('dress_id', dressId),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout')), 10000) // 10秒タイムアウト
        )
      ]) as any
      
      if (error) {
        console.error('Error removing favorite:', error)
        return false
      }
      
      console.log('✅ API removeFavorite 完了:', { timestamp: new Date().toLocaleTimeString() })
      return true
    } catch (error) {
      console.error('❌ API removeFavorite エラー:', error)
      return false
    }
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

// Dress テーブルの型定義 (lib/types.tsと統一)
export interface Dress {
  id: string
  title: string
  description?: string
  price: number
  original_price?: number
  images: string[]
  size: string
  brand: string
  condition: string
  color: string
  category: string
  seller_id: string
  owner_history: string
  measurements?: {
    bust?: string
    waist?: string
    hip?: string
    length?: string
  }
  features?: string[]
  silhouette?: string
  neckline?: string
  sleeve_style?: string
  skirt_length?: string
  model_name?: string
  manufacture_year?: number
  wear_count?: string
  is_cleaned?: boolean
  accept_offers?: boolean
  status: 'published' | 'draft' | 'sold' | 'inactive'
  created_at: string
  updated_at: string
}

// Dresses 操作関数
export const dressesAPI = {
  // ユーザーの出品一覧取得
  async getUserDresses(userId: string): Promise<Dress[]> {
    console.log('🔍 getUserDresses called with userId:', userId)
    console.log('🔗 Supabase URL:', supabaseUrl?.substring(0, 30) + '...')
    console.log('🔑 Is Supabase configured:', isSupabaseConfigured())
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      console.log('📊 Supabase response:', { data, error })
      
      if (error) {
        console.error('❌ Error fetching user dresses:', error)
        console.error('❌ Error details:', JSON.stringify(error, null, 2))
        throw error
      }
      
      console.log('✅ Successfully fetched dresses:', data?.length || 0, 'items')
      
      // listingsテーブルのデータをDress型に変換
      const dresses: Dress[] = (data || []).map(listing => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        original_price: listing.original_price,
        images: listing.images || [],
        size: listing.size,
        brand: listing.brand,
        condition: listing.condition,
        color: listing.color,
        category: listing.category,
        seller_id: listing.user_id,
        owner_history: listing.owner_history,
        measurements: listing.measurements,
        features: listing.features,
        silhouette: listing.silhouette,
        neckline: listing.neckline,
        sleeve_style: listing.sleeve_style,
        skirt_length: listing.skirt_length,
        model_name: listing.model_name,
        manufacture_year: listing.manufacture_year,
        wear_count: listing.wear_count,
        is_cleaned: listing.is_cleaned,
        accept_offers: listing.accept_offers,
        status: listing.status,
        created_at: listing.created_at,
        updated_at: listing.updated_at
      }))
      
      return dresses
    } catch (err) {
      console.error('❌ Exception in getUserDresses:', err)
      throw err
    }
  },

  // 出品データ作成
  async createDress(dressData: Omit<Dress, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('dresses')
      .insert([dressData])
      .select('id')
      .single()
    
    if (error) {
      console.error('Error creating dress:', error)
      return null
    }
    
    return data?.id || null
  },

  // 出品データ更新
  async updateDress(dressId: string, updates: Partial<Dress>): Promise<boolean> {
    const { error } = await supabase
      .from('dresses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', dressId)
    
    if (error) {
      console.error('Error updating dress:', error)
      return false
    }
    
    return true
  },

  // 出品データ削除
  async deleteDress(dressId: string): Promise<boolean> {
    const { error } = await supabase
      .from('dresses')
      .delete()
      .eq('id', dressId)
    
    if (error) {
      console.error('Error deleting dress:', error)
      return false
    }
    
    return true
  },

  // 単一出品データ取得
  async getDress(dressId: string): Promise<Dress | null> {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', dressId)
      .single()
    
    if (error) {
      console.error('Error fetching dress:', error)
      return null
    }
    
    // listingsテーブルのデータをDress型に変換
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      price: data.price,
      original_price: data.original_price,
      images: data.images || [],
      size: data.size,
      brand: data.brand,
      condition: data.condition,
      color: data.color,
      category: data.category,
      seller_id: data.user_id,
      owner_history: data.owner_history,
      measurements: data.measurements,
      features: data.features,
      silhouette: data.silhouette,
      neckline: data.neckline,
      sleeve_style: data.sleeve_style,
      skirt_length: data.skirt_length,
      model_name: data.model_name,
      manufacture_year: data.manufacture_year,
      wear_count: data.wear_count,
      is_cleaned: data.is_cleaned,
      accept_offers: data.accept_offers,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  },

  // ユーザーの出品統計を取得
  async getUserStats(userId: string): Promise<{
    totalListings: number
    activeListings: number
    soldListings: number
    draftListings: number
    inactiveListings: number
  }> {
    console.log('🔍 getUserStats called with userId:', userId)
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('status')
        .eq('user_id', userId)
      
      if (error) {
        console.error('❌ Error fetching user stats:', error)
        throw error
      }
      
      const listings = data || []
      const stats = {
        totalListings: listings.length,
        activeListings: listings.filter(l => l.status === 'published').length,
        soldListings: listings.filter(l => l.status === 'sold').length,
        draftListings: listings.filter(l => l.status === 'draft').length,
        inactiveListings: listings.filter(l => l.status === 'inactive').length
      }
      
      console.log('✅ User stats:', stats)
      return stats
    } catch (err) {
      console.error('❌ Exception in getUserStats:', err)
      // エラー時はゼロ値を返す
      return {
        totalListings: 0,
        activeListings: 0,
        soldListings: 0,
        draftListings: 0,
        inactiveListings: 0
      }
    }
  }
}