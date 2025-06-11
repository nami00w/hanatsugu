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