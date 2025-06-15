'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string; needsEmailVerification?: boolean; email?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  updateEmail: (newEmail: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
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
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((error) => {
      console.error('Error getting session:', error);
      setSession(null);
      setUser(null);
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

      // メール認証が完了するまでセッションは作成されない
      return { 
        success: true, 
        needsEmailVerification: true,
        email: email 
      };
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
      // セッション状態を先にクリア
      setSession(null);
      setUser(null);
      
      // ローカルストレージからも削除
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('supabase.auth.token');
        window.localStorage.removeItem('supabase.auth.refreshToken');
      }
      
      // Supabaseのサインアウト（エラーを無視）
      await supabase.auth.signOut({ scope: 'local' });
      
      router.push('/');
    } catch (error: any) {
      console.warn('SignOut warning (ignored):', error.message);
      // エラーが発生してもリダイレクトは実行
      router.push('/');
    }
  };

  // ユーザー情報を手動でリフレッシュする関数
  const refreshUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error refreshing user:', error);
        return;
      }
      setUser(user);
      console.log('✅ User information refreshed:', user?.user_metadata);
    } catch (error) {
      console.error('Exception in refreshUser:', error);
    }
  };

  // メール認証の再送信
  const resendConfirmationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/welcome`
        }
      });

      if (error) {
        console.error('Resend confirmation error:', error);
        return { success: false, error: 'メールの再送信に失敗しました' };
      }

      return { success: true };
    } catch (error) {
      console.error('Exception in resendConfirmationEmail:', error);
      return { success: false, error: 'メールの再送信中にエラーが発生しました' };
    }
  };

  // パスワードリセット
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        console.error('Reset password error:', error);
        return { success: false, error: 'パスワードリセットメールの送信に失敗しました' };
      }

      return { success: true };
    } catch (error) {
      console.error('Exception in resetPassword:', error);
      return { success: false, error: 'パスワードリセット処理中にエラーが発生しました' };
    }
  };

  // パスワード更新
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Update password error:', error);
        if (error.message.includes('Password should be at least')) {
          return { success: false, error: 'パスワードは6文字以上で入力してください' };
        }
        return { success: false, error: 'パスワードの更新に失敗しました' };
      }

      return { success: true };
    } catch (error) {
      console.error('Exception in updatePassword:', error);
      return { success: false, error: 'パスワード更新処理中にエラーが発生しました' };
    }
  };

  // メールアドレス更新
  const updateEmail = async (newEmail: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) {
        console.error('Update email error:', error);
        if (error.message.includes('Email address is invalid')) {
          return { success: false, error: '有効なメールアドレスを入力してください' };
        }
        if (error.message.includes('Email already exists')) {
          return { success: false, error: 'このメールアドレスは既に使用されています' };
        }
        return { success: false, error: 'メールアドレスの更新に失敗しました' };
      }

      return { success: true };
    } catch (error) {
      console.error('Exception in updateEmail:', error);
      return { success: false, error: 'メールアドレス更新処理中にエラーが発生しました' };
    }
  };

  // Googleログイン
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/welcome`
        }
      });

      if (error) {
        console.error('Google sign in error:', error);
        return { success: false, error: 'Googleログインに失敗しました' };
      }

      return { success: true };
    } catch (error) {
      console.error('Exception in signInWithGoogle:', error);
      return { success: false, error: 'Googleログイン処理中にエラーが発生しました' };
    }
  };


  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUser,
    resendConfirmationEmail,
    resetPassword,
    updatePassword,
    updateEmail,
    signInWithGoogle,
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