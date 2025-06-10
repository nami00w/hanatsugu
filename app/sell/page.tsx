'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import imageCompression from 'browser-image-compression'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Sortable画像アイテムコンポーネント
interface SortableImageProps {
  id: string
  preview: string
  index: number
  onRemove: (index: number) => void
}

function SortableImage({ id, preview, index, onRemove }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-move"
      >
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={preview}
            alt={`画像 ${index + 1}`}
            fill
            className="object-cover"
          />
          {index === 0 && (
            <div className="absolute top-2 left-2 bg-pink-600 text-white text-xs px-2 py-1 rounded">
              メイン画像
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

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
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  useEffect(() => {
    const dummyAuth = localStorage.getItem('dummyAuth')
    if (!dummyAuth) {
      router.push('/auth/login?redirect=/sell')
    } else {
      setIsAuthenticated(true)
      setIsLoading(false)
    }
  }, [router])

  // ドラッグ&ドロップのセンサー設定
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 画像圧縮関数
  const compressImage = useCallback(async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    }
    
    try {
      const compressedFile = await imageCompression(file, options)
      return compressedFile
    } catch (error) {
      console.error('画像圧縮エラー:', error)
      return file
    }
  }, [])

  // 画像処理（バリデーション、圧縮、プレビュー生成）
  const processImages = useCallback(async (files: File[]) => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    const validImages: File[] = [];
    const newPreviews: string[] = [];
    const errors: string[] = [];
    
    for (const file of files) {
      // ファイルタイプチェック
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}は対応していない形式です`);
        continue;
      }
      
      // ファイルサイズチェック
      if (file.size > MAX_FILE_SIZE) {
        // 圧縮を試みる
        const compressedFile = await compressImage(file);
        if (compressedFile.size > MAX_FILE_SIZE) {
          errors.push(`${file.name}のサイズが大きすぎます`);
          continue;
        }
        validImages.push(compressedFile);
      } else {
        // 2MB以上の場合は圧縮
        if (file.size > 2 * 1024 * 1024) {
          const compressedFile = await compressImage(file);
          validImages.push(compressedFile);
        } else {
          validImages.push(file);
        }
      }
      
      // プレビュー生成
      const preview = URL.createObjectURL(validImages[validImages.length - 1]);
      newPreviews.push(preview);
    }
    
    if (errors.length > 0) {
      setError(errors.join('、'));
      setTimeout(() => setError(''), 5000);
    }
    
    return { validImages, newPreviews };
  }, [compressImage])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // inputタグ用のハンドラー（現在は使用していないが、将来の利用のため残す）
  // const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = Array.from(e.target.files || [])
  //   await handleFiles(files)
  // }

  // ファイル処理の共通関数
  const handleFiles = useCallback(async (files: File[]) => {
    if (files.length + images.length > 10) {
      setError('画像は最大10枚までアップロードできます')
      return
    }

    const { validImages, newPreviews } = await processImages(files)
    
    if (validImages.length > 0) {
      setImages(prev => [...prev, ...validImages])
      setPreviews(prev => [...prev, ...newPreviews])
    }
  }, [images.length, processImages])

  // ドラッグ&ドロップの設定
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    await handleFiles(acceptedFiles)
  }, [handleFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 10 - images.length,
    disabled: images.length >= 10
  })

  // 画像の並び替え処理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = images.findIndex((_, index) => `image-${index}` === active.id)
      const newIndex = images.findIndex((_, index) => `image-${index}` === over?.id)
      
      setImages(arrayMove(images, oldIndex, newIndex))
      setPreviews(arrayMove(previews, oldIndex, newIndex))
    }
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
      let userId: string
      const dummyAuth = localStorage.getItem('dummyAuth')
      
      if (dummyAuth) {
        // ダミー認証の場合
        userId = localStorage.getItem('dummyUserId') || 'dummy-user-id'
      } else {
        // 実際の認証の場合
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }
        userId = user.id
      }

      // 画像をアップロード
      const imageUrls: string[] = []
      const totalImages = images.length
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        const fileName = `${userId}/${Date.now()}_${image.name}`
        
        // 進捗を更新
        setUploadProgress(Math.round(((i + 1) / totalImages) * 100))
        
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
          seller_id: userId,
        })

      if (insertError) throw insertError

      alert('出品が完了しました！')
      router.push('/')
    } catch (error) {
      setError((error as Error).message || '出品に失敗しました')
      setUploadProgress(0)
    } finally {
      setLoading(false)
      setUploadProgress(0)
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
              商品画像（最大10枚）
            </label>
            
            {images.length === 0 ? (
              // 画像がない時のドロップゾーン
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-pink-500 bg-pink-50' : 'border-gray-300 hover:border-gray-400'}`}
              >
                <input {...getInputProps()} />
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  {isDragActive ? '画像をドロップしてください' : 'クリックまたはドラッグ&ドロップで画像を追加'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPEG、PNG、WebP形式（最大10MB）
                </p>
              </div>
            ) : (
              // 画像がある時のグリッド表示
              <div className="space-y-4">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={images.map((_, index) => `image-${index}`)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {previews.map((preview, index) => (
                        <SortableImage
                          key={`image-${index}`}
                          id={`image-${index}`}
                          preview={preview}
                          index={index}
                          onRemove={removeImage}
                        />
                      ))}
                      
                      {images.length < 10 && (
                        <div
                          {...getRootProps()}
                          className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                        >
                          <input {...getInputProps()} />
                          <div className="text-center">
                            <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <p className="text-xs text-gray-500 mt-1">追加</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
                
                <p className="text-sm text-gray-500">
                  ドラッグして画像の順番を変更できます。最初の画像がメイン画像になります。
                </p>
              </div>
            )}
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
            
            {loading && uploadProgress > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>画像をアップロード中...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-pink-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}