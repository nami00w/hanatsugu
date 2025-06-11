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

  const handleSubmit = async (formData: FormData, isDraft: boolean = false) => {
    console.log('=== handleSubmit開始 ===')
    console.log('formData:', formData)
    console.log('isDraft:', isDraft)
    
    setError('')
    setLoading(true)

    try {
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
      const totalImages = formData.images.length
      console.log('画像アップロード開始 - 画像数:', totalImages)
      
      for (let i = 0; i < formData.images.length; i++) {
        const image = formData.images[i]
        const fileName = `${userId}/${Date.now()}_${image.name}`
        console.log(`画像 ${i + 1}/${totalImages} - ファイル名:`, fileName)
        
        // 進捗を更新
        setUploadProgress(Math.round(((i + 1) / totalImages) * 100))
        
        console.log('Supabaseストレージにアップロード中...')
        const { error: uploadError } = await supabase.storage
          .from('dress-images')
          .upload(fileName, image)

        if (uploadError) {
          console.error('画像アップロードエラー:', uploadError)
          throw uploadError
        }
        console.log('画像アップロード成功')

        const { data: { publicUrl } } = supabase.storage
          .from('dress-images')
          .getPublicUrl(fileName)
        console.log('公開URL:', publicUrl)

        imageUrls.push(publicUrl)
      }

      // ドレス情報を保存
      const insertData = {
        title: formData.title,
        description: formData.description,
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
        custom_measurements: formData.customMeasurements.bust || formData.customMeasurements.waist || 
                           formData.customMeasurements.hip || formData.customMeasurements.length ? 
                           formData.customMeasurements : null,
      }
      
      console.log('データベースに保存するデータ:', insertData)

      const { error: insertError } = await supabase
        .from('dresses')
        .insert(insertData)

      if (insertError) {
        console.error('データベース挿入エラー:', insertError)
        throw insertError
      }
      console.log('データベース保存成功')

      const message = isDraft ? '下書きとして保存しました！' : '出品が完了しました！'
      console.log('=== handleSubmit完了 ===', message)
      alert(message)
      router.push('/')
    } catch (error) {
      console.error('=== handleSubmitエラー ===', error)
      console.error('エラーの詳細:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      })
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