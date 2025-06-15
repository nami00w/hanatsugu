-- Hanatsugu ブランドマスターテーブル作成
-- Supabase SQL Editor で実行してください

-- 1. ブランドマスターテーブル
CREATE TABLE brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  canonical_name VARCHAR NOT NULL UNIQUE, -- 正式名称（英語）
  japanese_name VARCHAR, -- 日本語名
  katakana_name VARCHAR, -- カタカナ
  hiragana_name VARCHAR, -- ひらがな
  aliases JSONB DEFAULT '[]', -- 別名の配列
  description TEXT, -- ブランド説明
  country VARCHAR, -- 原産国
  website_url VARCHAR, -- 公式サイトURL
  is_active BOOLEAN DEFAULT true, -- アクティブフラグ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 検索用インデックス
CREATE INDEX idx_brands_canonical ON brands(LOWER(canonical_name));
CREATE INDEX idx_brands_japanese ON brands(japanese_name);
CREATE INDEX idx_brands_katakana ON brands(katakana_name);
CREATE INDEX idx_brands_hiragana ON brands(hiragana_name);
CREATE INDEX idx_brands_aliases ON brands USING GIN(aliases);
CREATE INDEX idx_brands_active ON brands(is_active);

-- 3. 全文検索用のインデックス（複数フィールドの組み合わせ検索）
CREATE INDEX idx_brands_search ON brands USING GIN(
  to_tsvector('simple', 
    coalesce(canonical_name, '') || ' ' || 
    coalesce(japanese_name, '') || ' ' || 
    coalesce(katakana_name, '') || ' ' || 
    coalesce(hiragana_name, '')
  )
);

-- 4. RLS (Row Level Security) ポリシー設定
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能
CREATE POLICY "Brands are viewable by everyone" ON brands
  FOR SELECT USING (is_active = true);

-- 管理者のみが編集可能（将来的に管理者システムを実装する場合）
CREATE POLICY "Brands are editable by admins only" ON brands
  FOR ALL USING (false); -- 現在は誰も編集不可

-- 5. 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_brands_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_brands_updated_at();

-- 6. 初期データ投入（主要なウェディングドレスブランド）
INSERT INTO brands (canonical_name, japanese_name, katakana_name, hiragana_name, aliases, description, country) VALUES
-- 海外ハイエンドブランド
('Vera Wang', 'ヴェラ・ウォン', 'ヴェラウォン', 'ゔぇらうぉん', '["VERA WANG", "ベラワン", "ヴェラワン"]', 'アメリカの高級ウェディングドレスブランド', 'USA'),
('Pronovias', 'プロノビアス', 'プロノビアス', 'ぷろのびあす', '["PRONOVIAS"]', 'スペインの老舗ウェディングドレスブランド', 'Spain'),
('Antonio Riva', 'アントニオ・リーヴァ', 'アントニオリーヴァ', 'あんとにおりーゔぁ', '["ANTONIO RIVA", "アントニオリバ"]', 'イタリアの高級ウェディングドレスブランド', 'Italy'),
('Temperley London', 'テンパリー・ロンドン', 'テンパリーロンドン', 'てんぱりーろんどん', '["TEMPERLEY LONDON", "テンパリー"]', 'イギリスの高級ファッションブランド', 'UK'),
('Jenny Packham', 'ジェニー・パッカム', 'ジェニーパッカム', 'じぇにーぱっかむ', '["JENNY PACKHAM", "ジェニーパッカハム"]', 'イギリスの高級ウェディングドレスブランド', 'UK'),
('Marchesa', 'マルケーザ', 'マルケーザ', 'まるけーざ', '["MARCHESA"]', 'アメリカの高級ファッションブランド', 'USA'),
('Oscar de la Renta', 'オスカー・デ・ラ・レンタ', 'オスカーデラレンタ', 'おすかーでられんた', '["OSCAR DE LA RENTA", "オスカーデラレンタ"]', 'ドミニカ系アメリカの高級ファッションブランド', 'USA'),
('Monique Lhuillier', 'モニーク・ルイリエ', 'モニークルイリエ', 'もにーくるいりえ', '["MONIQUE LHUILLIER", "モニークルイリエ"]', 'フィリピン系アメリカの高級ウェディングドレスブランド', 'USA'),
('Carolina Herrera', 'カロリーナ・ヘレラ', 'カロリーナヘレラ', 'かろりーなへれら', '["CAROLINA HERRERA"]', 'ベネズエラ系アメリカの高級ファッションブランド', 'USA'),
('Elie Saab', 'エリー・サーブ', 'エリーサーブ', 'えりーさーぶ', '["ELIE SAAB"]', 'レバノンの高級ファッションブランド', 'Lebanon'),

