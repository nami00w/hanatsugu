-- Hanatsugu データベーステーブル作成 & 初期データ投入
-- Supabase SQL Editor で実行してください

-- 1. listings テーブル (ドレス出品情報)
CREATE TABLE listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  original_price INTEGER,
  images TEXT[] NOT NULL DEFAULT '{}',
  size TEXT NOT NULL,
  brand TEXT NOT NULL,
  condition TEXT NOT NULL,
  color TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'ウェディングドレス',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_history TEXT NOT NULL,
  measurements JSONB,
  features TEXT[],
  silhouette TEXT,
  neckline TEXT,
  sleeve_style TEXT,
  skirt_length TEXT,
  model_name TEXT,
  manufacture_year INTEGER,
  wear_count TEXT,
  is_cleaned BOOLEAN DEFAULT true,
  accept_offers BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'sold', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. favorites テーブル (お気に入り)
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dress_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, dress_id)
);

-- 3. sales テーブル (売上履歴)
CREATE TABLE sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  platform_fee INTEGER NOT NULL,
  net_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 4. withdrawals テーブル (振込申請)
CREATE TABLE withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  bank_account_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- 5. bank_accounts テーブル (銀行口座情報)
CREATE TABLE bank_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  branch_name TEXT NOT NULL,
  account_type TEXT DEFAULT 'checking' CHECK (account_type IN ('checking', 'savings')),
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_bank_accounts_user_id ON bank_accounts(user_id);

-- Row Level Security (RLS) を有効化
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー作成

-- listings テーブルのポリシー
CREATE POLICY "Public listings are viewable by everyone" ON listings
  FOR SELECT USING (status = 'published');

CREATE POLICY "Users can insert their own listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" ON listings
  FOR DELETE USING (auth.uid() = user_id);

-- favorites テーブルのポリシー
CREATE POLICY "Users can view their own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- sales テーブルのポリシー
CREATE POLICY "Users can view their own sales" ON sales
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = buyer_id);

-- withdrawals テーブルのポリシー
CREATE POLICY "Users can view their own withdrawals" ON withdrawals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own withdrawals" ON withdrawals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- bank_accounts テーブルのポリシー
CREATE POLICY "Users can view their own bank accounts" ON bank_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bank accounts" ON bank_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank accounts" ON bank_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank accounts" ON bank_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- ストレージバケット作成 (Supabase Storage)
-- これらはSupabase DashboardのStorageセクションで手動作成してください：
-- 1. dress-images (public bucket)
-- 2. profile-images (public bucket)

-- 注意: サンプルデータの投入は管理者のみが行います
-- 実際のサービスでは、ユーザーはアプリのUIを通じてデータを作成します

-- 管理者用: テストユーザー作成後に実行するサンプルデータ
-- この部分は実際のuser_idを取得してから管理者が実行してください

-- 実行後の確認クエリ
-- SELECT * FROM listings;
-- SELECT * FROM sales;
-- SELECT * FROM bank_accounts;
-- SELECT * FROM favorites;

-- 実際のサービス運用について:
-- 1. 管理者がテーブル構造のみ作成
-- 2. ユーザーはアプリのUIを通じてデータを作成
-- 3. サンプルデータは管理者が必要に応じて追加
-- 4. ストレージバケット (dress-images, profile-images) は手動でDashboardから作成