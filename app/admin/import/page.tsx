'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/admin';
import {
  QuickDressInput,
  createDefaultDress,
  POPULAR_BRANDS,
  SIZE_OPTIONS,
  CONDITION_OPTIONS,
  COLOR_OPTIONS,
  CATEGORY_OPTIONS,
  formatPrice,
  parsePrice,
  isValidImageUrl,
  ImportProgress
} from '@/lib/adminTypes';
import { 
  PlusIcon, 
  TrashIcon, 
  ClipboardDocumentListIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AdminImportPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [dresses, setDresses] = useState<QuickDressInput[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // 認証チェック
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin(user))) {
      window.location.href = '/';
    }
  }, [user, isAuthenticated, loading]);

  // 初期化：10着分のデフォルトドレスを作成
  useEffect(() => {
    if (dresses.length === 0) {
      const initialDresses = Array.from({ length: 10 }, (_, i) => 
        createDefaultDress(`dress-${i + 1}`)
      );
      setDresses(initialDresses);
    }
  }, [dresses]);

  // ローディング中または認証チェック中
  if (loading || !isAuthenticated || !isAdmin(user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">管理者権限を確認中...</div>
      </div>
    );
  }

  const updateDress = (index: number, updates: Partial<QuickDressInput>) => {
    setDresses(prev => prev.map((dress, i) => 
      i === index ? { ...dress, ...updates } : dress
    ));
  };

  const copyFromPrevious = (index: number) => {
    if (index === 0) return;
    const previousDress = dresses[index - 1];
    const copiedDress = {
      ...previousDress,
      id: dresses[index].id,
      title: '',
      imageUrls: [],
      quickDescription: previousDress.quickDescription
    };
    updateDress(index, copiedDress);
  };

  const addImageUrl = (dressIndex: number, url: string) => {
    if (!url.trim()) return;
    
    if (!isValidImageUrl(url)) {
      alert('有効な画像URLを入力してください。メルカリやUnsplashなどの画像URLに対応しています。');
      return;
    }

    const dress = dresses[dressIndex];
    if (dress.imageUrls.includes(url)) {
      alert('この画像は既に追加されています。');
      return;
    }

    updateDress(dressIndex, {
      imageUrls: [...dress.imageUrls, url]
    });
  };

  const removeImageUrl = (dressIndex: number, urlIndex: number) => {
    const dress = dresses[dressIndex];
    updateDress(dressIndex, {
      imageUrls: dress.imageUrls.filter((_, i) => i !== urlIndex)
    });
  };

  const validateDress = (dress: QuickDressInput): string[] => {
    const errors: string[] = [];
    
    if (!dress.title.trim()) errors.push('タイトルが必要です');
    if (dress.imageUrls.length === 0) errors.push('最低1枚の画像が必要です');
    if (dress.price <= 0) errors.push('価格を入力してください');
    if (!dress.brand.trim()) errors.push('ブランドを選択してください');
    
    return errors;
  };

  const getValidDresses = () => {
    return dresses.filter(dress => {
      const errors = validateDress(dress);
      return errors.length === 0;
    });
  };

  const startBulkImport = async () => {
    const validDresses = getValidDresses();
    
    if (validDresses.length === 0) {
      alert('登録可能なドレスがありません。必須項目を入力してください。');
      return;
    }

    setIsImporting(true);
    setImportProgress({
      total: validDresses.length,
      completed: 0,
      current: '',
      errors: []
    });

    // 実際の登録処理（現在はダミー実装）
    for (let i = 0; i < validDresses.length; i++) {
      const dress = validDresses[i];
      
      setImportProgress(prev => prev ? {
        ...prev,
        completed: i,
        current: dress.title || `ドレス ${i + 1}`
      } : null);

      // ダミーの処理時間
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        // TODO: 実際のAPI呼び出し
        console.log('Importing dress:', dress);
        
        setImportProgress(prev => prev ? {
          ...prev,
          completed: i + 1
        } : null);
      } catch (error) {
        setImportProgress(prev => prev ? {
          ...prev,
          errors: [...prev.errors, { index: i, message: `エラー: ${error}` }]
        } : null);
      }
    }

    setIsImporting(false);
    alert(`${validDresses.length}件のドレスを登録しました！`);
  };

  const resetForm = () => {
    const initialDresses = Array.from({ length: 10 }, (_, i) => 
      createDefaultDress(`dress-${i + 1}`)
    );
    setDresses(initialDresses);
    setActiveTab(0);
    setShowPreview(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ドレス一括登録
              </h1>
              <p className="text-gray-600">
                最大10着のドレスを効率的に登録できます
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                管理画面に戻る
              </Link>
            </div>
          </div>
        </div>

        {/* 進捗表示 */}
        {importProgress && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500"></div>
              <span className="font-medium">登録中...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(importProgress.completed / importProgress.total) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {importProgress.completed} / {importProgress.total} 完了
              {importProgress.current && ` - ${importProgress.current}`}
            </p>
          </div>
        )}

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {dresses.map((dress, index) => {
                const errors = validateDress(dress);
                const hasErrors = errors.length > 0;
                const hasContent = dress.title.trim() || dress.imageUrls.length > 0;
                
                return (
                  <button
                    key={dress.id}
                    onClick={() => setActiveTab(index)}
                    className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === index
                        ? 'border-pink-500 text-pink-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>ドレス {index + 1}</span>
                      {hasContent && (
                        <div className={`w-2 h-2 rounded-full ${
                          hasErrors ? 'bg-red-500' : 'bg-green-500'
                        }`}></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* タブナビゲーションボタン */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
              disabled={activeTab === 0}
              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              前へ
            </button>

            <div className="flex items-center gap-2">
              {activeTab > 0 && (
                <button
                  onClick={() => copyFromPrevious(activeTab)}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                >
                  <ClipboardDocumentListIcon className="w-4 h-4" />
                  前のドレスからコピー
                </button>
              )}
            </div>

            <button
              onClick={() => setActiveTab(Math.min(dresses.length - 1, activeTab + 1))}
              disabled={activeTab === dresses.length - 1}
              className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              次へ
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ドレス入力フォーム */}
        <DressForm
          dress={dresses[activeTab]}
          onUpdate={(updates) => updateDress(activeTab, updates)}
          onAddImage={(url) => addImageUrl(activeTab, url)}
          onRemoveImage={(urlIndex) => removeImageUrl(activeTab, urlIndex)}
        />

        {/* アクションボタン */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              登録可能: {getValidDresses().length} / {dresses.length} 着
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                リセット
              </button>
              
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 text-pink-600 border border-pink-300 rounded-md hover:bg-pink-50 transition-colors"
              >
                {showPreview ? 'フォームに戻る' : 'プレビュー'}
              </button>
              
              <button
                onClick={startBulkImport}
                disabled={isImporting || getValidDresses().length === 0}
                className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isImporting ? '登録中...' : `${getValidDresses().length}着を一括登録`}
              </button>
            </div>
          </div>
        </div>

        {/* プレビュー */}
        {showPreview && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">登録プレビュー</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getValidDresses().map((dress, index) => (
                <DressPreview key={dress.id} dress={dress} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ドレス入力フォームコンポーネント
function DressForm({ 
  dress, 
  onUpdate, 
  onAddImage, 
  onRemoveImage 
}: {
  dress: QuickDressInput;
  onUpdate: (updates: Partial<QuickDressInput>) => void;
  onAddImage: (url: string) => void;
  onRemoveImage: (urlIndex: number) => void;
}) {
  const [newImageUrl, setNewImageUrl] = useState('');

  const handleAddImage = () => {
    onAddImage(newImageUrl);
    setNewImageUrl('');
  };

  const errors = dress ? Object.entries({
    title: !dress.title.trim() ? 'タイトルが必要です' : null,
    images: dress.imageUrls.length === 0 ? '最低1枚の画像が必要です' : null,
    price: dress.price <= 0 ? '価格を入力してください' : null,
  }).filter(([_, error]) => error !== null) : [];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span className="font-medium">入力エラー</span>
          </div>
          <ul className="text-sm text-red-600 space-y-1">
            {errors.map(([field, error]) => (
              <li key={field}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左カラム：基本情報 */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              商品タイトル *
            </label>
            <input
              type="text"
              value={dress.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="例: VERA WANG Liesel エレガントドレス"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ブランド *
              </label>
              <select
                value={dress.brand}
                onChange={(e) => onUpdate({ brand: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {POPULAR_BRANDS.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                サイズ *
              </label>
              <select
                value={dress.size}
                onChange={(e) => onUpdate({ size: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {SIZE_OPTIONS.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カラー
              </label>
              <select
                value={dress.color}
                onChange={(e) => onUpdate({ color: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {COLOR_OPTIONS.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ
              </label>
              <select
                value={dress.category}
                onChange={(e) => onUpdate({ category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {CATEGORY_OPTIONS.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              コンディション *
            </label>
            <select
              value={dress.condition}
              onChange={(e) => onUpdate({ condition: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {CONDITION_OPTIONS.map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                販売価格 * (円)
              </label>
              <input
                type="text"
                value={formatPrice(dress.price)}
                onChange={(e) => onUpdate({ price: parsePrice(e.target.value) })}
                placeholder="100,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                参考価格 (円)
              </label>
              <input
                type="text"
                value={dress.originalPrice ? formatPrice(dress.originalPrice) : ''}
                onChange={(e) => onUpdate({ originalPrice: parsePrice(e.target.value) || undefined })}
                placeholder="300,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              簡易説明
            </label>
            <textarea
              value={dress.quickDescription || ''}
              onChange={(e) => onUpdate({ quickDescription: e.target.value })}
              rows={3}
              placeholder="結婚式で1度着用。クリーニング済み。大切に保管していました。"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* 右カラム：画像管理 */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              画像URL追加 *
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://static.mercdn.net/..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                onClick={handleAddImage}
                disabled={!newImageUrl.trim()}
                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              メルカリ、Unsplash等の画像URLに対応
            </p>
          </div>

          {/* 画像プレビュー */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              画像プレビュー ({dress.imageUrls.length})
            </label>
            {dress.imageUrls.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">画像URLを追加してください</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {dress.imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`ドレス画像 ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280">Error</text></svg>';
                      }}
                    />
                    <button
                      onClick={() => onRemoveImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ドレスプレビューコンポーネント
function DressPreview({ dress, index }: { dress: QuickDressInput; index: number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="aspect-square bg-gray-100">
        {dress.imageUrls[0] ? (
          <img
            src={dress.imageUrls[0]}
            alt={dress.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PhotoIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{dress.title}</h3>
        <p className="text-xs text-gray-600 mb-2">{dress.brand} • {dress.size}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-pink-600">
            ¥{formatPrice(dress.price)}
          </span>
          {dress.originalPrice && (
            <span className="text-xs text-gray-500 line-through">
              ¥{formatPrice(dress.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}