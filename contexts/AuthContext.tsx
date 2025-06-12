'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 初期セッションの取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // セッション変更の監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        console.error('SignUp error:', error);
        // 日本語エラーメッセージ
        if (error.message.includes('User already registered')) {
          return { success: false, error: 'このメールアドレスは既に登録されています' };
        }
        if (error.message.includes('Password should be at least')) {
          return { success: false, error: 'パスワードは6文字以上で入力してください' };
        }
        if (error.message.includes('Invalid email')) {
          return { success: false, error: '有効なメールアドレスを入力してください' };
        }
        return { success: false, error: error.message };
      }

      // 開発環境では自動ログイン（メール確認不要）
      if (data.user && !data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          return { success: false, error: 'アカウント作成後のログインに失敗しました' };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('SignUp error:', error);
      return { success: false, error: '登録処理中にエラーが発生しました' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('SignIn error:', error);
        // 日本語エラーメッセージ
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'メールアドレスまたはパスワードが正しくありません' };
        }
        if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'メールアドレスの確認が完了していません' };
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('SignIn error:', error);
      return { success: false, error: 'ログイン処理中にエラーが発生しました' };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/');
    } catch (error) {
      console.error('SignOut error:', error);
    }
  };

  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}