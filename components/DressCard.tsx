import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import LoginModal from './LoginModal';

interface DressCardProps {
  id: string | number;
  brand: string;
  model?: string;
  title?: string;
  size: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  images?: string[];
}

export default function DressCard({
  id,
  brand,
  model,
  title,
  size,
  price,
  originalPrice,
  imageUrl,
  images,
}: DressCardProps) {
  const { isLoggedIn, isFavorite, toggleFavorite } = useFavorites()
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  const dressId = id.toString()
  const isFavorited = isFavorite(dressId)
  
  // 表示用の画像URLを決定
  const displayImageUrl = imageUrl || (images && images[0]) || '/placeholder-dress.jpg'
  
  // 表示用のタイトルを決定
  const displayTitle = title || (model ? `${brand} ${model}` : brand)

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault() // Linkの遷移を防ぐ
    e.stopPropagation()
    
    console.log('🔍 Favorite button clicked:', { dressId, isLoggedIn })
    
    const success = await toggleFavorite(dressId)
    if (!success) {
      // ログインが必要な場合、モーダルを表示
      console.log('❌ Login required, showing modal')
      setShowLoginModal(true)
    } else {
      console.log('✅ Favorite toggled successfully')
    }
  }
  return (
    <Link href={`/products/${id}`} className="cursor-pointer group block mb-4 min-w-0">
      {/* 画像部分 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
        <div className="aspect-[2/3] bg-gray-50 relative overflow-hidden">
          <Image
            src={displayImageUrl}
            alt={displayTitle}
            fill
            className="object-cover group-hover:scale-102 transition-transform duration-500"
          />
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <svg
              className={`w-5 h-5 transition-colors ${
                isLoggedIn && isFavorited 
                  ? 'text-pink-600 fill-pink-600' 
                  : 'text-gray-600 hover:text-pink-500'
              }`}
              fill={isLoggedIn && isFavorited ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
      </div>
      
      {/* テキスト部分（カード外） */}
      <div className="mt-3 space-y-1">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
          {displayTitle}
        </h3>
        <p className="text-sm text-gray-600 truncate">{brand}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 pt-1">
          <span>サイズ {size}</span>
          {originalPrice && originalPrice > price && (
            <span className="text-green-600">
              Save {Math.round((1 - price / originalPrice) * 100)}%
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 pt-1">
          <p className="text-xl font-bold text-pink-600">
            ¥{price.toLocaleString()}
          </p>
          {originalPrice && originalPrice > price && (
            <p className="text-sm text-gray-400 line-through">
              ¥{originalPrice.toLocaleString()}
            </p>
          )}
        </div>
      </div>
      
      {/* ログインモーダル */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </Link>
  );
}