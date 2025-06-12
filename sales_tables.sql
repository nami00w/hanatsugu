-- sales テーブル作成
CREATE TABLE sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  platform_fee INTEGER NOT NULL,
  net_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- withdrawals テーブル作成
CREATE TABLE withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  bank_account_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- インデックス作成
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);

-- Row Level Security を有効化
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- sales テーブルのRLSポリシー
CREATE POLICY "Users can view their own sales" ON sales
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = buyer_id);

CREATE POLICY "Users can insert their own sales" ON sales
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- withdrawals テーブルのRLSポリシー
CREATE POLICY "Users can view their own withdrawals" ON withdrawals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own withdrawals" ON withdrawals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own withdrawals" ON withdrawals
  FOR UPDATE USING (auth.uid() = user_id);