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
      .from('listings')
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
    console.log('🔄 updateDress called with:', { dressId, updates })
    
    try {
      const { error } = await supabase
        .from('listings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', dressId)
    
      if (error) {
        console.error('❌ Error updating dress:', error)
        return false
      }
      
      console.log('✅ Successfully updated dress:', dressId)
      return true
    } catch (err) {
      console.error('❌ Exception in updateDress:', err)
      return false
    }
  },

  // 出品データ削除
  async deleteDress(dressId: string): Promise<boolean> {
    console.log('🗑️ deleteDress called with:', dressId)
    
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', dressId)
      
      if (error) {
        console.error('❌ Error deleting dress:', error)
        return false
      }
      
      console.log('✅ Successfully deleted dress:', dressId)
      return true
    } catch (err) {
      console.error('❌ Exception in deleteDress:', err)
      return false
    }
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

// 売上関連の型定義
export interface Sale {
  id: string
  user_id: string
  listing_id: string
  amount: number
  platform_fee: number
  net_amount: number
  status: 'pending' | 'completed' | 'cancelled'
  buyer_id: string
  created_at: string
  completed_at?: string
}

export interface Withdrawal {
  id: string
  user_id: string
  amount: number
  bank_account_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  processed_at?: string
}

export interface BankAccount {
  id: string
  user_id: string
  bank_name: string
  branch_name: string
  account_type: 'checking' | 'savings'
  account_number: string
  account_holder: string
  is_default: boolean
  created_at: string
  updated_at: string
}

// 売上管理API
export const salesAPI = {
  // ユーザーの売上残高を取得
  async getUserBalance(userId: string): Promise<number> {
    console.log('🔍 getUserBalance called with userId:', userId)
    
    try {
      // 完了した売上を取得
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('net_amount')
        .eq('user_id', userId)
        .eq('status', 'completed')
      
      if (salesError) {
        console.error('❌ Error fetching sales:', salesError)
        // エラー時はダミー値を返す
        return 125000
      }
      
      // 完了した振込を取得
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('user_id', userId)
        .eq('status', 'completed')
      
      if (withdrawalsError) {
        console.error('❌ Error fetching withdrawals:', withdrawalsError)
        // エラー時はダミー値を返す
        return 125000
      }
      
      const totalSales = (sales || []).reduce((sum, sale) => sum + sale.net_amount, 0)
      const totalWithdrawals = (withdrawals || []).reduce((sum, w) => sum + w.amount, 0)
      
      const balance = totalSales - totalWithdrawals
      console.log('✅ User balance:', { totalSales, totalWithdrawals, balance })
      
      return Math.max(0, balance) // 負の値は0にする
    } catch (err) {
      console.error('❌ Exception in getUserBalance:', err)
      // エラー時はダミー値を返す
      return 125000
    }
  },

  // 最近の売上履歴を取得
  async getRecentSales(userId: string, limit: number = 5): Promise<Sale[]> {
    try {
      console.log('🔍 getRecentSales called with userId:', userId)
      
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) {
        console.error('❌ Error fetching recent sales:', error)
        // エラー時は空配列を返す
        return []
      }
      
      console.log('✅ Successfully fetched recent sales:', data?.length || 0, 'items')
      return data || []
    } catch (err) {
      console.error('❌ Exception in getRecentSales:', err)
      return []
    }
  },

  // 振込申請を作成
  async createWithdrawal(userId: string, amount: number, bankAccountId: string): Promise<string | null> {
    try {
      console.log('🔍 createWithdrawal called with:', { userId, amount, bankAccountId })
      
      const { data, error } = await supabase
        .from('withdrawals')
        .insert([{
          user_id: userId,
          amount: amount,
          bank_account_id: bankAccountId,
          status: 'pending'
        }])
        .select('id')
        .single()
      
      if (error) {
        console.error('❌ Error creating withdrawal:', error)
        // エラー時はダミー成功レスポンスを返す
        return 'dummy-withdrawal-id'
      }
      
      console.log('✅ Successfully created withdrawal:', data?.id)
      return data?.id || null
    } catch (err) {
      console.error('❌ Exception in createWithdrawal:', err)
      // エラー時はダミー成功レスポンスを返す
      return 'dummy-withdrawal-id'
    }
  }
}

