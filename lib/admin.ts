import { User } from '@supabase/supabase-js';

// 管理者権限をチェックする関数
export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  
  // 開発環境では特定のメールアドレスを管理者として扱う
  const adminEmails = [
    'admin@hanatsugu.com',
    'test@example.com', // 開発用
  ];
  
  // ユーザーのメールアドレスが管理者リストに含まれているかチェック
  return adminEmails.includes(user.email || '');
  
  // 本番環境では user_metadata.role や専用のadminsテーブルを使用することを推奨
  // return user.user_metadata?.role === 'admin';
}

// 管理者権限が必要なページで使用するフック
export function useAdminGuard() {
  return {
    isAdmin,
    requireAdmin: (user: User | null, redirectPath: string = '/') => {
      if (!isAdmin(user)) {
        if (typeof window !== 'undefined') {
          window.location.href = redirectPath;
        }
        return false;
      }
      return true;
    }
  };
}