-- Listings テーブルの拡張
-- 新しいカラムを追加してウェディングドレス出品機能を完全対応

-- オーナー履歴情報
ALTER TABLE listings ADD COLUMN IF NOT EXISTS owner_history VARCHAR(50);

-- 採寸情報（JSON形式）
ALTER TABLE listings ADD COLUMN IF NOT EXISTS measurements JSONB;

-- 特徴・装飾（配列形式）
ALTER TABLE listings ADD COLUMN IF NOT EXISTS features TEXT[];

-- シルエット
ALTER TABLE listings ADD COLUMN IF NOT EXISTS silhouette VARCHAR(100);

-- ネックライン
ALTER TABLE listings ADD COLUMN IF NOT EXISTS neckline VARCHAR(100);

-- 袖スタイル
ALTER TABLE listings ADD COLUMN IF NOT EXISTS sleeve_style VARCHAR(100);

-- スカート丈
ALTER TABLE listings ADD COLUMN IF NOT EXISTS skirt_length VARCHAR(100);

-- モデル名・品番
ALTER TABLE listings ADD COLUMN IF NOT EXISTS model_name VARCHAR(200);

-- 製造年
ALTER TABLE listings ADD COLUMN IF NOT EXISTS manufacture_year INTEGER;

-- 着用回数
ALTER TABLE listings ADD COLUMN IF NOT EXISTS wear_count VARCHAR(50);

-- クリーニング済みフラグ
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_cleaned BOOLEAN DEFAULT FALSE;

-- 価格交渉可フラグ
ALTER TABLE listings ADD COLUMN IF NOT EXISTS accept_offers BOOLEAN DEFAULT FALSE;

-- 出品ステータス（published, draft, sold, inactive）
ALTER TABLE listings ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published';

-- 作成・更新日時の追加（まだない場合）
ALTER TABLE listings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE listings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- インデックスの追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_brand ON listings(brand);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at);
CREATE INDEX IF NOT EXISTS idx_listings_owner_history ON listings(owner_history);

-- コメント追加
COMMENT ON COLUMN listings.owner_history IS 'オーナー履歴: first, second, third_plus';
COMMENT ON COLUMN listings.measurements IS 'カスタム採寸情報: {"bust": "85", "waist": "60", "hip": "88", "length": "155"}';
COMMENT ON COLUMN listings.features IS '特徴・装飾の配列: ["ビーズ", "レース", "刺繍"]';
COMMENT ON COLUMN listings.status IS '出品ステータス: published, draft, sold, inactive';