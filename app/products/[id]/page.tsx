'use client'

import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Heart, Share2, Mail } from 'lucide-react'
import { DressWithSeller, formatSizeDisplay } from '@/lib/types'
import ContactModal from '@/components/ContactModal'
import Header from '@/components/Header'
import { useFavorites } from '@/hooks/useFavorites'
import { useShareProduct } from '@/hooks/useShareProduct'
import { useViewHistory } from '@/hooks/useViewHistory'
import ShareModal from '@/components/ShareModal'
import RelatedProductsCarousel from '@/components/RelatedProductsCarousel'
import { supabase } from '@/lib/supabase'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [dress, setDress] = useState<DressWithSeller | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const { toggleFavorite, isFavorite } = useFavorites()
  const { shareProduct } = useShareProduct()
  const { addToHistory } = useViewHistory()
  
  // スワイプ用の状態管理
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // ダミーデータ
  const dummyDresses = useMemo(() => [
    {
      id: "1",
      title: "VERA WANG Liesel エレガントドレス",
      description: "VERA WANGの人気モデル「Liesel」です。\n\n2023年に購入し、1度のみ着用いたしました。\nクリーニング済みで、目立った汚れや傷はございません。\n\n上質なシルクとレースを使用した、とても美しいドレスです。\n挙式後は大切に保管しておりましたが、どなたかにお譲りできればと思います。",
      price: 128000,
      original_price: 380000,
      images: [
        "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=800&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1200&fit=crop"
      ],
      size: "9号",
      brand: "VERA WANG",
      condition: "未使用に近い",
      color: "アイボリー",
      category: "Aライン",
      seller_id: "seller1",
      created_at: "2024-01-15",
      updated_at: "2024-01-15",
      seller: {
        id: "seller1",
        email: "seller1@example.com",
        name: "田中 美咲",
        avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        bio: "結婚式を終えた素敵なドレスをお譲りしています。大切に使っていただける方にお渡しできれば嬉しいです。",
        created_at: "2024-01-01",
        updated_at: "2024-01-01"
      }
    },
    {
      id: "2",
      title: "Pronovias Draco ロマンチックドレス",
      description: "Pronoviasの美しいドレス「Draco」です。\n\nレースとビーズの装飾が施された、とてもエレガントなデザインです。\n2022年購入、着用回数は1回のみです。\n\nサイズ調整済みですが、さらに調整も可能です。\n特別な日を彩る素敵なドレスです。",
      price: 95000,
      original_price: 280000,
      images: [
        "https://images.unsplash.com/photo-1565378781267-616ed0977ce5?w=800&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1522621032211-ac0031dfbddc?w=800&h=1200&fit=crop"
      ],
      size: "11号",
      brand: "Pronovias",
      condition: "未使用に近い",
      color: "ホワイト",
      category: "プリンセスライン",
      seller_id: "seller2",
      created_at: "2024-01-20",
      updated_at: "2024-01-20",
      seller: {
        id: "seller2",
        email: "seller2@example.com",
        name: "佐藤 花子",
        avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        bio: "海外ブランドのドレスを中心に出品しています。",
        created_at: "2024-01-05",
        updated_at: "2024-01-05"
      }
    },
    {
      id: "3",
      title: "ANTONIO RIVA Gemma クラシックドレス",
      description: "イタリアの高級ブランド ANTONIO RIVA の「Gemma」です。\n\n上質なシルクサテンと手作業のビーズワークが美しいドレスです。\n2023年に海外で購入しました。\n\n着用は挙式当日の1回のみで、とても良い状態です。\nクリーニング・メンテナンス済みです。",
      price: 168000,
      original_price: 420000,
      images: [
        "https://images.unsplash.com/photo-1522653216850-4f1415a174fb?w=800&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=800&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=800&h=1200&fit=crop"
      ],
      size: "7号",
      brand: "ANTONIO RIVA",
      condition: "未使用に近い",
      color: "シャンパン",
      category: "マーメイドライン",
      seller_id: "seller3",
      created_at: "2024-02-01",
      updated_at: "2024-02-01",
      seller: {
        id: "seller3",
        email: "seller3@example.com",
        name: "山田 麗子",
        avatar_url: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
        bio: "海外挙式で使用したドレスです。次の花嫁様に大切に着ていただきたいです。",
        created_at: "2024-01-10",
        updated_at: "2024-01-10"
      }
    },
    {
      id: "4",
      title: "Temperley London Iris モダンドレス",
      description: "Temperley Londonの洗練されたデザイン「Iris」です。\n\nモダンでありながらクラシックな要素も兼ね備えた美しいドレスです。\n英国で購入し、2024年の春に着用いたしました。\n\n細部まで丁寧に作られた、とても上品なドレスです。\n保管状態も良好で、次の方にも美しく着ていただけると思います。",
      price: 145000,
      original_price: 350000,
      images: [
        "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=800&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1623470638880-e39bf6b83ff9?w=800&h=1200&fit=crop"
      ],
      size: "9号",
      brand: "Temperley London",
      condition: "未使用に近い",
      color: "クリーム",
      category: "スレンダーライン",
      seller_id: "seller4",
      created_at: "2024-02-10",
      updated_at: "2024-02-10",
      seller: {
        id: "seller4",
        email: "seller4@example.com",
        name: "鈴木 愛美",
        avatar_url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face",
        bio: "英国在住時に購入したドレスです。上質な素材と美しいデザインが自慢です。",
        created_at: "2024-01-15",
        updated_at: "2024-01-15"
      }
    },
    {
      id: "5",
      title: "JENNY PACKHAM Hermione グラマラスドレス",
      description: "JENNY PACKHAMの豪華なドレス「Hermione」です。\n\nスパンコールとビーズワークが施された、とてもゴージャスなデザインです。\n2023年購入、着用は1回のみです。\n\nサイズ13号ですが、体型に合わせて調整も可能です。\n特別な日にふさわしい、印象的なドレスです。",
      price: 198000,
      original_price: 480000,
      images: [
        "https://images.unsplash.com/photo-1522621032211-ac0031dfbddc?w=800&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=1200&fit=crop"
      ],
      size: "13号",
      brand: "JENNY PACKHAM",
      condition: "未使用に近い",
      color: "シルバー",
      category: "マーメイドライン",
      seller_id: "seller5",
      created_at: "2024-02-15",
      updated_at: "2024-02-15",
      seller: {
        id: "seller5",
        email: "seller5@example.com",
        name: "高橋 真美",
        avatar_url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face",
        bio: "ゴージャスなドレスがお好みの方におすすめです。大きめサイズも豊富に取り扱っています。",
        created_at: "2024-01-20",
        updated_at: "2024-01-20"
      }
    }
  ], [])

  useEffect(() => {
    const fetchDress = async () => {
      try {
        setLoading(true)
        
        // Supabaseから商品データを取得
        const { data: listingData, error: listingError } = await supabase
          .from('listings')
          .select('*')
          .eq('id', params.id)
          .eq('status', 'published')
          .single()

        if (listingError) {
          console.error('商品取得エラー:', listingError)
          setDress(null)
          setLoading(false)
          return
        }

        if (listingData) {
          // プロファイル情報を別途取得
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', listingData.user_id)
            .single()

          // データを DressWithSeller 形式に変換
          const dressData: DressWithSeller = {
            id: listingData.id,
            title: listingData.title,
            description: listingData.description || '',
            price: listingData.price,
            original_price: listingData.original_price,
            images: listingData.images || [],
            size: listingData.size,
            brand: listingData.brand,
            condition: listingData.condition,
            color: listingData.color,
            category: listingData.category,
            seller_id: listingData.user_id,
            created_at: listingData.created_at,
            updated_at: listingData.updated_at,
            seller: {
              id: listingData.user_id,
              email: '',
              name: profileData?.full_name || '出品者',
              avatar_url: '',
              bio: '',
              created_at: '',
              updated_at: ''
            },
            owner_history: listingData.owner_history,
            measurements: listingData.measurements,
            features: listingData.features,
            silhouette: listingData.silhouette,
            neckline: listingData.neckline,
            sleeve_style: listingData.sleeve_style,
            skirt_length: listingData.skirt_length,
            model_name: listingData.model_name,
            manufacture_year: listingData.manufacture_year,
            wear_count: listingData.wear_count,
            is_cleaned: listingData.is_cleaned,
            accept_offers: listingData.accept_offers
          }
          
          setDress(dressData)
          
          // 閲覧履歴に追加（一度だけ）
          setTimeout(() => {
            addToHistory({
              id: dressData.id,
              title: dressData.title,
              brand: dressData.brand,
              price: dressData.price,
              images: dressData.images,
              size: dressData.size,
              condition: dressData.condition
            })
          }, 100)
        } else {
          setDress(null)
        }
      } catch (error) {
        console.error('商品取得エラー:', error)
        setDress(null)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchDress()
    }
  }, [params.id])

  // 関連商品用のデータ（ProductListと同じ構造＋各ブランドに複数商品）
  const allProducts = useMemo(() => [
    { 
      id: "1", 
      brand: "VERA WANG", 
      model: "Liesel", 
      size: "9号", 
      price: 128000, 
      originalPrice: 380000, 
      imageUrl: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
    },
    { 
      id: "13", 
      brand: "VERA WANG", 
      model: "Eleanor", 
      size: "7号", 
      price: 155000, 
      originalPrice: 420000, 
      imageUrl: "https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
    },
    { 
      id: "14", 
      brand: "VERA WANG", 
      model: "Diana", 
      size: "11号", 
      price: 185000, 
      originalPrice: 480000, 
      imageUrl: "https://images.unsplash.com/photo-1518136247453-74e7b5265980?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
    },
    { 
      id: "2", 
      brand: "Pronovias", 
      model: "Draco", 
      size: "11号", 
      price: 95000, 
      originalPrice: 280000, 
      imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
    },
    { 
      id: "15", 
      brand: "Pronovias", 
      model: "Atelier", 
      size: "9号", 
      price: 125000, 
      originalPrice: 320000, 
      imageUrl: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
    },
    { 
      id: "3", 
      brand: "ANTONIO RIVA", 
      model: "Gemma", 
      size: "7号", 
      price: 168000, 
      originalPrice: 420000, 
      imageUrl: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
    },
    { 
      id: "16", 
      brand: "ANTONIO RIVA", 
      model: "Sophia", 
      size: "13号", 
      price: 198000, 
      originalPrice: 450000, 
      imageUrl: "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
    },
    { 
      id: "4", 
      brand: "Temperley London", 
      model: "Iris", 
      size: "9号", 
      price: 145000, 
      originalPrice: 350000, 
      imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
    },
    { 
      id: "17", 
      brand: "Temperley London", 
      model: "Rose", 
      size: "S", 
      price: 165000, 
      originalPrice: 380000, 
      imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
    },
    { 
      id: "5", 
      brand: "JENNY PACKHAM", 
      model: "Hermione", 
      size: "13号", 
      price: 198000, 
      originalPrice: 480000, 
      imageUrl: "https://images.unsplash.com/photo-1495298599282-d8920eb5009b?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
    },
    { 
      id: "18", 
      brand: "JENNY PACKHAM", 
      model: "Luna", 
      size: "M", 
      price: 175000, 
      originalPrice: 420000, 
      imageUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
    },
    { 
      id: "6", 
      brand: "Marchesa", 
      model: "Grecian", 
      size: "9号", 
      price: 178000, 
      originalPrice: 450000, 
      imageUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
    },
    { 
      id: "7", 
      brand: "Oscar de la Renta", 
      model: "Botanical", 
      size: "7号", 
      price: 85000, 
      originalPrice: 250000, 
      imageUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
    },
    { 
      id: "8", 
      brand: "Monique Lhuillier", 
      model: "Swan", 
      size: "S", 
      price: 220000, 
      originalPrice: 550000, 
      imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
    },
    { 
      id: "9", 
      brand: "Carolina Herrera", 
      model: "Grace", 
      size: "M", 
      price: 135000, 
      originalPrice: 320000, 
      imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
    },
    { 
      id: "10", 
      brand: "Elie Saab", 
      model: "Dream", 
      size: "L", 
      price: 195000, 
      originalPrice: 480000, 
      imageUrl: "https://images.unsplash.com/photo-1495298599282-d8920eb5009b?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
    },
    { 
      id: "11", 
      brand: "Reem Acra", 
      model: "Enchanted", 
      size: "XS", 
      price: 75000, 
      originalPrice: 180000, 
      imageUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
    },
    { 
      id: "12", 
      brand: "Hayley Paige", 
      model: "Cosmos", 
      size: "15号", 
      price: 110000, 
      originalPrice: 280000, 
      imageUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?ixlib=rb-4.0.3&w=800&h=1200&fit=crop"
    },
  ], [])

  // シェア機能
  const handleShare = async () => {
    const shareData = {
      title: dress?.title || '素敵なウェディングドレス',
      text: 'Hanatsuguで見つけた素敵なドレス',
      url: window.location.href,
    }

    const result = await shareProduct(shareData)
    if (!result.success && result.method === 'fallback') {
      setShowShareModal(true)
    }
  }
  
  // スワイプハンドラー
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !dress || !dress.images) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    
    if (isLeftSwipe && selectedImage < dress.images.length - 1) {
      setSelectedImage(prev => prev + 1)
    }
    if (isRightSwipe && selectedImage > 0) {
      setSelectedImage(prev => prev - 1)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">読み込み中...</div>
        </div>
      </>
    )
  }

  if (!dress) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">商品が見つかりませんでした</div>
        </div>
      </>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      {/* パンくずリスト */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex text-xs sm:text-sm text-gray-600 items-center">
            <Link href="/" className="hover:text-gray-800 flex-shrink-0">トップ</Link>
            <span className="mx-1 sm:mx-2 flex-shrink-0">›</span>
            <Link href={`/search?brand=${dress.brand}`} className="hover:text-gray-800 flex-shrink-0 truncate">{dress.brand}</Link>
            <span className="mx-1 sm:mx-2 flex-shrink-0">›</span>
            <span className="text-gray-800 truncate">{dress.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-8">
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-12">
          {/* 画像ギャラリー */}
          <div className="lg:flex lg:gap-4">
            {/* サムネイル（PC: 左側縦配置） */}
            {dress.images && dress.images.length > 1 && (
              <div className="hidden lg:block lg:w-20 lg:space-y-3">
                {dress.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border-2 transition-all hover:opacity-80 ${
                      selectedImage === index ? 'border-pink-500 ring-2 ring-pink-200' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${dress.title} ${index + 1}`}
                      fill
                      sizes="100px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            
            {/* メイン画像 */}
            <div className="flex-1">
              <div 
                className="relative bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in group 
                          w-full aspect-[2/3] 
                          lg:aspect-[2/3]"
                style={{
                  maxHeight: 'min(65vh, calc(100vw - 2rem))',
                  minHeight: '300px'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {dress.images && dress.images.length > 0 ? (
                  <>
                    <Image
                      src={dress.images[selectedImage]}
                      alt={dress.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform group-hover:scale-105"
                      priority
                      onClick={() => setShowImageModal(true)}
                    />
                    {/* PC用拡大アイコン */}
                    <div className="hidden lg:block absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                    
                    {/* PC用左右ナビゲーション */}
                    {dress.images.length > 1 && (
                      <>
                        {/* 左矢印 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedImage(prev => prev > 0 ? prev - 1 : dress.images!.length - 1)
                          }}
                          className="hidden lg:block absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 rounded-full p-3 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-opacity-100 hover:shadow-lg"
                        >
                          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        {/* 右矢印 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedImage(prev => prev < dress.images!.length - 1 ? prev + 1 : 0)
                          }}
                          className="hidden lg:block absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 rounded-full p-3 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-opacity-100 hover:shadow-lg"
                        >
                          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                    
                    {/* モバイル用左右ナビゲーション */}
                    {dress.images.length > 1 && (
                      <>
                        {/* 左矢印 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedImage(prev => prev > 0 ? prev - 1 : dress.images!.length - 1)
                          }}
                          className="lg:hidden absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md"
                        >
                          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        {/* 右矢印 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedImage(prev => prev < dress.images!.length - 1 ? prev + 1 : 0)
                          }}
                          className="lg:hidden absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md"
                        >
                          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        
                        {/* インジケーター */}
                        <div className="lg:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {dress.images.map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full transition-all ${
                                selectedImage === index 
                                  ? 'bg-white w-6' 
                                  : 'bg-white bg-opacity-60'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    画像がありません
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 商品情報 */}
          <div className="lg:relative mt-3 lg:mt-0">
            <div className="lg:sticky lg:top-8 lg:h-fit space-y-4 lg:space-y-8">
              <div>
                <h1 className="text-lg sm:text-xl lg:text-3xl font-bold mb-1 lg:mb-3 text-gray-800 leading-tight">{dress.title}</h1>
                <p className="text-sm lg:text-lg text-gray-600 mb-2 lg:mb-4">{dress.brand}</p>
                
                {/* 価格 */}
                <div className="flex items-baseline gap-1 sm:gap-2 lg:gap-3 mb-3 lg:mb-6 flex-wrap">
                  <span className="text-lg sm:text-xl lg:text-4xl font-bold text-gray-900">
                    ¥{dress.price.toLocaleString()}
                  </span>
                  {dress.original_price && (
                    <>
                      <span className="text-sm sm:text-base lg:text-xl text-gray-500 line-through">
                        ¥{dress.original_price.toLocaleString()}
                      </span>
                      <span className="bg-red-100 text-red-800 text-xs lg:text-sm font-medium px-1.5 py-0.5 lg:px-2 lg:py-1 rounded">
                        {Math.round((1 - dress.price / dress.original_price) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* お気に入り・シェア・質問・購入ボタン（PC版のみ） */}
                <div className="hidden lg:block lg:mb-6">
                  {/* お気に入り・シェア・質問ボタン */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <button 
                      onClick={() => toggleFavorite(dress.id)}
                      className={`py-3 rounded-lg font-medium transition-colors border-2 flex items-center justify-center gap-2 ${
                        isFavorite(dress.id) 
                          ? 'bg-gray-100 border-gray-400 text-gray-700' 
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Heart 
                        className={`w-5 h-5 ${isFavorite(dress.id) ? 'fill-gray-600 text-gray-600' : ''}`}
                        fill={isFavorite(dress.id) ? "currentColor" : "none"}
                        strokeWidth={1.5}
                      />
                      <span>お気に入り</span>
                    </button>
                    
                    <button 
                      onClick={handleShare}
                      className="py-3 rounded-lg font-medium border-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-5 h-5" strokeWidth={1.5} />
                      <span>シェア</span>
                    </button>
                    
                    <button 
                      onClick={() => setShowContactModal(true)}
                      className="py-3 rounded-lg font-medium border-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Mail className="w-5 h-5" strokeWidth={1.5} />
                      <span>質問</span>
                    </button>
                  </div>
                  
                  {/* 購入ボタン */}
                  <button 
                    onClick={() => router.push(`/purchase/${dress.id}`)}
                    className="w-full text-white py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
                    style={{ backgroundColor: '#6B8E4A' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5A7A3A'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6B8E4A'}
                  >
                    購入する
                  </button>
                </div>
              </div>

              {/* 商品詳細 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">商品詳細</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">サイズ</span>
                    <p className="font-semibold text-gray-800">{formatSizeDisplay(dress.size, 'detail')}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">カラー</span>
                    <p className="font-semibold text-gray-800">{dress.color}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">状態</span>
                    <p className="font-semibold text-gray-800">{dress.condition}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">カテゴリー</span>
                    <p className="font-semibold text-gray-800">{dress.category}</p>
                  </div>
                </div>
              </div>

              {/* 商品説明 */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">商品説明</h2>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{dress.description}</p>
                </div>
              </div>

              {/* 出品者情報 */}
              {dress.seller && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">出品者情報</h2>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
                      {dress.seller.avatar_url ? (
                        <Image
                          src={dress.seller.avatar_url}
                          alt={dress.seller.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-lg">{dress.seller.name}</p>
                      {dress.seller.bio && (
                        <p className="text-gray-600 mt-2 leading-relaxed">{dress.seller.bio}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
        
        {/* 関連商品カルーセル */}
        <div className="mt-16 lg:mt-20">
          {dress && (
            <RelatedProductsCarousel 
              currentProductId={dress.id}
              currentBrand={dress.brand}
              allProducts={allProducts}
            />
          )}
        </div>
      </div>
      
      {/* モバイル用固定ボタン */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40">
        {/* お気に入り・シェア・質問ボタン */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <button 
            onClick={() => toggleFavorite(dress.id)}
            className={`py-2 px-3 rounded-lg font-medium transition-colors border flex items-center justify-center gap-1 ${
              isFavorite(dress.id) 
                ? 'bg-gray-100 border-gray-400 text-gray-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Heart 
              className={`w-4 h-4 ${isFavorite(dress.id) ? 'fill-gray-600 text-gray-600' : ''}`}
              fill={isFavorite(dress.id) ? "currentColor" : "none"}
              strokeWidth={1.5}
            />
            <span className="text-xs">お気に入り</span>
          </button>
          
          <button 
            onClick={handleShare}
            className="py-2 px-3 rounded-lg font-medium border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
          >
            <Share2 className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-xs">シェア</span>
          </button>
          
          <button 
            onClick={() => setShowContactModal(true)}
            className="py-2 px-3 rounded-lg font-medium border bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
          >
            <Mail className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-xs">質問</span>
          </button>
        </div>
        
        {/* 購入ボタン */}
        <button 
          onClick={() => router.push(`/purchase/${dress.id}`)}
          className="w-full text-white py-3 rounded-lg font-semibold text-base transition-colors shadow-lg"
          style={{ backgroundColor: '#6B8E4A' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5A7A3A'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6B8E4A'}
        >
          購入する
        </button>
      </div>

      {/* お問い合わせモーダル */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        dressId={dress.id}
        dressTitle={dress.title}
        sellerId={dress.seller_id}
      />
      
      {/* 画像拡大モーダル */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="relative w-full h-full">
              <Image
                src={dress.images![selectedImage]}
                alt={dress.title}
                fill
                className="object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            {/* 画像ナビゲーション */}
            {dress.images && dress.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage(prev => prev > 0 ? prev - 1 : dress.images!.length - 1)
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage(prev => prev < dress.images!.length - 1 ? prev + 1 : 0)
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* シェアモーダル */}
      {dress && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareData={{
            title: dress.title,
            text: 'Hanatsuguで見つけた素敵なドレス',
            url: typeof window !== 'undefined' ? window.location.href : '',
          }}
        />
      )}
    </div>
  )
}