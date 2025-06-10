'use client'

import { useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Save } from 'lucide-react'
import PhotoUploadStep from './sell-steps/PhotoUploadStep'
import SizeMeasurementStep from './sell-steps/SizeMeasurementStep'
import BrandDetailsStep from './sell-steps/BrandDetailsStep'
import PricingStep from './sell-steps/PricingStep'

interface FormData {
  // 写真
  images: File[]
  previews: string[]
  // サイズ・採寸
  size: string
  customMeasurements: {
    bust: string
    waist: string
    hip: string
    length: string
  }
  // ブランド・詳細
  title: string
  brand: string
  category: string
  color: string
  condition: string
  description: string
  // 価格
  price: string
  originalPrice: string
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
}

export default function SellSteps({ onSubmit, loading, error, setError, uploadProgress }: SellStepsProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    images: [],
    previews: [],
    size: '',
    customMeasurements: {
      bust: '',
      waist: '',
      hip: '',
      length: ''
    },
    title: '',
    brand: '',
    category: '',
    color: '',
    condition: '',
    description: '',
    price: '',
    originalPrice: ''
  })

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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.images.length > 0
      case 2:
        return formData.size !== ''
      case 3:
        return formData.title.trim() !== '' && formData.brand.trim() !== '' && 
               formData.category !== '' && formData.color.trim() !== '' && 
               formData.condition !== '' && formData.description.trim() !== ''
      case 4:
        return formData.price.trim() !== '' && parseInt(formData.price) > 0
      default:
        return false
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
    await onSubmit(formData, isDraft)
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
            customMeasurements={formData.customMeasurements}
            updateFormData={updateFormData}
          />
        )
      case 3:
        return (
          <BrandDetailsStep
            title={formData.title}
            brand={formData.brand}
            category={formData.category}
            color={formData.color}
            condition={formData.condition}
            description={formData.description}
            updateFormData={updateFormData}
          />
        )
      case 4:
        return (
          <PricingStep
            price={formData.price}
            originalPrice={formData.originalPrice}
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
                      ? 'bg-pink-600 border-pink-600 text-white'
                      : step.current
                      ? 'border-pink-600 text-pink-600 bg-white'
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
                    step.current ? 'text-pink-600' : 'text-gray-500'
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
                      className={`h-full bg-pink-600 transition-all duration-300 ${
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
          <p className="text-sm font-medium text-pink-600">
            {steps[currentStep - 1].title}
          </p>
          <p className="text-xs text-gray-400">
            ステップ {currentStep} / {steps.length}
          </p>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* ステップコンテンツ */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        {renderCurrentStep()}
      </div>

      {/* ナビゲーション */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStep === 1}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            currentStep === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
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
              className="flex items-center px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg transition-colors hover:bg-gray-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-1" />
              下書き保存
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading || !validateStep(4)}
              className={`flex items-center px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                loading || !validateStep(4)
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-pink-600 text-white hover:bg-pink-700'
              }`}
            >
              {loading ? '出品中...' : '公開して出品'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!validateStep(currentStep)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              !validateStep(currentStep)
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-pink-600 text-white hover:bg-pink-700'
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