// 管理者用ドレス一括登録のデータ型定義

export interface QuickDressInput {
  id: string; // 一意のID（フォーム管理用）
  title: string;
  imageUrls: string[]; // URL直接入力
  brand: string;
  price: number;
  originalPrice?: number;
  size: string;
  condition: string;
  color: string;
  category: string;
  quickDescription?: string; // 簡易説明
}

// よく使うブランドリスト
export const POPULAR_BRANDS = [
  'VERA WANG',
  'Pronovias',
  'ANTONIO RIVA',
  'Temperley London',
  'JENNY PACKHAM',
  'Marchesa',
  'Oscar de la Renta',
  'Monique Lhuillier',
  'Carolina Herrera',
  'Elie Saab',
  'Reem Acra',
  'Hayley Paige',
  'その他'
];

// サイズオプション
export const SIZE_OPTIONS = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '5号',
  '7号',
  '9号',
  '11号',
  '13号',
  '15号',
  '17号',
  '19号',
  'フリーサイズ'
];

// コンディションオプション
export const CONDITION_OPTIONS = [
  '新品、未使用',
  '未使用に近い',
  '目立った傷や汚れなし',
  'やや傷や汚れあり',
  '傷や汚れあり',
  '全体的に状態が悪い'
];

// カラーオプション
export const COLOR_OPTIONS = [
  'ホワイト',
  'アイボリー',
  'オフホワイト',
  'シャンパン',
  'クリーム',
  'ピンク',
  'ブルー',
  'シルバー',
  'ゴールド',
  'その他'
];

// カテゴリオプション
export const CATEGORY_OPTIONS = [
  'Aライン',
  'プリンセスライン',
  'マーメイドライン',
  'スレンダーライン',
  'エンパイアライン',
  'ボールガウン',
  'ティアードドレス',
  'ミニドレス',
  'その他'
];

// デフォルトドレス情報
export const createDefaultDress = (id: string): QuickDressInput => ({
  id,
  title: '',
  imageUrls: [],
  brand: 'VERA WANG',
  price: 100000,
  originalPrice: 300000,
  size: '9号',
  condition: '未使用に近い',
  color: 'アイボリー',
  category: 'Aライン',
  quickDescription: '結婚式で1度着用。クリーニング済み。大切に保管していました。'
});

// 価格フォーマット関数
export const formatPrice = (price: number): string => {
  return price.toLocaleString('ja-JP');
};

// 価格パース関数
export const parsePrice = (priceString: string): number => {
  return parseInt(priceString.replace(/[^\d]/g, '')) || 0;
};

// 画像URL検証関数
export const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const validDomains = [
      'images.unsplash.com',
      'static.mercdn.net', // メルカリ
      'auctions.c.yimg.jp', // Yahoo!オークション
      'img.fril.jp', // フリル
      'cdn.shopify.com',
      'imgur.com',
      'i.imgur.com'
    ];
    
    const isValidDomain = validDomains.some(domain => 
      urlObj.hostname.includes(domain)
    );
    
    const isValidExtension = /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url);
    
    return isValidDomain || isValidExtension;
  } catch {
    return false;
  }
};

// バルクインポート用の進捗状態
export interface ImportProgress {
  total: number;
  completed: number;
  current: string;
  errors: Array<{ index: number; message: string }>;
}