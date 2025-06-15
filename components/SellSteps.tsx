'use client'

import React, { useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Save } from 'lucide-react'
import PhotoUploadStep from './sell-steps/PhotoUploadStep'
import SizeMeasurementStep from './sell-steps/SizeMeasurementStep'
import BrandDetailsStep from './sell-steps/BrandDetailsStep'
import PricingStep from './sell-steps/PricingStep'

interface FormData {
  // Step 1: 写真 (必須: 1枚以上)
  images: File[]
  previews: string[]
  
  // Step 2: サイズ・採寸
  size: string // 必須
  bust: string // 必須（3つのうち最低2つ）
  waist: string // 必須（3つのうち最低2つ）
  hip: string // 必須（3つのうち最低2つ）
  height: string // 任意
  shoulderWidth: string // 任意
  sleeveLength: string // 任意
  totalLength: string // 任意
  
  // Step 3: 基本情報
  title: string // 必須
  brand: string // 必須
  color: string // 必須
  condition: string // 必須
  ownerHistory: string // 必須
  modelName: string // 任意
  manufactureYear: string // 任意
  silhouette: string // 任意
  neckline: string // 任意
  sleeveStyle: string // 任意
  skirtLength: string // 任意
  features: string // 任意
  
  // Step 4: 価格・その他
  price: string // 必須
  originalPrice: string // 任意
  description: string // 任意
  wearCount: string // 任意
  isCleaned: boolean // 任意
  acceptOffers: boolean // 任意
  
  // カテゴリーとカスタム採寸情報
  category: string // 必須
  customMeasurements: {
    bust?: string
    waist?: string
    hip?: string
    length?: string
  }
}

interface Step {
  id: number
  title: string
  description: string
  completed: boolean
  current: boolean
}

interface SellStepsProps {
  onSubmit: (formData: FormData, isDraft?: boolean) => Promise<void>
  loading: boolean
  error: string
  setError: (error: string) => void
  uploadProgress: number
  initialData?: FormData
  isEditMode?: boolean
}

