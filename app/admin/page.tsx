'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/admin';
import Link from 'next/link';
import { 
  PlusIcon, 
  DocumentPlusIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';

export default function AdminPage() {
  const { user, isAuthenticated, loading } = useAuth();

  // 認証チェック
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin(user))) {
      window.location.href = '/';
    }
  }, [user, isAuthenticated, loading]);

  // ローディング中または認証チェック中
  if (loading || !isAuthenticated || !isAdmin(user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">管理者権限を確認中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Hanatsugu 管理画面
              </h1>
              <p className="text-gray-600">
                ドレスの管理、ユーザー管理、分析などの管理機能にアクセスできます
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">管理者</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* メニューグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ドレス一括登録 */}
          <Link
            href="/admin/import"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-pink-100 p-3 rounded-lg group-hover:bg-pink-200 transition-colors">
                <DocumentPlusIcon className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">ドレス一括登録</h2>
                <p className="text-sm text-gray-600">複数のドレスを効率的に登録</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              最大10着のドレスをタブ形式で一度に登録できます。メルカリ画像URLに対応。
            </div>
          </Link>

          {/* 個別ドレス登録 */}
          <Link
            href="/sell"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                <PlusIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">個別ドレス登録</h2>
                <p className="text-sm text-gray-600">1着ずつ詳細に登録</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              通常の出品フローで、写真アップロードや詳細な説明を含めて登録できます。
            </div>
          </Link>

          {/* ユーザー管理 */}
          <div className="bg-white rounded-lg shadow-sm p-6 opacity-75">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <UsersIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">ユーザー管理</h2>
                <p className="text-sm text-gray-600">ユーザー情報の管理</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              ユーザーの確認、権限管理、アカウント状態の管理など。（準備中）
            </div>
          </div>

          {/* 分析・レポート */}
          <div className="bg-white rounded-lg shadow-sm p-6 opacity-75">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">分析・レポート</h2>
                <p className="text-sm text-gray-600">売上や利用状況の分析</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              売上推移、人気ブランド、ユーザー動向などの分析データ。（準備中）
            </div>
          </div>

          {/* システム設定 */}
          <div className="bg-white rounded-lg shadow-sm p-6 opacity-75">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <CogIcon className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">システム設定</h2>
                <p className="text-sm text-gray-600">アプリケーション設定</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              手数料設定、メール設定、その他システム設定の管理。（準備中）
            </div>
          </div>

          {/* 戻るリンク */}
          <Link
            href="/"
            className="bg-gray-100 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-700 mb-2">
                サイトに戻る
              </div>
              <div className="text-sm text-gray-500">
                通常のサイトに戻る
              </div>
            </div>
          </Link>
        </div>

        {/* 開発者情報 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="bg-yellow-400 rounded-full p-1">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">開発者向け情報</p>
              <p className="text-sm text-yellow-700 mt-1">
                管理者権限は lib/admin.ts で設定されています。
                現在は <code>admin@hanatsugu.com</code> と <code>test@example.com</code> が管理者として設定されています。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}