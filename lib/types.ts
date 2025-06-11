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

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  bio?: string
  created_at: string
  updated_at: string
}

export interface DressWithSeller extends Dress {
  seller: User
}

// サイズマッピングシステム
export interface SizeMapping {
  gou: string
  us: string
}

export const sizeMapping: Record<string, SizeMapping> = {
  'XS': { gou: '7号', us: 'US 0-2' },
  'S': { gou: '9号', us: 'US 2-4' },
  'M': { gou: '11号', us: 'US 6-8' },
  'L': { gou: '13号', us: 'US 10-12' },
  'XL': { gou: '15号', us: 'US 14-16' },
  'XXL': { gou: '17号', us: 'US 18-20' }
}

// サイズ表示用のユーティリティ関数
export const formatSizeDisplay = (size: string, context: 'detail' | 'card' | 'filter') => {
  // 既存の号数のみのサイズ（例：9号、11号）をS・M・Lに変換
  const gouToSize: Record<string, string> = {
    '7号': 'XS',
    '9号': 'S', 
    '11号': 'M',
    '13号': 'L',
    '15号': 'XL',
    '17号': 'XXL'
  }

  // すでにS・M・L形式の場合はそのまま使用
  let mainSize = size
  if (size.includes('号') && gouToSize[size]) {
    mainSize = gouToSize[size]
  }

  const mapping = sizeMapping[mainSize]
  if (!mapping) {
    // マッピングがない場合は元のサイズをそのまま返す
    return size
  }

  switch (context) {
    case 'detail':
      return `${mainSize} (${mapping.gou}・${mapping.us})`
    case 'card':
      return `${mainSize} (${mapping.gou})`
    case 'filter':
      return mainSize
    default:
      return size
  }
}

// サイズから号数を取得
export const getSizeGou = (size: string): string => {
  const mapping = sizeMapping[size]
  return mapping ? mapping.gou : size
}

// サイズからUSサイズを取得
export const getSizeUS = (size: string): string => {
  const mapping = sizeMapping[size]
  return mapping ? mapping.us : ''
}

// マイページ関連の型定義

// 閲覧履歴アイテム
export interface ViewHistoryItem {
  id: string
  viewedAt: string
  dress: {
    id: string
    title: string
    brand: string
    price: number
    images: string[]
    size: string
    condition: string
  }
}

// 出品管理アイテム
export interface MyListing {
  id: string
  status: 'active' | 'sold' | 'draft' | 'inactive'
  createdAt: string
  views: number
  inquiries: number
  dress: Dress
}

// ユーザー統計情報
export interface UserStats {
  listingsCount: number
  favoritesCount: number
  viewHistoryCount: number
  totalViews: number
  totalInquiries: number
}