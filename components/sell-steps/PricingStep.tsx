'use client'

import { useState } from 'react'
import { Banknote, Eye, Save, Upload, Sparkles, Lightbulb } from 'lucide-react'
import Image from 'next/image'

interface PricingStepProps {
  price: string
  originalPrice: string
  description: string
  wearCount: string
  isCleaned: boolean
  acceptOffers: boolean
  updateFormData: (updates: any) => void
  formData: any
  uploadProgress: number
  loading: boolean
}

export default function PricingStep({
  price,
  originalPrice,
  description,
  wearCount,
  isCleaned,
  acceptOffers,
  updateFormData,
  formData,
  uploadProgress,
  loading
}: PricingStepProps) {
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [isSuggestingPrice, setIsSuggestingPrice] = useState(false)
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null)
  const [aiError, setAiError] = useState<string>('')

  const handleInputChange = (field: string, value: string | boolean) => {
    updateFormData({ [field]: value })
  }

  const generateAIDescription = async () => {
    setIsGeneratingDescription(true)
    setAiError('')
    
    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          brand: formData.brand,
          color: formData.color,
          condition: formData.condition,
          ownerHistory: formData.ownerHistory,
          size: formData.size,
          wearCount,
          isCleaned,
          features: formData.features,
          modelName: formData.modelName,
          silhouette: formData.silhouette,
          neckline: formData.neckline
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        const useDescription = window.confirm('このAI生成説明文を使用しますか？\n\n' + data.description.substring(0, 200) + '...')
        if (useDescription) {
          handleInputChange('description', data.description)
        }
      } else {
        setAiError('説明文の生成に失敗しました')
      }
    } catch (error) {
      setAiError('エラーが発生しました')
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  const suggestPrice = async () => {
    setIsSuggestingPrice(true)
    setAiError('')
    setPriceRange(null)
    
    try {
      const response = await fetch('/api/ai/suggest-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: formData.brand,
          condition: formData.condition,
          ownerHistory: formData.ownerHistory,
          originalPrice
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setPriceRange(data.priceRange)
        const usePrice = window.confirm(`AIが提案する適正価格：¥${data.suggestedPrice.toLocaleString()}\n\nこの価格を使用しますか？`)
        if (usePrice) {
          handleInputChange('price', data.suggestedPrice.toString())
        }
      } else {
        setAiError('価格提案に失敗しました')
      }
    } catch (error) {
      setAiError('エラーが発生しました')
    } finally {
      setIsSuggestingPrice(false)
    }
  }

  const calculateDiscount = () => {
    if (price && originalPrice && parseInt(originalPrice) > 0) {
      const discount = Math.round((1 - parseInt(price) / parseInt(originalPrice)) * 100)
      return discount > 0 ? discount : 0
    }
    return 0
  }

  const estimatedRevenue = () => {
    if (price) {
      const priceNum = parseInt(price)
      const fee = Math.floor(priceNum * 0.1) // 10%手数料想定
      return priceNum - fee
    }
    return 0
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Banknote className="mx-auto h-12 w-12 text-pink-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          価格設定と出品確認
        </h3>
        <p className="text-gray-600">
          適切な価格を設定して、出品内容を最終確認してください
        </p>
      </div>

      {/* 商品説明 */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-6">
        <div className="flex items-center">
          <h4 className="text-lg font-semibold text-gray-900">商品説明</h4>
          <span className="ml-2 text-sm text-gray-500">(任意)</span>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              詳細説明 <span className="text-gray-500">(任意)</span>
            </label>
            <button
              type="button"
              onClick={generateAIDescription}
              disabled={isGeneratingDescription || !formData.brand || !formData.condition}
              className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isGeneratingDescription ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1" />
                  AIで説明文を生成
                </>
              )}
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={6}
            placeholder="購入時期、着用回数、保管状態、付属品などを詳しく記載してください。

例：
・2023年6月に購入
・挙式と披露宴で1回のみ着用
・クリーニング済み
・付属品：ベール、グローブ付き"
            className="form-input"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>詳しい説明は購入者の安心につながります</span>
            <span>{description.length}/1000</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              着用回数 <span className="text-gray-500">(任意)</span>
            </label>
            <select
              value={wearCount}
              onChange={(e) => handleInputChange('wearCount', e.target.value)}
              className="form-input"
            >
              <option value="" className="text-gray-500">選択してください</option>
              <option value="0回">0回（未着用）</option>
              <option value="1回">1回</option>
              <option value="2回">2回</option>
              <option value="3回">3回</option>
              <option value="4回以上">4回以上</option>
            </select>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isCleaned"
                checked={isCleaned}
                onChange={(e) => handleInputChange('isCleaned', e.target.checked)}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="isCleaned" className="ml-2 text-sm text-gray-700">
                クリーニング済み
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="acceptOffers"
                checked={acceptOffers}
                onChange={(e) => handleInputChange('acceptOffers', e.target.checked)}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="acceptOffers" className="ml-2 text-sm text-gray-700">
                価格交渉可
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 価格設定 */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">価格設定</h4>
          <button
            type="button"
            onClick={suggestPrice}
            disabled={isSuggestingPrice || !formData.brand || !formData.condition || !formData.ownerHistory}
            className="flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSuggestingPrice ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                分析中...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 mr-1" />
                適正価格を提案
              </>
            )}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              販売価格（円） <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-xl font-normal pointer-events-none">
                ¥
              </span>
              <input
                type="number"
                value={price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="150000"
                className="form-input text-lg pl-8 pr-4"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              定価（円） <span className="text-gray-500">(任意)</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-xl font-normal pointer-events-none">
                ¥
              </span>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                placeholder="300000"
                className="form-input text-lg pl-8 pr-4"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>
        </div>

        {/* AI エラーメッセージ */}
        {aiError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{aiError}</p>
          </div>
        )}

        {/* AI価格提案範囲 */}
        {priceRange && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="text-sm font-medium text-blue-900 mb-2">💡 AI価格提案</h5>
            <div className="text-sm text-blue-800">
              <p>相場価格帯: ¥{priceRange.min.toLocaleString()} 〜 ¥{priceRange.max.toLocaleString()}</p>
              <p className="text-xs text-blue-600 mt-1">ブランド、状態、オーナー履歴を考慮した適正価格です</p>
            </div>
          </div>
        )}

        {/* 価格情報表示 */}
        {price && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">販売価格</span>
              <span className="text-lg font-bold text-pink-600">¥{parseInt(price).toLocaleString()}</span>
            </div>
            
            {originalPrice && (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">定価</span>
                  <span className="text-sm text-gray-500 line-through">¥{parseInt(originalPrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">割引率</span>
                  <span className="text-sm font-medium text-green-600">{calculateDiscount()}% OFF</span>
                </div>
              </>
            )}
            
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">手数料差引後（目安）</span>
                <span className="text-base font-medium text-gray-900">¥{estimatedRevenue().toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 出品内容確認 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">出品内容の確認</h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 画像プレビュー */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">商品画像</h5>
            <div className="grid grid-cols-3 gap-2">
              {formData.previews.slice(0, 6).map((preview: string, index: number) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  <Image
                    src={preview}
                    alt={`画像 ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {index === 0 && (
                    <div className="absolute top-1 left-1 bg-pink-600 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                      メイン
                    </div>
                  )}
                </div>
              ))}
              {formData.previews.length > 6 && (
                <div className="aspect-square rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                  +{formData.previews.length - 6}枚
                </div>
              )}
            </div>
          </div>

          {/* 商品情報 */}
          <div className="space-y-3">
            <div>
              <span className="text-xs text-gray-500">商品名</span>
              <p className="text-sm font-medium text-gray-900">{formData.title || '未入力'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-gray-500">ブランド</span>
                <p className="text-sm text-gray-900">{formData.brand || '未入力'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">サイズ</span>
                <p className="text-sm text-gray-900">{formData.size || '未入力'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-gray-500">カテゴリー</span>
                <p className="text-sm text-gray-900">{formData.category || '未入力'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">状態</span>
                <p className="text-sm text-gray-900">{formData.condition || '未入力'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 出品オプション */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">出品オプション</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center mb-2">
              <Eye className="w-5 h-5 text-green-600 mr-2" />
              <h5 className="font-medium text-gray-900">すぐに公開</h5>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              出品完了後、すぐに検索結果に表示されます
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• 購入者からすぐに見つけてもらえます</li>
              <li>• 問い合わせや購入の可能性が高まります</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center mb-2">
              <Save className="w-5 h-5 text-blue-600 mr-2" />
              <h5 className="font-medium text-gray-900">下書き保存</h5>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              内容を保存して後で公開できます
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• いつでも内容を編集できます</li>
              <li>• 準備ができたタイミングで公開</li>
            </ul>
          </div>
        </div>
      </div>

      {/* アップロード進捗 */}
      {loading && uploadProgress > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center mb-2">
            <Upload className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-700">画像をアップロード中...</span>
            <span className="ml-auto text-sm font-medium text-blue-700">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}