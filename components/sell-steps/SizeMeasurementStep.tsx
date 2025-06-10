'use client'

import { Ruler, Info } from 'lucide-react'

interface SizeMeasurementStepProps {
  size: string
  customMeasurements: {
    bust: string
    waist: string
    hip: string
    length: string
  }
  updateFormData: (updates: any) => void
}

export default function SizeMeasurementStep({ 
  size, 
  customMeasurements, 
  updateFormData 
}: SizeMeasurementStepProps) {

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFormData({ size: e.target.value })
  }

  const handleMeasurementChange = (field: string, value: string) => {
    updateFormData({
      customMeasurements: {
        ...customMeasurements,
        [field]: value
      }
    })
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
          >
            <option value="">サイズを選択してください</option>
            <option value="5号">5号 (XS)</option>
            <option value="7号">7号 (S)</option>
            <option value="9号">9号 (M)</option>
            <option value="11号">11号 (L)</option>
            <option value="13号">13号 (XL)</option>
            <option value="15号">15号 (XXL)</option>
            <option value="17号">17号 (3XL)</option>
            <option value="フリーサイズ">フリーサイズ</option>
          </select>
        </div>
      </div>

      {/* 詳細採寸 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-900">詳細採寸</h4>
          <div className="ml-2 group relative">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 text-center">
              採寸情報があると購入者により詳しい情報を提供できます
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          実際に測った数値を入力してください（任意）
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              バスト（cm）
            </label>
            <input
              type="number"
              value={customMeasurements.bust}
              onChange={(e) => handleMeasurementChange('bust', e.target.value)}
              placeholder="例: 83"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ウエスト（cm）
            </label>
            <input
              type="number"
              value={customMeasurements.waist}
              onChange={(e) => handleMeasurementChange('waist', e.target.value)}
              placeholder="例: 63"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ヒップ（cm）
            </label>
            <input
              type="number"
              value={customMeasurements.hip}
              onChange={(e) => handleMeasurementChange('hip', e.target.value)}
              placeholder="例: 88"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              着丈（cm）
            </label>
            <input
              type="number"
              value={customMeasurements.length}
              onChange={(e) => handleMeasurementChange('length', e.target.value)}
              placeholder="例: 155"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
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