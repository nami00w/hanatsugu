'use client'

import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { DressWithSeller } from '@/lib/types'
import ContactModal from '@/components/ContactModal'
import Header from '@/components/Header'
import { useFavorites } from '@/hooks/useFavorites'

export default function ProductDetailPage() {
  const params = useParams()
  const [dress, setDress] = useState<DressWithSeller | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const { toggleFavorite, isFavorite } = useFavorites()
  
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
    // ダミーデータから商品を取得
    const foundDress = dummyDresses.find(d => d.id === params.id)
    setDress(foundDress as DressWithSeller || null)
    setLoading(false)
  }, [params.id, dummyDresses])
  
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    )
  }

  if (!dress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">商品が見つかりませんでした</div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      {/* パンくずリスト */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-800">トップ</Link>
            <span className="mx-2">›</span>
            <Link href={`/search?brand=${dress.brand}`} className="hover:text-gray-800">{dress.brand}</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-800">{dress.title}</span>
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
                          w-full aspect-[3/4] 
                          lg:aspect-[3/4]"
                style={{
                  maxHeight: 'min(45vh, calc(100vw - 2rem))',
                  minHeight: '250px'
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
                          className="hidden lg:block absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
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
                          className="hidden lg:block absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
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
                  <span className="text-lg sm:text-xl lg:text-4xl font-bold text-pink-600">
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

                {/* お気に入り・シェア・質問ボタン（PC版のみ） */}
                <div className="hidden lg:block lg:mb-6">
                  {/* お気に入り・シェアボタン */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button 
                      onClick={() => toggleFavorite(dress.id)}
                      className={`py-3 rounded-lg font-medium transition-colors border-2 flex items-center justify-center gap-2 ${
                        isFavorite(dress.id) 
                          ? 'bg-pink-50 border-pink-600 text-pink-600' 
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {isFavorite(dress.id) ? '❤️' : '🤍'}
                      <span>{isFavorite(dress.id) ? 'お気に入り済み' : 'お気に入りに追加'}</span>
                    </button>
                    
                    <button className="py-3 rounded-lg font-medium border-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <span>🔗</span>
                      <span>シェア</span>
                    </button>
                  </div>
                  
                  {/* 質問ボタン */}
                  <button 
                    onClick={() => setShowContactModal(true)}
                    className="w-full bg-pink-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-pink-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    💌 この商品について質問する
                  </button>
                </div>
              </div>

              {/* 商品詳細 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">商品詳細</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">サイズ</span>
                    <p className="font-semibold text-gray-800">{dress.size}</p>
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
        
        {/* 関連商品セクション */}
        <div className="mt-16 mb-32 lg:mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">関連商品</h2>
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">関連商品を準備中です</p>
          </div>
        </div>
      </div>
      
      {/* モバイル用固定ボタン */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        {/* お気に入り・シェアボタン */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button 
            onClick={() => toggleFavorite(dress.id)}
            className={`py-3 rounded-lg font-medium transition-colors border-2 flex items-center justify-center gap-2 ${
              isFavorite(dress.id) 
                ? 'bg-pink-50 border-pink-600 text-pink-600' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {isFavorite(dress.id) ? '❤️' : '🤍'}
            <span className="text-sm">{isFavorite(dress.id) ? 'お気に入り済み' : 'お気に入り'}</span>
          </button>
          
          <button className="py-3 rounded-lg font-medium border-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <span>🔗</span>
            <span className="text-sm">シェア</span>
          </button>
        </div>
        
        {/* 質問ボタン */}
        <button 
          onClick={() => setShowContactModal(true)}
          className="w-full bg-pink-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-pink-700 transition-colors shadow-lg"
        >
          💌 この商品について質問する
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowImageModal(false)}>
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
    </div>
  )
}