-- Favorites テーブル作成
-- Supabase ダッシュボードの SQL Editor で実行してください

create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  dress_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- 同じユーザーが同じドレスを重複してお気に入り登録することを防ぐ
  unique(user_id, dress_id)
);

-- RLS (Row Level Security) を有効化
alter table public.favorites enable row level security;

-- ポリシー設定: ユーザーは自分のお気に入りのみ操作可能
create policy "Users can view their own favorites" on public.favorites
  for select using (auth.uid() = user_id);

create policy "Users can insert their own favorites" on public.favorites
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own favorites" on public.favorites
  for delete using (auth.uid() = user_id);

-- インデックス作成（パフォーマンス向上）
create index if not exists favorites_user_id_idx on public.favorites(user_id);
create index if not exists favorites_dress_id_idx on public.favorites(dress_id);
create index if not exists favorites_created_at_idx on public.favorites(created_at desc);