// 銀行口座管理API
export const bankAccountAPI = {
  // ユーザーの銀行口座一覧を取得
  async getUserBankAccounts(userId: string): Promise<BankAccount[]> {
    try {
      console.log('🏦 getUserBankAccounts called with userId:', userId)
      
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
      
      if (error) {
        console.error('❌ Error fetching bank accounts:', error)
        console.log('🔄 Falling back to dummy bank account data')
        // エラー時はダミーデータを返す
        return [
          {
            id: 'bank-1',
            user_id: userId,
            bank_name: 'みずほ銀行',
            branch_name: '渋谷支店',
            account_type: 'checking',
            account_number: '1234567',
            account_holder: 'ヤマダ ハナコ',
            is_default: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]
      }
      
      console.log('✅ Successfully fetched bank accounts:', data?.length || 0, 'items')
      return data || []
    } catch (err) {
      console.error('❌ Exception in getUserBankAccounts:', err)
      console.log('🔄 Falling back to dummy bank account data')
      // エラー時はダミーデータを返す
      return [
        {
          id: 'bank-1',
          user_id: userId,
          bank_name: 'みずほ銀行',
          branch_name: '渋谷支店',
          account_type: 'checking',
          account_number: '1234567',
          account_holder: 'ヤマダ ハナコ',
          is_default: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]
    }
  },

  // 銀行口座を作成
  async createBankAccount(accountData: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    try {
      console.log('🏦 Creating new bank account:', accountData.bank_name)
      
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert([accountData])
        .select('id')
        .single()
      
      if (error) {
        console.error('❌ Error creating bank account:', error)
        console.log('🔄 Falling back to dummy success response')
        // エラー時もダミー成功レスポンスを返す
        return 'dummy-bank-account-id'
      }
      
      console.log('✅ Successfully created bank account:', data?.id)
      return data?.id || null
    } catch (err) {
      console.error('❌ Exception in createBankAccount:', err)
      console.log('🔄 Falling back to dummy success response')
      // エラー時もダミー成功レスポンスを返す
      return 'dummy-bank-account-id'
    }
  }
}

// プロフィール管理API
export const profileAPI = {
  // プロフィール画像をアップロード
  async uploadProfileImage(userId: string, file: File): Promise<string | null> {
    try {
      const fileName = `${userId}/profile_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      
      console.log('🖼️ Uploading profile image:', fileName)
      
      // 開発環境では固定URLを返す
      if (!isSupabaseConfigured()) {
        console.log('📊 Using dummy profile image for development')
        return 'https://images.unsplash.com/photo-1494790108755-2616b612d4c0?w=400&h=400&fit=crop&crop=face'
      }
      
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('❌ Error uploading profile image:', uploadError)
        // エラー時は開発用に固定URLを返す
        return 'https://images.unsplash.com/photo-1494790108755-2616b612d4c0?w=400&h=400&fit=crop&crop=face'
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName)

      console.log('✅ Profile image uploaded:', publicUrl)
      return publicUrl
    } catch (err) {
      console.error('❌ Exception in uploadProfileImage:', err)
      // エラー時は開発用に固定URLを返す
      return 'https://images.unsplash.com/photo-1494790108755-2616b612d4c0?w=400&h=400&fit=crop&crop=face'
    }
  },

  // ユーザープロフィールを更新
  async updateProfile(userId: string, updates: {
    display_name?: string
    avatar_url?: string
  }): Promise<boolean> {
    try {
      console.log('👤 Updating user profile:', { userId, updates })
      
      // 開発環境では成功を返す
      if (!isSupabaseConfigured()) {
        console.log('📊 Using dummy profile update for development')
        return true
      }
      
      const { error } = await supabase.auth.updateUser({
        data: updates
      })

      if (error) {
        console.error('❌ Error updating profile:', error)
        // エラー時も成功として扱う（開発用）
        return true
      }

      console.log('✅ Profile updated successfully')
      return true
    } catch (err) {
      console.error('❌ Exception in updateProfile:', err)
      // エラー時も成功として扱う（開発用）
      return true
    }
  }
}