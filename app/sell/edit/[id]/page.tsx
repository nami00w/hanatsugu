'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SellSteps from '@/components/SellSteps'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { dressesAPI } from '@/lib/supabase'
import type { Dress } from '@/lib/supabase'

interface SellFormData {
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
  ownerHistory: string
  bust: string
  waist: string
  hip: string
  features: string
  silhouette: string
  neckline: string
  sleeveStyle: string
  skirtLength: string
  modelName: string
  manufactureYear: string
  wearCount: string
  isCleaned: boolean
  acceptOffers: boolean
}

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [initialData, setInitialData] = useState<SellFormData | null>(null)

  const listingId = params.id as string

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?returnUrl=/mypage/listings')
    }
  }, [authLoading, isAuthenticated, router])

  // 既存の出品データを取得
  useEffect(() => {
    const loadListingData = async () => {
      if (!isAuthenticated || !listingId) return

      try {
        setInitialLoading(true)
        const dress = await dressesAPI.getDress(listingId)
        
        if (!dress) {
          setError('出品データが見つかりません')
          return
        }

        // Dress型をSellFormData型に変換
        const formData: SellFormData = {
          images: [], // 既存画像はFile[]として扱えないため空配列
          previews: dress.images || [],
          title: dress.title || '',
          brand: dress.brand || '',
          category: dress.category || '',
          color: dress.color || '',
          condition: dress.condition || '',
          description: dress.description || '',
          price: dress.price?.toString() || '',
          originalPrice: dress.original_price?.toString() || '',
          ownerHistory: dress.owner_history || '',
          size: dress.size || '',
          customMeasurements: {
            bust: dress.measurements?.bust || '',
            waist: dress.measurements?.waist || '',
            hip: dress.measurements?.hip || '',
            length: dress.measurements?.length || ''
          },
          bust: dress.measurements?.bust || '',
          waist: dress.measurements?.waist || '',
          hip: dress.measurements?.hip || '',
          features: Array.isArray(dress.features) ? dress.features.join(', ') : (dress.features || ''),
          silhouette: dress.silhouette || '',
          neckline: dress.neckline || '',
          sleeveStyle: dress.sleeve_style || '',
          skirtLength: dress.skirt_length || '',
          modelName: dress.model_name || '',
          manufactureYear: dress.manufacture_year?.toString() || '',
          wearCount: dress.wear_count || '',
          isCleaned: dress.is_cleaned || false,
          acceptOffers: dress.accept_offers || false
        }

        setInitialData(formData)
      } catch (err) {
        console.error('Failed to load listing data:', err)
        setError('出品データの読み込みに失敗しました')
      } finally {
        setInitialLoading(false)
      }
    }

    loadListingData()
  }, [isAuthenticated, listingId])

  // バリデーション関数
  const validateFormData = (formData: SellFormData, isDraft: boolean): string | null => {
    // 必須項目チェック（下書きでない場合）
    if (!isDraft) {
      if (!formData.title?.trim()) return '商品タイトルを入力してください'
      if (!formData.brand?.trim()) return 'ブランド名を入力してください'
      if (!formData.color) return 'カラーを選択してください'
      if (!formData.condition) return '商品の状態を選択してください'
      if (!formData.ownerHistory) return 'オーナー履歴を選択してください'
      if (!formData.size) return 'サイズを選択してください'
      if (!formData.price?.trim()) return '販売価格を入力してください'
      if (formData.images.length === 0 && formData.previews.length === 0) {
        return '写真を最低1枚アップロードしてください'
      }
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

  const handleSubmit = async (formData: SellFormData, isDraft: boolean = false) => {
    console.log('=== handleSubmit開始（編集モード） ===')
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

      // 新しい画像がある場合のみアップロード処理
      let imageUrls = formData.previews // 既存画像URLを保持
      if (formData.images.length > 0) {
        // 新しい画像をアップロード（既存のアップロード処理を使用）
        console.log('新しい画像をアップロード中:', formData.images.length, '枚')
        // ここで実際のアップロード処理を実装
        setUploadProgress(50)
      }

      // データ保存進捗を更新
      setUploadProgress(75)
      console.log('データベースへの更新開始')

      // ドレス情報を更新
      const updateData = {
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
      
      console.log('データベースに更新するデータ:', updateData)

      const success = await dressesAPI.updateDress(listingId, updateData)

      if (!success) {
        throw new Error('データの更新に失敗しました')
      }
      
      console.log('データベース更新成功')
      
      // 完了進捗を更新
      setUploadProgress(100)

      console.log('=== handleSubmit完了（編集モード） ===')
      
      // 編集完了後、出品管理ページにリダイレクト
      router.push('/mypage/listings')
    } catch (error) {
      console.error('=== handleSubmitエラー（編集モード） ===', error)
      
      // エラーメッセージを日本語で表示
      let errorMessage = '更新に失敗しました'
      
      if (error instanceof Error) {
        if (error.message.includes('storage')) {
          errorMessage = '画像のアップロードに失敗しました'
        } else if (error.message.includes('update')) {
          errorMessage = 'データの更新に失敗しました'
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

  if (authLoading || initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (error && !initialData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">エラーが発生しました</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            href="/mypage/listings"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            出品管理に戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* 戻るボタン */}
        <div className="mb-6">
          <Link 
            href="/mypage/listings"
            className="inline-flex items-center text-gray-600 hover:text-green-600 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">出品管理に戻る</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ドレス情報を編集</h1>
          <p className="text-gray-600">
            出品情報を更新できます
          </p>
        </div>

        {initialData && (
          <SellSteps
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            setError={setError}
            uploadProgress={uploadProgress}
            initialData={initialData}
            isEditMode={true}
          />
        )}
      </div>
    </div>
  )
}