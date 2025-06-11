import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Heart } from 'lucide-react';
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
  condition?: string;
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
  condition,
}: DressCardProps) {
  const { isLoggedIn, isFavorite, toggleFavorite } = useFavorites()
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  const dressId = id.toString()
  const isFavorited = isFavorite(dressId)
  
  // 表示用の画像URLを決定
  const displayImageUrl = imageUrl || (images && images[0]) || '/placeholder-dress.jpg'
  
  // 表示用のタイトルを決定
  const displayTitle = title || (model ? `${brand} ${model}` : brand)
  
  // 状態バッジの表示テキストとスタイルを決定
  const getConditionBadge = (condition?: string) => {
    if (!condition) return null
    
    switch (condition) {
      case '新品・未使用':
      case '未使用に近い':
        return { text: '新品', style: 'bg-green-100 text-green-800' }
      case '目立った傷や汚れなし':
        return { text: '美品', style: 'bg-blue-100 text-blue-800' }
      case 'やや傷や汚れあり':
        return { text: '使用感あり', style: 'bg-orange-100 text-orange-800' }
      default:
        return { text: '美品', style: 'bg-blue-100 text-blue-800' }
    }
  }
  
  const conditionBadge = getConditionBadge(condition)

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault() // Linkの遷移を防ぐ
    e.stopPropagation()
    
    console.log('Favorite button clicked:', { dressId, isLoggedIn })
    
    const success = await toggleFavorite(dressId)
    if (!success) {
      // ログインが必要な場合、モーダルを表示
      console.log('Login required, showing modal')
      setShowLoginModal(true)
    } else {
      console.log('Favorite toggled successfully')
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
            <Heart
              className={`w-5 h-5 transition-colors ${
                isLoggedIn && isFavorited 
                  ? 'text-primary fill-primary' 
                  : 'text-gray-600 hover:text-primary'
              }`}
              fill={isLoggedIn && isFavorited ? "currentColor" : "none"}
              strokeWidth={1.5}
            />
          </button>
          
          {/* 状態バッジ */}
          {conditionBadge && (
            <div className="absolute top-3 left-3">
              <span className={`badge ${conditionBadge.style}`}>
                {conditionBadge.text}
              </span>
            </div>
          )}
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
          <p className="text-xl font-bold text-primary">
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