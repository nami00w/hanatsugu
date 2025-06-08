import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import LoginModal from './LoginModal';

interface DressCardProps {
  id: string | number;
  brand: string;
  model: string;
  size: string;
  price: number;
  originalPrice: number;
  imageUrl?: string;
}

export default function DressCard({
  id,
  brand,
  model,
  size,
  price,
  originalPrice,
  imageUrl,
}: DressCardProps) {
  const { isLoggedIn, isFavorite, toggleFavorite } = useFavorites()
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  const dressId = id.toString()
  const isFavorited = isFavorite(dressId)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault() // Linkの遷移を防ぐ
    e.stopPropagation()
    
    const success = toggleFavorite(dressId)
    if (!success) {
      // ログインが必要な場合、モーダルを表示
      setShowLoginModal(true)
    }
  }
  return (
    <Link href={`/products/${id}`} className="cursor-pointer group block mb-4 min-w-0">
      {/* 画像部分 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
        <div className="aspect-[2/3] bg-gray-50 relative overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${brand} ${model}`}
              fill
              className="object-cover group-hover:scale-102 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-gray-400">No Image</p>
              </div>
            </div>
          )}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-300 ${
              isLoggedIn ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <svg
              className={`w-5 h-5 transition-colors ${
                isFavorited 
                  ? 'text-pink-600 fill-pink-600' 
                  : 'text-gray-600 hover:text-pink-500'
              }`}
              fill={isFavorited ? "currentColor" : "none"}
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
          {brand}
        </h3>
        <p className="text-sm text-gray-600 truncate">{model}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 pt-1">
          <span>サイズ {size}</span>
          <span className="text-green-600">
            Save {Math.round((1 - price / originalPrice) * 100)}%
          </span>
        </div>
        
        <p className="text-xl font-bold text-pink-600 pt-1">
          ¥{price.toLocaleString()}
        </p>
      </div>
      
      {/* ログインモーダル */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </Link>
  );
}