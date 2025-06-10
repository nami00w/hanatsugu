'use client'

import { Tag, FileText } from 'lucide-react'

interface BrandDetailsStepProps {
  title: string
  brand: string
  category: string
  color: string
  condition: string
  description: string
  updateFormData: (updates: any) => void
}

export default function BrandDetailsStep({
  title,
  brand,
  category,
  color,
  condition,
  description,
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

      {/* 基本情報 */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-6">
        <h4 className="text-lg font-semibold text-gray-900">基本情報</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            商品タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="例：VERA WANG バレリーナ ウェディングドレス"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1">
            ブランド名とモデル名を含めると良いです
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ブランド名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            placeholder="例：VERA WANG、Pronovias、Monique Lhuillier"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリー <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
            >
              <option value="">選択してください</option>
              <option value="Aライン">Aライン</option>
              <option value="プリンセスライン">プリンセスライン</option>
              <option value="マーメイドライン">マーメイドライン</option>
              <option value="スレンダーライン">スレンダーライン</option>
              <option value="エンパイアライン">エンパイアライン</option>
              <option value="ミニ・ショート">ミニ・ショート</option>
              <option value="その他">その他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カラー <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              placeholder="例：オフホワイト、アイボリー、シャンパン"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            商品の状態 <span className="text-red-500">*</span>
          </label>
          <select
            value={condition}
            onChange={(e) => handleInputChange('condition', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
          >
            <option value="">選択してください</option>
            <option value="新品・未使用">新品・未使用</option>
            <option value="未使用に近い">未使用に近い</option>
            <option value="目立った傷や汚れなし">目立った傷や汚れなし</option>
            <option value="やや傷や汚れあり">やや傷や汚れあり</option>
            <option value="傷や汚れあり">傷や汚れあり</option>
          </select>
        </div>
      </div>

      {/* 商品説明 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center mb-4">
          <FileText className="w-5 h-5 text-gray-700 mr-2" />
          <h4 className="text-lg font-semibold text-gray-900">商品説明</h4>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            詳細説明 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={8}
            placeholder="購入時期、着用回数、保管状態、付属品などを詳しく記載してください。

例：
・2023年6月に購入
・挙式と披露宴で1回のみ着用
・クリーニング済み
・付属品：ベール、グローブ付き
・保管は専用のドレスカバーで大切に保管
・目立った汚れや傷はありません"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>詳しい説明は購入者の安心につながります</span>
            <span>{description.length}/2000</span>
          </div>
        </div>
      </div>

      {/* 記載のコツ */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-blue-900 mb-3">💡 記載するとよい情報</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 購入時期と購入店舗</li>
            <li>• 着用回数と着用時間</li>
            <li>• クリーニングの有無</li>
            <li>• 保管状態（専用ケースなど）</li>
          </ul>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 付属品（ベール、グローブなど）</li>
            <li>• サイズ感（実寸や着用感）</li>
            <li>• 特徴的なデザインポイント</li>
            <li>• 購入理由や着用シーン</li>
          </ul>
        </div>
      </div>
    </div>
  )
}