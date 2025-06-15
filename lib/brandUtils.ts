/**
 * ブランド正規化ユーティリティ
 * ブランド名の統一と検索精度の向上のための関数群
 */

import { createOrGetBrand, normalizeBrandForSearch, type Brand } from './brandAPI'

/**
 * ブランド名の正規化辞書
 * よくある表記ゆれを統一するためのマッピング
 */
export const brandNormalizationMap: Record<string, string> = {
  // Vera Wang系
  'vera wang': 'Vera Wang',
  'verawang': 'Vera Wang',
  'ヴェラワン': 'Vera Wang',
  'ベラワン': 'Vera Wang',
  'ヴェラ・ウォン': 'Vera Wang',
  'ヴェラウォン': 'Vera Wang',
  
  // Pronovias系
  'pronovias': 'Pronovias',
  'プロノビアス': 'Pronovias',
  
  // Antonio Riva系
  'antonio riva': 'Antonio Riva',
  'antonioriva': 'Antonio Riva',
  'アントニオリーヴァ': 'Antonio Riva',
  'アントニオリバ': 'Antonio Riva',
  'アントニオ・リーヴァ': 'Antonio Riva',
  
  // Jenny Packham系
  'jenny packham': 'Jenny Packham',
  'jennypackham': 'Jenny Packham',
  'ジェニーパッカム': 'Jenny Packham',
  'ジェニー・パッカム': 'Jenny Packham',
  'ジェニーパッカハム': 'Jenny Packham',
  
  // Temperley London系
  'temperley london': 'Temperley London',
  'temperleylondon': 'Temperley London',
  'テンパリーロンドン': 'Temperley London',
  'テンパリー・ロンドン': 'Temperley London',
  'テンパリー': 'Temperley London',
  
  // Yumi Katsura系
  'yumi katsura': 'Yumi Katsura',
  'yumikatsura': 'Yumi Katsura',
  'ユミカツラ': 'Yumi Katsura',
  '桂由美': 'Yumi Katsura',
  'かつらゆみ': 'Yumi Katsura',
  'カツラユミ': 'Yumi Katsura',
  
  // Takami Bridal系
  'takami bridal': 'Takami Bridal',
  'takamibridal': 'Takami Bridal',
  'タカミブライダル': 'Takami Bridal',
  '高見ブライダル': 'Takami Bridal',
  'takami': 'Takami Bridal',
  
  // Jill Stuart系
  'jill stuart': 'Jill Stuart',
  'jillstuart': 'Jill Stuart',
  'ジルスチュアート': 'Jill Stuart',
  'ジル・スチュアート': 'Jill Stuart',
  
  // その他の一般的な表記ゆれ
  'oscar de la renta': 'Oscar de la Renta',
  'oscardelarenta': 'Oscar de la Renta',
  'オスカーデラレンタ': 'Oscar de la Renta',
  'オスカー・デ・ラ・レンタ': 'Oscar de la Renta',
  
  'monique lhuillier': 'Monique Lhuillier',
  'moniquelhuillier': 'Monique Lhuillier',
  'モニークルイリエ': 'Monique Lhuillier',
  'モニーク・ルイリエ': 'Monique Lhuillier',
  
  'carolina herrera': 'Carolina Herrera',
  'carolinaherrera': 'Carolina Herrera',
  'カロリーナヘレラ': 'Carolina Herrera',
  'カロリーナ・ヘレラ': 'Carolina Herrera',
  
  'elie saab': 'Elie Saab',
  'eliesaab': 'Elie Saab',
  'エリーサーブ': 'Elie Saab',
  'エリー・サーブ': 'Elie Saab',
  
  'marchesa': 'Marchesa',
  'マルケーザ': 'Marchesa',
  
  'reem acra': 'Reem Acra',
  'reemacra': 'Reem Acra',
  'リームアクラ': 'Reem Acra',
  'リーム・アクラ': 'Reem Acra',
  
  'hayley paige': 'Hayley Paige',
  'hayleypaige': 'Hayley Paige',
  'ヘイリーペイジ': 'Hayley Paige',
  'ヘイリー・ペイジ': 'Hayley Paige',
  
  'tadashi shoji': 'Tadashi Shoji',
  'tadashishoji': 'Tadashi Shoji',
  'タダシショージ': 'Tadashi Shoji',
  'タダシ・ショージ': 'Tadashi Shoji',
  'タダシショウジ': 'Tadashi Shoji'
}

