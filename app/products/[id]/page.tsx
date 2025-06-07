'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { DressWithSeller } from '@/lib/types'
import ContactModal from '@/components/ContactModal'

export default function ProductDetailPage() {
  const params = useParams()
  const [dress, setDress] = useState<DressWithSeller | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showContactModal, setShowContactModal] = useState(false)

  // ダミーデータ
  const dummyDresses = [
    {
      id: "1",
      title: "VERA WANG Liesel エレガントドレス",
      description: "VERA WANGの人気モデル「Liesel」です。\n\n2023年に購入し、1度のみ着用いたしました。\nクリーニング済みで、目立った汚れや傷はございません。\n\n上質なシルクとレースを使用した、とても美しいドレスです。\n挙式後は大切に保管しておりましたが、どなたかにお譲りできればと思います。",
      price: 128000,
      original_price: 380000,
      images: [
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&h=1200",
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1200",
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=1200"
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
        avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150",
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
        "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&h=1200",
        "https://images.unsplash.com/photo-1525258801829-654deb0e0a5e?w=800&h=1200"
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
        "https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=800&h=1000&fit=crop"
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
        "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1623470638880-e39bf6b83ff9?w=800&h=1000&fit=crop"
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
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1452033648730-57c06a86db55?w=800&h=1000&fit=crop"
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
    },
    {
      id: "6",
      title: "Marchesa Grecian ロイヤルドレス",
      description: "Marchesaの「Grecian」コレクションより、ロイヤルスタイルのドレスです。\n\n手刺繍のレースとシルクオーガンザを使用した、まさに芸術品のような美しさです。\n2022年にニューヨークで購入いたしました。\n\n着用は挙式当日の1回のみで、専門クリーニング済みです。\n一生に一度の特別な日にふさわしい、最高級のドレスです。",
      price: 178000,
      original_price: 450000,
      images: [
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1594736797933-d0801ba5fe65?w=800&h=1000&fit=crop",
        "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&h=1000&fit=crop"
      ],
      size: "9号",
      brand: "Marchesa",
      condition: "未使用に近い",
      color: "オフホワイト",
      category: "プリンセスライン",
      seller_id: "seller6",
      created_at: "2024-02-20",
      updated_at: "2024-02-20",
      seller: {
        id: "seller6",
        email: "seller6@example.com",
        name: "伊藤 優香",
        avatar_url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
        bio: "海外の高級ブランドドレスを専門に扱っています。品質にこだわりを持っています。",
        created_at: "2024-01-25",
        updated_at: "2024-01-25"
      }
    }
  ]

  useEffect(() => {
    // ダミーデータから商品を取得
    const foundDress = dummyDresses.find(d => d.id === params.id)
    setDress(foundDress as DressWithSeller || null)
    setLoading(false)
  }, [params.id])

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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* 画像ギャラリー */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
            {dress.images && dress.images.length > 0 ? (
              <Image
                src={dress.images[selectedImage]}
                alt={dress.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                画像がありません
              </div>
            )}
          </div>
          
          {/* サムネイル */}
          {dress.images && dress.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {dress.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-pink-500' : 'border-transparent'
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
        </div>

        {/* 商品情報 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{dress.title}</h1>
            <p className="text-sm text-gray-600">{dress.brand}</p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-pink-600">
              ¥{dress.price.toLocaleString()}
            </span>
            {dress.original_price && (
              <span className="text-lg text-gray-500 line-through">
                ¥{dress.original_price.toLocaleString()}
              </span>
            )}
          </div>

          <div className="space-y-4 pb-6 border-b">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">サイズ</span>
                <p className="font-medium">{dress.size}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">カラー</span>
                <p className="font-medium">{dress.color}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">状態</span>
                <p className="font-medium">{dress.condition}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">カテゴリー</span>
                <p className="font-medium">{dress.category}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">商品説明</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{dress.description}</p>
          </div>

          {/* 出品者情報 */}
          {dress.seller && (
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold">出品者情報</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full overflow-hidden">
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
                <div>
                  <p className="font-medium">{dress.seller.name}</p>
                  {dress.seller.bio && (
                    <p className="text-sm text-gray-600 mt-1">{dress.seller.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="space-y-3">
            <button 
              onClick={() => setShowContactModal(true)}
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors"
            >
              お問い合わせする
            </button>
            <button className="w-full border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              お気に入りに追加
            </button>
          </div>
        </div>
      </div>

      {/* お問い合わせモーダル */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        dressId={dress.id}
        dressTitle={dress.title}
        sellerId={dress.seller_id}
      />
    </div>
  )
}