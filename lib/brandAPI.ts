import { supabase } from './supabase'

export interface Brand {
  id: string
  canonical_name: string
  japanese_name?: string
  katakana_name?: string
  hiragana_name?: string
  aliases?: string[]
  description?: string
  country?: string
  website_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
  match_score?: number
}

export interface BrandSearchResult {
  brands: Brand[]
  total: number
}

/**
 * ブランド検索API
 * ローマ字、漢字、カタカナ、ひらがなでの検索に対応
 */
export const searchBrands = async (
  searchTerm: string, 
  limit: number = 20
): Promise<BrandSearchResult> => {
  try {
    if (!searchTerm.trim()) {
      // 空の検索語の場合は人気ブランドを返す
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('canonical_name')
        .limit(limit)

      if (error) throw error

      return {
        brands: data || [],
        total: data?.length || 0
      }
    }

    // カスタム検索関数を使用
    const { data, error } = await supabase
      .rpc('search_brands', {
        search_term: searchTerm.trim(),
        limit_count: limit
      })

    if (error) throw error

    return {
      brands: data || [],
      total: data?.length || 0
    }
  } catch (error) {
    console.error('Brand search error:', error)
    throw new Error('ブランド検索に失敗しました')
  }
}

/**
 * 人気ブランド一覧を取得
 */
export const getPopularBrands = async (limit: number = 20): Promise<Brand[]> => {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('is_active', true)
      .order('canonical_name')
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Popular brands fetch error:', error)
    throw new Error('人気ブランドの取得に失敗しました')
  }
}

/**
 * ブランドIDから詳細情報を取得
 */
export const getBrandById = async (id: string): Promise<Brand | null> => {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Brand fetch by ID error:', error)
    return null
  }
}

/**
 * ブランド名を正規化（表示用）
 */
export const normalizeBrandName = (brand: Brand | string): string => {
  if (typeof brand === 'string') {
    return brand
  }

  // 日本語名があれば日本語名を優先、なければ正式名称
  return brand.japanese_name || brand.canonical_name
}

/**
 * ブランド名を検索用に正規化
 */
export const normalizeBrandForSearch = (brandName: string): string => {
  return brandName
    .trim()
    .replace(/[　\s]+/g, ' ') // 全角・半角スペースを統一
    .replace(/・/g, ' ') // 中点をスペースに変換
    .toLowerCase()
}

/**
 * 新しいブランドを作成または既存ブランドを取得
 */
export const createOrGetBrand = async (brandName: string): Promise<Brand> => {
  try {
    const normalizedName = normalizeBrandForSearch(brandName)
    
    // まず既存ブランドを検索
    const searchResult = await searchBrands(normalizedName, 1)
    
    if (searchResult.brands.length > 0) {
      // 既存ブランドが見つかった場合
      return searchResult.brands[0]
    }

    // 新しいブランドを作成
    const { data, error } = await supabase
      .from('brands')
      .insert({
        canonical_name: brandName.trim(),
        japanese_name: null,
        katakana_name: null,
        hiragana_name: null,
        aliases: [],
        is_active: true
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Create or get brand error:', error)
    throw new Error('ブランドの作成に失敗しました')
  }
}

/**
 * ブランド使用統計を取得（将来的な機能）
 */
export const getBrandUsageStats = async (): Promise<{
  brand_id: string
  brand_name: string
  usage_count: number
}[]> => {
  try {
    // listingsテーブルとjoinsしてブランド使用統計を取得
    const { data, error } = await supabase
      .from('listings')
      .select(`
        brand,
        brands!inner(canonical_name, japanese_name)
      `)
      .eq('status', 'published')

    if (error) throw error

    // ブランド別の使用回数を集計
    const stats = (data || []).reduce((acc: any, listing: any) => {
      const brandName = listing.brands?.japanese_name || listing.brands?.canonical_name || listing.brand
      if (!acc[brandName]) {
        acc[brandName] = {
          brand_name: brandName,
          usage_count: 0
        }
      }
      acc[brandName].usage_count++
      return acc
    }, {})

    return Object.values(stats)
      .sort((a: any, b: any) => b.usage_count - a.usage_count)
      .slice(0, 20)
  } catch (error) {
    console.error('Brand usage stats error:', error)
    return []
  }
}