-- bank_accounts テーブル作成
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
CREATE INDEX idx_bank_accounts_user_id ON bank_accounts(user_id);

-- Row Level Security を有効化
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー作成
CREATE POLICY "Users can view their own bank accounts" ON bank_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bank accounts" ON bank_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank accounts" ON bank_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank accounts" ON bank_accounts
  FOR DELETE USING (auth.uid() = user_id);