-- 日本のブランド
('Yumi Katsura', '桂由美', 'ユミカツラ', 'ゆみかつら', '["YUMI KATSURA", "Katsura Yumi", "カツラユミ", "桂 由美"]', '日本のウェディングドレス界の第一人者', 'Japan'),
('Takami Bridal', 'タカミブライダル', 'タカミブライダル', 'たかみぶらいだる', '["TAKAMI BRIDAL", "高見ブライダル", "TAKAMI"]', '日本の高級ブライダルブランド', 'Japan'),
('Jill Stuart', 'ジルスチュアート', 'ジルスチュアート', 'じるすちゅあーと', '["JILL STUART", "JILLSTUART", "ジル・スチュアート"]', 'アメリカ発、日本でも人気のファッションブランド', 'USA'),

-- ミドルレンジブランド
('Allure Bridals', 'アリュール・ブライダルズ', 'アリュールブライダルズ', 'ありゅーるぶらいだるず', '["ALLURE BRIDALS", "Allure"]', 'アメリカのウェディングドレスブランド', 'USA'),
('Maggie Sottero', 'マギー・ソッテロ', 'マギーソッテロ', 'まぎーそってろ', '["MAGGIE SOTTERO"]', 'アメリカのウェディングドレスブランド', 'USA'),
('David''s Bridal', 'デイビッズ・ブライダル', 'デイビッズブライダル', 'でいびっずぶらいだる', '["DAVID''S BRIDAL", "Davids Bridal"]', 'アメリカの大手ブライダルチェーン', 'USA'),

-- その他の人気ブランド
('Reem Acra', 'リーム・アクラ', 'リームアクラ', 'りーむあくら', '["REEM ACRA"]', 'レバノン系アメリカの高級ファッションブランド', 'USA'),
('Hayley Paige', 'ヘイリー・ペイジ', 'ヘイリーペイジ', 'へいりーぺいじ', '["HAYLEY PAIGE"]', 'アメリカのウェディングドレスブランド', 'USA'),
('Tadashi Shoji', 'タダシ・ショージ', 'タダシショージ', 'ただししょーじ', '["TADASHI SHOJI", "タダシショウジ"]', '日系アメリカの高級ファッションブランド', 'USA'),
('Enzoani', 'エンゾアニ', 'エンゾアニ', 'えんぞあに', '["ENZOANI"]', 'ヨーロッパ系のウェディングドレスブランド', 'Europe'),
('Galia Lahav', 'ガリア・ラハブ', 'ガリアラハブ', 'がりあらはぶ', '["GALIA LAHAV"]', 'イスラエルの高級ウェディングドレスブランド', 'Israel'),
('Milla Nova', 'ミラ・ノヴァ', 'ミラノヴァ', 'みらのゔぁ', '["MILLA NOVA"]', 'ウクライナの高級ウェディングドレスブランド', 'Ukraine');

-- 7. ブランド検索関数の作成
CREATE OR REPLACE FUNCTION search_brands(search_term TEXT, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  canonical_name VARCHAR,
  japanese_name VARCHAR,
  katakana_name VARCHAR,
  hiragana_name VARCHAR,
  aliases JSONB,
  match_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.canonical_name,
    b.japanese_name,
    b.katakana_name,
    b.hiragana_name,
    b.aliases,
    -- マッチスコアの計算（完全一致 > 前方一致 > 部分一致）
    CASE 
      WHEN LOWER(b.canonical_name) = LOWER(search_term) THEN 100.0
      WHEN LOWER(b.japanese_name) = LOWER(search_term) THEN 100.0
      WHEN LOWER(b.katakana_name) = LOWER(search_term) THEN 100.0
      WHEN LOWER(b.hiragana_name) = LOWER(search_term) THEN 100.0
      WHEN LOWER(b.canonical_name) LIKE LOWER(search_term) || '%' THEN 80.0
      WHEN LOWER(b.japanese_name) LIKE LOWER(search_term) || '%' THEN 80.0
      WHEN LOWER(b.katakana_name) LIKE LOWER(search_term) || '%' THEN 80.0
      WHEN LOWER(b.hiragana_name) LIKE LOWER(search_term) || '%' THEN 80.0
      WHEN LOWER(b.canonical_name) LIKE '%' || LOWER(search_term) || '%' THEN 60.0
      WHEN LOWER(b.japanese_name) LIKE '%' || LOWER(search_term) || '%' THEN 60.0
      WHEN LOWER(b.katakana_name) LIKE '%' || LOWER(search_term) || '%' THEN 60.0
      WHEN LOWER(b.hiragana_name) LIKE '%' || LOWER(search_term) || '%' THEN 60.0
      ELSE 40.0
    END as match_score
  FROM brands b
  WHERE b.is_active = true
    AND (
      LOWER(b.canonical_name) LIKE '%' || LOWER(search_term) || '%'
      OR LOWER(b.japanese_name) LIKE '%' || LOWER(search_term) || '%'
      OR LOWER(b.katakana_name) LIKE '%' || LOWER(search_term) || '%'
      OR LOWER(b.hiragana_name) LIKE '%' || LOWER(search_term) || '%'
      OR EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(b.aliases) as alias
        WHERE LOWER(alias) LIKE '%' || LOWER(search_term) || '%'
      )
    )
  ORDER BY match_score DESC, b.canonical_name ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;