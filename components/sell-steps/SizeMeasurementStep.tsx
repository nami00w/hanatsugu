'use client'

import { Ruler, Info } from 'lucide-react'

interface SizeMeasurementStepProps {
  size: string
  bust: string
  waist: string
  hip: string
  height: string
  shoulderWidth: string
  sleeveLength: string
  totalLength: string
  updateFormData: (updates: any) => void
}

export default function SizeMeasurementStep({ 
  size, 
  bust,
  waist,
  hip,
  height,
  shoulderWidth,
  sleeveLength,
  totalLength,
  updateFormData 
}: SizeMeasurementStepProps) {

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFormData({ size: e.target.value })
  }

  const handleMeasurementChange = (field: string, value: string) => {
    updateFormData({ [field]: value })
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Ruler className="mx-auto h-12 w-12 text-pink-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          サイズ・採寸情報
        </h3>
        <p className="text-gray-600">
          正確なサイズ情報は購入者の安心に繋がります
        </p>
      </div>

      {/* 基本サイズ */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">基本サイズ</h4>
        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
            ドレスサイズ <span className="text-red-500">*</span>
          </label>
          <select
            id="size"
            value={size}
            onChange={handleSizeChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900"
          >
            <option value="" className="text-gray-500">サイズを選択してください</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>
        </div>
      </div>

      {/* 必須採寸 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">必須採寸</h4>
        <p className="text-sm text-gray-600 mb-6">
          バスト・ウエスト・ヒップのうち、最低2つの採寸が必要です
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              バスト（cm） <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={bust}
              onChange={(e) => handleMeasurementChange('bust', e.target.value)}
              placeholder="例: 83"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ウエスト（cm） <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={waist}
              onChange={(e) => handleMeasurementChange('waist', e.target.value)}
              placeholder="例: 63"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ヒップ（cm） <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={hip}
              onChange={(e) => handleMeasurementChange('hip', e.target.value)}
              placeholder="例: 88"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* 任意採寸 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-900">詳細採寸</h4>
          <span className="ml-2 text-sm text-gray-500">(任意)</span>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          より詳しい採寸情報があると購入者により役立ちます
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              身長（cm） <span className="text-gray-500">(任意)</span>
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => handleMeasurementChange('height', e.target.value)}
              placeholder="例: 160"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              肩幅（cm） <span className="text-gray-500">(任意)</span>
            </label>
            <input
              type="number"
              value={shoulderWidth}
              onChange={(e) => handleMeasurementChange('shoulderWidth', e.target.value)}
              placeholder="例: 36"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              袖丈（cm） <span className="text-gray-500">(任意)</span>
            </label>
            <input
              type="number"
              value={sleeveLength}
              onChange={(e) => handleMeasurementChange('sleeveLength', e.target.value)}
              placeholder="例: 58"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              総丈（cm） <span className="text-gray-500">(任意)</span>
            </label>
            <input
              type="number"
              value={totalLength}
              onChange={(e) => handleMeasurementChange('totalLength', e.target.value)}
              placeholder="例: 155"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              肩から裾までの長さ
            </p>
          </div>
        </div>
      </div>

      {/* サイズ表 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-blue-900 mb-3">📐 サイズ目安表</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-blue-700">
            <thead>
              <tr className="border-b border-blue-200">
                <th className="text-left py-2">サイズ</th>
                <th className="text-left py-2">バスト</th>
                <th className="text-left py-2">ウエスト</th>
                <th className="text-left py-2">ヒップ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-200">
              <tr><td className="py-1">5号 (XS)</td><td>79cm</td><td>58cm</td><td>82cm</td></tr>
              <tr><td className="py-1">7号 (S)</td><td>82cm</td><td>61cm</td><td>85cm</td></tr>
              <tr><td className="py-1">9号 (M)</td><td>85cm</td><td>64cm</td><td>88cm</td></tr>
              <tr><td className="py-1">11号 (L)</td><td>88cm</td><td>67cm</td><td>91cm</td></tr>
              <tr><td className="py-1">13号 (XL)</td><td>91cm</td><td>70cm</td><td>94cm</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          ※メーカーによってサイズ感は異なります
        </p>
      </div>
    </div>
  )
}