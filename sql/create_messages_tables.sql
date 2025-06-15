-- Hanatsugu メッセージ機能用テーブル作成
-- Supabase SQL Editor で実行してください

-- 1. conversations テーブル (会話のグループ化)
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dress_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dress_id, buyer_id, seller_id)
);

-- 2. messages テーブル (メッセージ履歴)
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. インデックス作成
CREATE INDEX idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX idx_conversations_dress_id ON conversations(dress_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- 4. RLS (Row Level Security) ポリシー設定
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- conversations テーブルのポリシー
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );

CREATE POLICY "Users can update their own conversations" ON conversations
  FOR UPDATE USING (
    auth.uid() = buyer_id OR auth.uid() = seller_id
  );

-- messages テーブルのポリシー
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can create messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = conversation_id 
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (
    auth.uid() = sender_id OR
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    )
  );

-- 5. 関数: 会話の更新日時を自動更新
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. トリガー: メッセージ作成時に会話の更新日時を更新
CREATE TRIGGER trigger_update_conversation_updated_at
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_updated_at();

-- 7. 関数: 未読メッセージ数を取得
CREATE OR REPLACE FUNCTION get_unread_messages_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE (c.buyer_id = user_uuid OR c.seller_id = user_uuid)
    AND m.sender_id != user_uuid
    AND m.is_read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 関数: 会話ごとの未読メッセージ数を取得
CREATE OR REPLACE FUNCTION get_conversation_unread_count(conversation_uuid UUID, user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM messages
    WHERE conversation_id = conversation_uuid
    AND sender_id != user_uuid
    AND is_read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;