export default function SellSteps({ onSubmit, loading, error, setError, uploadProgress, initialData, isEditMode = false }: SellStepsProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [showDraftModal, setShowDraftModal] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    images: [],
    previews: [],
    size: '',
    bust: '',
    waist: '',
    hip: '',
    height: '',
    shoulderWidth: '',
    sleeveLength: '',
    totalLength: '',
    title: '',
    brand: '',
    color: '',
    condition: '',
    ownerHistory: '',
    modelName: '',
    manufactureYear: '',
    silhouette: '',
    neckline: '',
    sleeveStyle: '',
    skirtLength: '',
    features: '',
    price: '',
    originalPrice: '',
    description: '',
    wearCount: '',
    isCleaned: false,
    acceptOffers: false,
    category: 'mermaid',
    customMeasurements: {}
  })

  // 初期データが変更されたときにフォームデータを更新
  React.useEffect(() => {
    if (initialData) {
      console.log('🔄 初期データを設定中:', initialData)
      setFormData(initialData)
    }
  }, [initialData])

  const steps: Step[] = [
    {
      id: 1,
      title: '写真アップロード',
      description: 'ドレスの写真を最大10枚まで登録',
      completed: currentStep > 1,
      current: currentStep === 1
    },
    {
      id: 2,
      title: 'サイズ・採寸',
      description: 'サイズと詳細な採寸情報',
      completed: currentStep > 2,
      current: currentStep === 2
    },
    {
      id: 3,
      title: 'ブランド・詳細',
      description: 'ブランド、商品詳細、状態',
      completed: currentStep > 3,
      current: currentStep === 3
    },
    {
      id: 4,
      title: '価格設定',
      description: '販売価格と定価の設定',
      completed: false,
      current: currentStep === 4
    }
  ]

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  // 下書き保存機能
  const saveDraft = () => {
    const draftData = {
      ...formData,
      currentStep,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem('sellFormDraft', JSON.stringify(draftData))
    alert('下書きを保存しました')
  }

  // 下書き読み込み
  const loadDraft = () => {
    const savedDraft = localStorage.getItem('sellFormDraft')
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft)
        // 画像以外のデータを復元
        const { images, previews, currentStep: savedStep, savedAt, ...restData } = draftData
        setFormData(prev => ({ ...prev, ...restData }))
        setCurrentStep(savedStep || 1)
        setShowDraftModal(false)
        alert('下書きを復元しました')
      } catch (error) {
        console.error('下書きの読み込みに失敗しました:', error)
      }
    }
  }

  // 下書き削除
  const deleteDraft = () => {
    localStorage.removeItem('sellFormDraft')
    setShowDraftModal(false)
  }

  // ページロード時に下書きの存在をチェック
  React.useEffect(() => {
    const savedDraft = localStorage.getItem('sellFormDraft')
    if (savedDraft) {
      setShowDraftModal(true)
    }
  }, [])

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        // 画像がアップロード済み、または既存画像（previews）がある場合
        return formData.images.length > 0 || formData.previews.length > 0
      case 2:
        // サイズのみ必須（スリーサイズは任意）
        return formData.size !== ''
      case 3:
        return formData.title.trim() !== '' && formData.brand.trim() !== '' && 
               formData.color.trim() !== '' && formData.condition !== '' && formData.ownerHistory !== ''
      case 4:
        return formData.price.trim() !== '' && parseInt(formData.price) > 0
      default:
        return false
    }
  }

  const getRequiredFieldsCount = (step: number): { completed: number; total: number } => {
    switch (step) {
      case 1:
        // 画像がアップロード済み、または既存画像がある場合
        const hasImages = formData.images.length > 0 || formData.previews.length > 0
        return { completed: hasImages ? 1 : 0, total: 1 }
      case 2:
        // サイズのみ必須
        const sizeCompleted = formData.size !== '' ? 1 : 0
        return { completed: sizeCompleted, total: 1 }
      case 3:
        const step3Fields = [formData.title, formData.brand, formData.color, formData.condition, formData.ownerHistory]
        const completed3 = step3Fields.filter(field => typeof field === 'string' ? field.trim() !== '' : field !== '').length
        return { completed: completed3, total: 5 }
      case 4:
        const priceCompleted = formData.price.trim() !== '' && parseInt(formData.price) > 0 ? 1 : 0
        return { completed: priceCompleted, total: 1 }
      default:
        return { completed: 0, total: 0 }
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
      setError('')
    } else {
      setError(getValidationError(currentStep))
    }
  }

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError('')
  }

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!isDraft && !validateStep(4)) {
      setError(getValidationError(4))
      return
    }
    
    // FormDataを適切な形式に変換
    const submitData = {
      ...formData,
      customMeasurements: {
        bust: formData.bust || undefined,
        waist: formData.waist || undefined,
        hip: formData.hip || undefined,
        length: formData.totalLength || undefined
      }
    }
    
    await onSubmit(submitData, isDraft)
  }

  const getValidationError = (step: number): string => {
    switch (step) {
      case 1:
        return '写真を最低1枚アップロードしてください'
      case 2:
        return 'サイズを選択してください'
      case 3:
        return '必須項目をすべて入力してください'
      case 4:
        return '有効な価格を入力してください'
      default:
        return '入力内容を確認してください'
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PhotoUploadStep
            images={formData.images}
            previews={formData.previews}
            updateFormData={updateFormData}
            error={error}
            setError={setError}
          />
        )
      case 2:
        return (
          <SizeMeasurementStep
            size={formData.size}
            bust={formData.bust}
            waist={formData.waist}
            hip={formData.hip}
            height={formData.height}
            shoulderWidth={formData.shoulderWidth}
            sleeveLength={formData.sleeveLength}
            totalLength={formData.totalLength}
            updateFormData={updateFormData}
          />
        )
      case 3:
        return (
          <BrandDetailsStep
            title={formData.title}
            brand={formData.brand}
            color={formData.color}
            condition={formData.condition}
            ownerHistory={formData.ownerHistory}
            modelName={formData.modelName}
            manufactureYear={formData.manufactureYear}
            silhouette={formData.silhouette}
            neckline={formData.neckline}
            sleeveStyle={formData.sleeveStyle}
            skirtLength={formData.skirtLength}
            features={formData.features}
            updateFormData={updateFormData}
          />
        )
      case 4:
        return (
          <PricingStep
            price={formData.price}
            originalPrice={formData.originalPrice}
            description={formData.description}
            wearCount={formData.wearCount}
            isCleaned={formData.isCleaned}
            acceptOffers={formData.acceptOffers}
            updateFormData={updateFormData}
            formData={formData}
            uploadProgress={uploadProgress}
            loading={loading}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* プログレスインジケーター */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium ${
                    step.completed
                      ? 'bg-[var(--primary-green)] border-[var(--primary-green)] text-white'
                      : step.current
                      ? 'border-[var(--primary-green)] text-[var(--primary-green)] bg-white'
                      : 'border-gray-300 text-gray-400 bg-white'
                  }`}
                >
                  {step.completed ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    step.current ? 'text-[var(--primary-green)]' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className="h-0.5 bg-gray-200">
                    <div
                      className={`h-full bg-[var(--primary-green)] transition-all duration-300 ${
                        step.completed ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* モバイル用ステップ表示 */}
        <div className="sm:hidden text-center">
          <p className="text-sm font-medium text-[var(--primary-green)]">
            {steps[currentStep - 1].title}
          </p>
          <p className="text-xs text-gray-400">
            ステップ {currentStep} / {steps.length}
          </p>
          {(() => {
            const progress = getRequiredFieldsCount(currentStep)
            return (
              <p className="text-xs text-gray-500 mt-1">
                必須項目 {progress.completed}/{progress.total} 完了
              </p>
            )
          })()}
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 下書き復元モーダル */}
      {showDraftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              下書きが見つかりました
            </h3>
            <p className="text-gray-600 mb-6">
              前回の入力内容が保存されています。復元しますか？
            </p>
            <div className="flex space-x-3">
              <button
                onClick={loadDraft}
                className="btn btn-primary flex-1"
              >
                復元する
              </button>
              <button
                onClick={deleteDraft}
                className="btn btn-ghost flex-1"
              >
                新規作成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ステップコンテンツ */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            {(() => {
              const progress = getRequiredFieldsCount(currentStep)
              return (
                <p className="text-sm text-gray-500">
                  必須項目 {progress.completed}/{progress.total} 完了
                </p>
              )
            })()}
          </div>
          <button
            onClick={saveDraft}
            className="btn btn-ghost btn-sm"
          >
            <Save className="w-4 h-4 mr-1" />
            下書き保存
          </button>
        </div>
        {renderCurrentStep()}
      </div>

      {/* ナビゲーション */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStep === 1}
          className={`btn btn-ghost ${
            currentStep === 1
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          戻る
        </button>

        <div className="text-sm text-gray-500">
          {currentStep} / {steps.length}
        </div>

        {currentStep === 4 ? (
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="btn btn-ghost"
            >
              <Save className="w-4 h-4 mr-1" />
              下書き保存
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading || !validateStep(4)}
              className={`btn ${
                loading || !validateStep(4)
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {loading ? (isEditMode ? '更新中...' : '出品中...') : (isEditMode ? '更新して公開' : '公開して出品')}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!validateStep(currentStep)}
            className={`btn ${
              !validateStep(currentStep)
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            次へ
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        )}
      </div>
    </div>
  )
}