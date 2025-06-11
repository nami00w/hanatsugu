import { NextRequest, NextResponse } from 'next/server'

// ブランド別の基準価格（円）
const brandPrices: { [key: string]: { min: number; max: number } } = {
  'VERA WANG': { min: 250000, max: 500000 },
  'Pronovias': { min: 200000, max: 400000 },
  'JILLSTUART': { min: 150000, max: 350000 },
  'TAKAMI BRIDAL': { min: 180000, max: 380000 },
  'Yumi Katsura': { min: 300000, max: 600000 },
  'THE TREAT DRESSING': { min: 200000, max: 450000 },
  'ANTONIO RIVA': { min: 280000, max: 550000 },
  'MARCHESA': { min: 350000, max: 700000 },
  'Carolina Herrera': { min: 400000, max: 800000 },
  'その他': { min: 100000, max: 300000 }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { brand, condition, ownerHistory, originalPrice } = body

    // 1秒の遅延をシミュレート
    await new Promise(resolve => setTimeout(resolve, 1000))

    // ブランドの基準価格を取得（大文字小文字を無視して検索）
    const brandKey = Object.keys(brandPrices).find(key => 
      key.toLowerCase() === brand.toLowerCase()
    ) || 'その他'
    
    const basePrice = brandPrices[brandKey]
    let minPrice = basePrice.min
    let maxPrice = basePrice.max

    // 定価が入力されている場合は、それを基準にする
    if (originalPrice && parseInt(originalPrice) > 0) {
      const original = parseInt(originalPrice)
      minPrice = Math.floor(original * 0.3) // 定価の30%
      maxPrice = Math.floor(original * 0.6) // 定価の60%
    }

    // 状態による価格調整
    const conditionMultiplierMap: Record<string, number> = {
      '新品・未使用': 1.0,
      '未使用に近い': 0.9,
      '目立った傷や汚れなし': 0.8,
      'やや傷や汚れあり': 0.7
    }
    const conditionMultiplier = conditionMultiplierMap[condition] || 0.8

    // オーナー履歴による価格調整
    const ownerMultiplierMap: Record<string, number> = {
      'first': 0.95,    // ファーストオーナー: 90-100%
      'second': 0.85,   // セカンドオーナー: 80-90%
      'third_plus': 0.75 // サードオーナー以上: 70-80%
    }
    const ownerMultiplier = ownerMultiplierMap[ownerHistory] || 0.85

    // 最終的な価格範囲を計算
    const adjustedMin = Math.floor(minPrice * conditionMultiplier * ownerMultiplier)
    const adjustedMax = Math.floor(maxPrice * conditionMultiplier * ownerMultiplier)
    
    // 推奨価格（範囲の中央値）
    const suggestedPrice = Math.floor((adjustedMin + adjustedMax) / 2)

    // 価格を1万円単位に丸める
    const roundToManYen = (price: number) => Math.round(price / 10000) * 10000

    const response = {
      success: true,
      suggestedPrice: roundToManYen(suggestedPrice),
      priceRange: {
        min: roundToManYen(adjustedMin),
        max: roundToManYen(adjustedMax)
      },
      factors: {
        brand: brandKey,
        condition: `状態による調整: ${Math.round(conditionMultiplier * 100)}%`,
        ownerHistory: `オーナー履歴による調整: ${Math.round(ownerMultiplier * 100)}%`
      },
      message: `${brandKey}の${condition}のドレスの相場価格帯です。オーナー履歴も考慮した適正価格を提案しています。`
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error suggesting price:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to suggest price' },
      { status: 500 }
    )
  }
}