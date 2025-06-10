'use client'

import { Tag, FileText } from 'lucide-react'

interface BrandDetailsStepProps {
  title: string
  brand: string
  color: string
  condition: string
  modelName: string
  manufactureYear: string
  silhouette: string
  neckline: string
  sleeveStyle: string
  skirtLength: string
  features: string
  updateFormData: (updates: any) => void
}

export default function BrandDetailsStep({
  title,
  brand,
  color,
  condition,
  modelName,
  manufactureYear,
  silhouette,
  neckline,
  sleeveStyle,
  skirtLength,
  features,
  updateFormData
}: BrandDetailsStepProps) {

  const handleInputChange = (field: string, value: string) => {
    updateFormData({ [field]: value })
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Tag className="mx-auto h-12 w-12 text-pink-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          ブランド・商品詳細
        </h3>
        <p className="text-gray-600">
          購入者が知りたい詳細情報を入力してください
        </p>
      </div>

      {/* 必須情報 */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-6">
        <h4 className="text-lg font-semibold text-gray-900">必須情報</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            商品タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="例：VERA WANG バレリーナ ウェディングドレス"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900"
          />
          <p className="text-xs text-gray-500 mt-1">
            ブランド名とモデル名を含めると良いです
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ブランド名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              placeholder="例：VERA WANG、Pronovias"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カラー <span className="text-red-500">*</span>
            </label>
            <select
              value={color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900"
            >
              <option value="" className="text-gray-500">選択してください</option>
              <option value="白">白</option>
              <option value="オフホワイト">オフホワイト</option>
              <option value="アイボリー">アイボリー</option>
              <option value="シャンパン">シャンパン</option>
              <option value="ピンク">ピンク</option>
              <option value="その他">その他</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            商品の状態 <span className="text-red-500">*</span>
          </label>
          <select
            value={condition}
            onChange={(e) => handleInputChange('condition', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900"
          >
            <option value="" className="text-gray-500">選択してください</option>
            <option value="新品・未使用">新品・未使用</option>
            <option value="未使用に近い">未使用に近い</option>
            <option value="目立った傷や汚れなし">目立った傷や汚れなし</option>
            <option value="やや傷や汚れあり">やや傷や汚れあり</option>
          </select>
        </div>
      </div>

      {/* 任意詳細情報 */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-6">
        <div className="flex items-center">
          <h4 className="text-lg font-semibold text-gray-900">詳細情報</h4>
          <span className="ml-2 text-sm text-gray-500">(任意)</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              モデル名・品番 <span className="text-gray-500">(任意)</span>
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => handleInputChange('modelName', e.target.value)}
              placeholder="例：バレリーナ、スタイル12345"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              製造年 <span className="text-gray-500">(任意)</span>
            </label>
            <input
              type="number"
              value={manufactureYear}
              onChange={(e) => handleInputChange('manufactureYear', e.target.value)}
              placeholder="例：2023"
              min="2000"
              max="2024"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              シルエット <span className="text-gray-500">(任意)</span>
            </label>
            <select
              value={silhouette}
              onChange={(e) => handleInputChange('silhouette', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900"
            >
              <option value="" className="text-gray-500">選択してください</option>
              <option value="Aライン">Aライン</option>
              <option value="ボールガウン">ボールガウン</option>
              <option value="マーメイド">マーメイド</option>
              <option value="スレンダー">スレンダー</option>
              <option value="エンパイア">エンパイア</option>
              <option value="その他">その他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ネックライン <span className="text-gray-500">(任意)</span>
            </label>
            <select
              value={neckline}
              onChange={(e) => handleInputChange('neckline', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900"
            >
              <option value="" className="text-gray-500">選択してください</option>
              <option value="ストラップレス">ストラップレス</option>
              <option value="ハイネック">ハイネック</option>
              <option value="Vネック">Vネック</option>
              <option value="ハートシェイプ">ハートシェイプ</option>
              <option value="オフショルダー">オフショルダー</option>
              <option value="その他">その他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              袖スタイル <span className="text-gray-500">(任意)</span>
            </label>
            <select
              value={sleeveStyle}
              onChange={(e) => handleInputChange('sleeveStyle', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900"
            >
              <option value="" className="text-gray-500">選択してください</option>
              <option value="ノースリーブ">ノースリーブ</option>
              <option value="半袖">半袖</option>
              <option value="長袖">長袖</option>
              <option value="七分袖">七分袖</option>
              <option value="キャップスリーブ">キャップスリーブ</option>
              <option value="その他">その他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              スカート丈 <span className="text-gray-500">(任意)</span>
            </label>
            <select
              value={skirtLength}
              onChange={(e) => handleInputChange('skirtLength', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900"
            >
              <option value="" className="text-gray-500">選択してください</option>
              <option value="フロアレングス">フロアレングス</option>
              <option value="チャペルレングス">チャペルレングス</option>
              <option value="カテドラルレングス">カテドラルレングス</option>
              <option value="ひざ丈">ひざ丈</option>
              <option value="ミディ丈">ミディ丈</option>
              <option value="その他">その他</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            特徴・装飾 <span className="text-gray-500">(任意)</span>
          </label>
          <input
            type="text"
            value={features}
            onChange={(e) => handleInputChange('features', e.target.value)}
            placeholder="例：ビーズ、レース、刺繍、パール"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900"
          />
        </div>
      </div>

    </div>
  )
}