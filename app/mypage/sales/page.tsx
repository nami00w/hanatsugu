'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { CurrencyYenIcon, TruckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { salesAPI, dressesAPI, type Sale } from '@/lib/supabase';

// 拡張されたSale型（表示用）
interface SaleWithDetails extends Sale {
  listing?: {
    title: string;
    images: string[];
  };
  buyer?: {
    display_name?: string;
    email: string;
  };
}

export default function SalesPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'withdrawn'>('all');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedSales, setSelectedSales] = useState<string[]>([]);

  // 実際のデータを取得
  useEffect(() => {
    const loadSalesData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // 全ての売上データを取得
        const salesData = await salesAPI.getRecentSales(user.id, 50); // 最大50件
        
        // 各売上に商品情報と購入者情報を付加
        const salesWithDetails = await Promise.all(
          salesData.map(async (sale) => {
            try {
              // 商品情報を取得
              const listing = await dressesAPI.getDressById(sale.listing_id);
              
              // 購入者情報を取得（プライバシー保護のため限定的な情報のみ）
              const buyerName = `購入者${sale.buyer_id.slice(-4)}`; // IDの末尾4桁でマスク
              
              return {
                ...sale,
                listing: listing ? {
                  title: listing.title,
                  images: listing.images
                } : undefined,
                buyer: {
                  display_name: buyerName,
                  email: '****@****' // メールアドレスはマスク
                }
              };
            } catch (err) {
              console.error('Error loading sale details:', err);
              return {
                ...sale,
                listing: {
                  title: '商品情報取得エラー',
                  images: []
                },
                buyer: {
                  display_name: '購入者',
                  email: '****@****'
                }
              };
            }
          })
        );
        
        setSales(salesWithDetails);
        setError('');
      } catch (err) {
        console.error('Failed to load sales:', err);
        setError('売上データの取得に失敗しました');
        // エラー時はダミーデータを表示
        setSales([
          {
            id: 'demo-1',
            user_id: user.id,
            listing_id: 'demo-listing-1',
            amount: 128000,
            platform_fee: 19200,
            net_amount: 108800,
            status: 'completed',
            buyer_id: 'demo-buyer-1',
            created_at: '2024-03-01T00:00:00Z',
            completed_at: '2024-03-08T00:00:00Z',
            listing: {
              title: 'VERA WANG Liesel エレガントドレス',
              images: ['https://images.unsplash.com/photo-1594552072238-b8a33785b261']
            },
            buyer: {
              display_name: '山田 花子',
              email: 'buyer@example.com'
            }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadSalesData();
  }, [user]);

  const filteredSales = sales.filter(sale => {
    if (filter === 'all') return true;
    if (filter === 'pending') return sale.status === 'pending';
    if (filter === 'completed') return sale.status === 'completed';
    if (filter === 'withdrawn') return sale.status === 'cancelled'; // cancelledを振込済として扱う
    return true;
  });

  const totalAvailable = sales
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + s.net_amount, 0);

  const totalPending = sales
    .filter(s => s.status === 'pending')
    .reduce((sum, s) => sum + s.net_amount, 0);

  const getStatusLabel = (status: Sale['status']) => {
    const labels = {
      pending: '処理中',
      completed: '振込可能',
      cancelled: '振込済'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: Sale['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const handleWithdraw = () => {
    // 振込申請処理
    console.log('Withdrawing:', selectedSales);
    setShowWithdrawModal(false);
    setSelectedSales([]);
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-green)] mx-auto mb-4"></div>
              <p>売上データを読み込み中...</p>
            </div>
          </div>
        </div>
      )}
      <Header />
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">売上管理</h1>

        {/* サマリーカード */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">振込可能額</span>
              <CurrencyYenIcon className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">¥{totalAvailable.toLocaleString()}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">処理中</span>
              <TruckIcon className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">¥{totalPending.toLocaleString()}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">総売上</span>
              <CheckCircleIcon className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              ¥{sales.reduce((sum, s) => sum + s.netAmount, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'all' 
                    ? 'bg-[var(--primary-green)] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'pending' 
                    ? 'bg-[var(--primary-green)] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                処理中
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'completed' 
                    ? 'bg-[var(--primary-green)] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                振込可能
              </button>
              <button
                onClick={() => setFilter('withdrawn')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'withdrawn' 
                    ? 'bg-[var(--primary-green)] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                振込済
              </button>
            </div>
            
            {totalAvailable > 0 && (
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="bg-[var(--primary-green)] text-white px-4 py-2 rounded-md hover:bg-[var(--primary-green-dark)] transition-colors"
              >
                振込申請
              </button>
            )}
          </div>
        </div>

        {/* 売上リスト */}
        <div className="space-y-4">
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">{error}</p>
              <p className="text-sm text-yellow-600 mt-1">デモデータを表示しています</p>
            </div>
          )}
          
          {filteredSales.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <CurrencyYenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">売上がありません</h3>
              <p className="text-gray-600">商品が売れると、ここに売上履歴が表示されます。</p>
            </div>
          ) : (
            filteredSales.map((sale) => (
              <div key={sale.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="relative w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    {sale.listing?.images?.[0] ? (
                      <Image
                        src={sale.listing.images[0]}
                        alt={sale.listing.title || '商品画像'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-gray-400 text-xs text-center">画像なし</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{sale.listing?.title || '商品情報不明'}</h3>
                        <p className="text-sm text-gray-600">購入者: {sale.buyer?.display_name || '購入者'}</p>
                        <p className="text-sm text-gray-600">注文日: {new Date(sale.created_at).toLocaleDateString('ja-JP')}</p>
                        {sale.completed_at && (
                          <p className="text-sm text-gray-600">完了日: {new Date(sale.completed_at).toLocaleDateString('ja-JP')}</p>
                        )}
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sale.status)}`}>
                        {getStatusLabel(sale.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-600">販売価格</p>
                        <p className="font-semibold">¥{sale.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">手数料(15%)</p>
                        <p className="font-semibold text-red-600">-¥{sale.platform_fee.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">受取金額</p>
                        <p className="font-semibold text-[var(--primary-green)]">¥{sale.net_amount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 振込申請モーダル */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">振込申請</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">振込可能額</p>
              <p className="text-2xl font-bold text-green-600">¥{totalAvailable.toLocaleString()}</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">銀行名</label>
                <input
                  type="text"
                  placeholder="例: みずほ銀行"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">支店名</label>
                <input
                  type="text"
                  placeholder="例: 渋谷支店"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">口座番号</label>
                <input
                  type="text"
                  placeholder="1234567"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">口座名義</label>
                <input
                  type="text"
                  placeholder="ヤマダ ハナコ"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                />
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-800">
                振込は3-5営業日以内に処理されます。
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleWithdraw}
                className="flex-1 bg-[var(--primary-green)] text-white py-2 rounded-md hover:bg-[var(--primary-green-dark)] transition-colors"
              >
                申請する
              </button>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      </AuthGuard>
    </>
  );
}