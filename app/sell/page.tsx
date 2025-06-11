'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import SellSteps from '@/components/SellSteps'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface FormData {
  images: File[]
  previews: string[]
  size: string
  customMeasurements: {
    bust: string
    waist: string
    hip: string
    length: string
  }
  title: string
  brand: string
  category: string
  color: string
  condition: string
  description: string
  price: string
  originalPrice: string
}

export default function SellPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
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

  // バリデーション関数
  const validateFormData = (formData: any, isDraft: boolean): string | null => {
    // 必須項目チェック（下書きでない場合）
    if (!isDraft) {
      if (!formData.title?.trim()) return '商品タイトルを入力してください'
      if (!formData.brand?.trim()) return 'ブランド名を入力してください'
      if (!formData.color) return 'カラーを選択してください'
      if (!formData.condition) return '商品の状態を選択してください'
      if (!formData.ownerHistory) return 'オーナー履歴を選択してください'
      if (!formData.size) return 'サイズを選択してください'
      if (!formData.price?.trim()) return '販売価格を入力してください'
      if (formData.images.length === 0) return '写真を最低1枚アップロードしてください'
    }

    // 価格のバリデーション
    if (formData.price?.trim()) {
      const price = parseInt(formData.price)
      if (isNaN(price) || price <= 0) return '有効な販売価格を入力してください'
      if (price > 10000000) return '販売価格は1000万円以下で設定してください'
    }

    if (formData.originalPrice?.trim()) {
      const originalPrice = parseInt(formData.originalPrice)
      if (isNaN(originalPrice) || originalPrice <= 0) return '有効な定価を入力してください'
    }

    // タイトルの長さチェック
    if (formData.title && formData.title.length > 100) {
      return '商品タイトルは100文字以内で入力してください'
    }

    // 説明文の長さチェック
    if (formData.description && formData.description.length > 1000) {
      return '商品説明は1000文字以内で入力してください'
    }

    // 採寸データのチェック
    const measurements = [formData.bust, formData.waist, formData.hip].filter(m => m?.trim())
    if (!isDraft && measurements.length < 2) {
      return 'バスト・ウエスト・ヒップのうち最低2つの採寸データを入力してください'
    }

    return null
  }

  // 画像クリーンアップ関数
  const cleanupUploadedImages = async (fileNames: string[]) => {
    console.log('アップロード済み画像のクリーンアップ開始:', fileNames)
    for (const fileName of fileNames) {
      try {
        await supabase.storage
          .from('dress-images')
          .remove([fileName])
        console.log('削除成功:', fileName)
      } catch (error) {
        console.error('削除失敗:', fileName, error)
      }
    }
  }

  const handleSubmit = async (formData: any, isDraft: boolean = false) => {
    console.log('=== handleSubmit開始 ===')
    console.log('formData:', formData)
    console.log('isDraft:', isDraft)
    
    setError('')
    setLoading(true)

    try {
      // データ整合性チェック
      const validationError = validateFormData(formData, isDraft)
      if (validationError) {
        setError(validationError)
        return
      }
      // ユーザー確認
      let userId: string
      const dummyAuth = localStorage.getItem('dummyAuth')
      console.log('dummyAuth:', dummyAuth)
      
      if (dummyAuth) {
        // ダミー認証の場合
        userId = localStorage.getItem('dummyUserId') || 'dummy-user-id'
        console.log('ダミー認証使用 - userId:', userId)
      } else {
        // 実際の認証の場合
        console.log('Supabase認証確認中...')
        const { data: { user } } = await supabase.auth.getUser()
        console.log('Supabase user:', user)
        if (!user) {
          console.log('ユーザー未認証 - ログインページへリダイレクト')
          router.push('/auth/login')
          return
        }
        userId = user.id
      }

      // 画像をアップロード
      const imageUrls: string[] = []
      const uploadedFileNames: string[] = []
      const totalImages = formData.images.length
      console.log('画像アップロード開始 - 画像数:', totalImages)
      
      try {
        for (let i = 0; i < formData.images.length; i++) {
          const image = formData.images[i]
          const fileName = `${userId}/${Date.now()}_${i}_${image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
          console.log(`画像 ${i + 1}/${totalImages} - ファイル名:`, fileName)
          
          // 進捗を更新
          setUploadProgress(Math.round(((i + 1) / totalImages) * 50)) // 50%まで（残り50%はデータ保存）
          
          console.log('Supabaseストレージにアップロード中...')
          const { error: uploadError } = await supabase.storage
            .from('dress-images')
            .upload(fileName, image, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error('画像アップロードエラー:', uploadError)
            // 部分的にアップロードされた画像を削除
            await cleanupUploadedImages(uploadedFileNames)
            throw new Error(`画像のアップロードに失敗しました: ${uploadError.message}`)
          }
          console.log('画像アップロード成功')

          uploadedFileNames.push(fileName)

          const { data: { publicUrl } } = supabase.storage
            .from('dress-images')
            .getPublicUrl(fileName)
          console.log('公開URL:', publicUrl)

          imageUrls.push(publicUrl)
        }
      } catch (uploadError) {
        // アップロード失敗時のクリーンアップ
        await cleanupUploadedImages(uploadedFileNames)
        throw uploadError
      }

      // データ保存進捗を更新
      setUploadProgress(75)
      console.log('データベースへの保存開始')

      // ドレス情報を保存
      const insertData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        price: parseInt(formData.price),
        original_price: formData.originalPrice ? parseInt(formData.originalPrice) : null,
        brand: formData.brand,
        size: formData.size,
        color: formData.color,
        condition: formData.condition,
        category: formData.category,
        owner_history: formData.ownerHistory,
        images: imageUrls,
        seller_id: userId,
        status: isDraft ? 'draft' : 'published',
        // カスタム採寸情報
        measurements: formData.customMeasurements.bust || formData.customMeasurements.waist || 
                     formData.customMeasurements.hip || formData.customMeasurements.length ? 
                     formData.customMeasurements : null,
        // 詳細情報
        features: formData.features ? [formData.features] : null,
        silhouette: formData.silhouette || null,
        neckline: formData.neckline || null,
        sleeve_style: formData.sleeveStyle || null,
        skirt_length: formData.skirtLength || null,
        model_name: formData.modelName || null,
        manufacture_year: formData.manufactureYear ? parseInt(formData.manufactureYear) : null,
        wear_count: formData.wearCount || null,
        is_cleaned: Boolean(formData.isCleaned),
        accept_offers: Boolean(formData.acceptOffers)
      }
      
      console.log('データベースに保存するデータ:', insertData)

      const { data: insertedData, error: insertError } = await supabase
        .from('listings')
        .insert(insertData)
        .select('id')
        .single()

      if (insertError) {
        console.error('データベース挿入エラー:', insertError)
        // データ保存に失敗した場合、アップロードした画像を削除
        await cleanupUploadedImages(uploadedFileNames)
        throw new Error(`データの保存に失敗しました: ${insertError.message}`)
      }
      
      const listingId = insertedData.id
      console.log('データベース保存成功 - ID:', listingId)
      
      // 完了進捗を更新
      setUploadProgress(100)

      console.log('=== handleSubmit完了 ===', isDraft ? '下書き保存' : '出品完了')
      
      // 下書きデータをクリア
      localStorage.removeItem('sellFormDraft')
      
      // 出品完了ページにリダイレクト
      router.push(`/sell/complete?id=${listingId}&draft=${isDraft}`)
    } catch (error) {
      console.error('=== handleSubmitエラー ===', error)
      console.error('エラーの詳細:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      })
      
      // エラーメッセージを日本語で表示
      let errorMessage = '出品に失敗しました'
      
      if (error instanceof Error) {
        if (error.message.includes('storage')) {
          errorMessage = '画像のアップロードに失敗しました'
        } else if (error.message.includes('insert')) {
          errorMessage = 'データの保存に失敗しました'
        } else if (error.message.includes('auth')) {
          errorMessage = 'ログインが必要です'
        }
      }
      
      setError(errorMessage)
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* 戻るボタン */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-pink-600 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">トップページに戻る</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ドレスを出品する</h1>
          <p className="text-gray-600">
            4つのステップで簡単出品
          </p>
        </div>

        <SellSteps
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          setError={setError}
          uploadProgress={uploadProgress}
        />
      </div>
    </div>
  )
}