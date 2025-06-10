'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'

export default function SellPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    brand: '',
    size: '',
    color: '',
    condition: '',
    category: '',
  })
  
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const user = localStorage.getItem('dummyUser')
    if (!user) {
      router.push('/auth/login?redirect=/sell')
    } else {
      setIsAuthenticated(true)
      setIsLoading(false)
    }
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 5) {
      setError('画像は最大5枚までアップロードできます')
      return
    }

    setImages(prev => [...prev, ...files])
    
    // プレビュー生成
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // ユーザー確認
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // 画像をアップロード
      const imageUrls: string[] = []
      for (const image of images) {
        const fileName = `${user.id}/${Date.now()}_${image.name}`
        const { error: uploadError } = await supabase.storage
          .from('dress-images')
          .upload(fileName, image)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('dress-images')
          .getPublicUrl(fileName)

        imageUrls.push(publicUrl)
      }

      // ドレス情報を保存
      const { error: insertError } = await supabase
        .from('dresses')
        .insert({
          title: formData.title,
          description: formData.description,
          price: parseInt(formData.price),
          original_price: parseInt(formData.originalPrice),
          brand: formData.brand,
          size: formData.size,
          color: formData.color,
          condition: formData.condition,
          category: formData.category,
          images: imageUrls,
          seller_id: user.id,
        })

      if (insertError) throw insertError

      alert('出品が完了しました！')
      router.push('/')
    } catch (error) {
      setError((error as Error).message || '出品に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">ドレスを出品する</h1>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* 画像アップロード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              商品画像（最大5枚）
            </label>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {previews.length < 5 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </label>
              )}
            </div>
          </div>

          {/* タイトル */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              商品タイトル
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            />
          </div>

          {/* ブランド */}
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
              ブランド名
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              required
              value={formData.brand}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            />
          </div>

          {/* 価格 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                販売価格（円）
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                value={formData.price}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700">
                定価（円）
              </label>
              <input
                type="number"
                id="originalPrice"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              />
            </div>
          </div>

          {/* サイズ・カラー */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                サイズ
              </label>
              <select
                id="size"
                name="size"
                required
                value={formData.size}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              >
                <option value="">選択してください</option>
                <option value="5号">5号</option>
                <option value="7号">7号</option>
                <option value="9号">9号</option>
                <option value="11号">11号</option>
                <option value="13号">13号</option>
                <option value="15号">15号</option>
                <option value="17号">17号</option>
              </select>
            </div>
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                カラー
              </label>
              <input
                type="text"
                id="color"
                name="color"
                required
                value={formData.color}
                onChange={handleInputChange}
                placeholder="例：ホワイト、アイボリー"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              />
            </div>
          </div>

          {/* 状態・カテゴリー */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
                商品の状態
              </label>
              <select
                id="condition"
                name="condition"
                required
                value={formData.condition}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              >
                <option value="">選択してください</option>
                <option value="新品・未使用">新品・未使用</option>
                <option value="未使用に近い">未使用に近い</option>
                <option value="目立った傷や汚れなし">目立った傷や汚れなし</option>
                <option value="やや傷や汚れあり">やや傷や汚れあり</option>
                <option value="傷や汚れあり">傷や汚れあり</option>
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                カテゴリー
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              >
                <option value="">選択してください</option>
                <option value="Aライン">Aライン</option>
                <option value="プリンセスライン">プリンセスライン</option>
                <option value="マーメイドライン">マーメイドライン</option>
                <option value="スレンダーライン">スレンダーライン</option>
                <option value="エンパイアライン">エンパイアライン</option>
              </select>
            </div>
          </div>

          {/* 商品説明 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              商品説明
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              placeholder="商品の詳細、購入時期、使用回数などを記載してください"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || images.length === 0}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:bg-gray-400"
            >
              {loading ? '出品中...' : '出品する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}