/**
 * ブランド名を正規化する
 */
export const normalizeBrandName = (brandName: string): string => {
  if (!brandName || typeof brandName !== 'string') {
    return ''
  }

  // 1. 前後の空白を除去し、小文字に変換
  const cleaned = brandName.trim().toLowerCase()
  
  // 2. 正規化辞書から完全一致を探す
  if (brandNormalizationMap[cleaned]) {
    return brandNormalizationMap[cleaned]
  }
  
  // 3. 部分一致で検索（より寛容な正規化）
  for (const [key, value] of Object.entries(brandNormalizationMap)) {
    if (cleaned.includes(key) || key.includes(cleaned)) {
      return value
    }
  }
  
  // 4. 一般的な正規化処理
  return brandName
    .trim()
    .replace(/[　\s]+/g, ' ') // 全角・半角スペースを統一
    .replace(/・/g, ' ') // 中点をスペースに変換
    .replace(/\s+/g, ' ') // 連続するスペースを1つに
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // タイトルケース
    .join(' ')
}

/**
 * ブランド名の類似度を計算する（レーベンシュタイン距離ベース）
 */
export const calculateBrandSimilarity = (a: string, b: string): number => {
  if (!a || !b) return 0
  if (a === b) return 1

  const matrix = []
  const aLen = a.length
  const bLen = b.length

  for (let i = 0; i <= bLen; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= aLen; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= bLen; i++) {
    for (let j = 1; j <= aLen; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }

  const maxLen = Math.max(aLen, bLen)
  return maxLen === 0 ? 1 : (maxLen - matrix[bLen][aLen]) / maxLen
}

/**
 * 出品時にブランド名を正規化して保存する
 */
export const processListingBrand = async (brandName: string): Promise<{
  normalizedName: string
  brand?: Brand
}> => {
  try {
    // 1. ブランド名を正規化
    const normalizedName = normalizeBrandName(brandName)
    
    // 2. 既存ブランドを検索または作成
    const brand = await createOrGetBrand(normalizedName)
    
    return {
      normalizedName: brand.japanese_name || brand.canonical_name,
      brand
    }
  } catch (error) {
    console.error('Brand processing error:', error)
    
    // エラーの場合は正規化のみ行う
    return {
      normalizedName: normalizeBrandName(brandName)
    }
  }
}

/**
 * 重複しそうなブランド名をチェックする
 */
export const findSimilarBrands = (
  targetBrand: string, 
  brandList: Brand[], 
  threshold: number = 0.8
): Brand[] => {
  const normalizedTarget = normalizeBrandForSearch(targetBrand)
  
  return brandList.filter(brand => {
    const similarity1 = calculateBrandSimilarity(
      normalizedTarget, 
      normalizeBrandForSearch(brand.canonical_name)
    )
    
    const similarity2 = brand.japanese_name 
      ? calculateBrandSimilarity(
          normalizedTarget, 
          normalizeBrandForSearch(brand.japanese_name)
        )
      : 0
    
    return Math.max(similarity1, similarity2) >= threshold
  })
}

/**
 * ブランド名のバリデーション
 */
export const validateBrandName = (brandName: string): {
  isValid: boolean
  errors: string[]
  suggestions?: string[]
} => {
  const errors: string[] = []
  const suggestions: string[] = []
  
  if (!brandName || !brandName.trim()) {
    errors.push('ブランド名を入力してください')
    return { isValid: false, errors }
  }
  
  const trimmed = brandName.trim()
  
  // 長さチェック
  if (trimmed.length < 2) {
    errors.push('ブランド名は2文字以上で入力してください')
  }
  
  if (trimmed.length > 100) {
    errors.push('ブランド名は100文字以下で入力してください')
  }
  
  // 不正な文字チェック
  const invalidChars = /[<>{}[\]\\\/\|\`~!@#$%^&*()+=]/
  if (invalidChars.test(trimmed)) {
    errors.push('ブランド名に使用できない文字が含まれています')
  }
  
  // 正規化の提案
  const normalized = normalizeBrandName(trimmed)
  if (normalized !== trimmed && normalized !== '') {
    suggestions.push(normalized)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    suggestions: suggestions.length > 0 ? suggestions : undefined
  }
}