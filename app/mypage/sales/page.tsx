'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { CurrencyYenIcon, TruckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';

interface Sale {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  productImage: string;
  amount: number;
  platformFee: number;
  netAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'withdrawn';
  buyerName: string;
  orderDate: string;
  completedDate?: string;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'withdrawn'>('all');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedSales, setSelectedSales] = useState<string[]>([]);

  // ダミーデータ
  useEffect(() => {
    setSales([
      {
        id: '1',
        orderId: 'ORDER-001',
        productId: '1',
        productTitle: 'VERA WANG Liesel エレガントドレス',
        productImage: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261',
        amount: 128000,
        platformFee: 19200,
        netAmount: 108800,
        status: 'completed',
        buyerName: '山田 花子',
        orderDate: '2024-03-01',
        completedDate: '2024-03-08'
      },
      {
        id: '2',
        orderId: 'ORDER-002',
        productId: '2',
        productTitle: 'Pronovias Draco ロマンチックドレス',
        productImage: 'https://images.unsplash.com/photo-1565378781267-616ed0977ce5',
        amount: 95000,
        platformFee: 14250,
        netAmount: 80750,
        status: 'shipped',
        buyerName: '佐藤 美咲',
        orderDate: '2024-03-10'
      },
      {
        id: '3',
        orderId: 'ORDER-003',
        productId: '3',
        productTitle: 'ANTONIO RIVA Gemma クラシックドレス',
        productImage: 'https://images.unsplash.com/photo-1522653216850-4f1415a174fb',
        amount: 168000,
        platformFee: 25200,
        netAmount: 142800,
        status: 'withdrawn',
        buyerName: '鈴木 理恵',
        orderDate: '2024-02-15',
        completedDate: '2024-02-22'
      }
    ]);
  }, []);

  const filteredSales = sales.filter(sale => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ['pending', 'paid', 'shipped', 'delivered'].includes(sale.status);
    if (filter === 'completed') return sale.status === 'completed';
    if (filter === 'withdrawn') return sale.status === 'withdrawn';
    return true;
  });

  const totalAvailable = sales
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + s.netAmount, 0);

  const totalPending = sales
    .filter(s => ['pending', 'paid', 'shipped', 'delivered'].includes(s.status))
    .reduce((sum, s) => sum + s.netAmount, 0);

  const getStatusLabel = (status: Sale['status']) => {
    const labels = {
      pending: '支払済',
      paid: '支払済',
      shipped: '発送済',
      delivered: '配達済',
      completed: '振込可能',
      withdrawn: '振込済'
    };
    return labels[status];
  };

  const getStatusColor = (status: Sale['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      withdrawn: 'bg-gray-100 text-gray-800'
    };
    return colors[status];
  };

  const handleWithdraw = () => {
    // 振込申請処理
    console.log('Withdrawing:', selectedSales);
    setShowWithdrawModal(false);
    setSelectedSales([]);
  };

  return (
    <>
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
                    ? 'bg-pink-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'pending' 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                処理中
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'completed' 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                振込可能
              </button>
              <button
                onClick={() => setFilter('withdrawn')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'withdrawn' 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                振込済
              </button>
            </div>
            
            {totalAvailable > 0 && (
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                振込申請
              </button>
            )}
          </div>
        </div>

        {/* 売上リスト */}
        <div className="space-y-4">
          {filteredSales.map((sale) => (
            <div key={sale.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={sale.productImage}
                    alt={sale.productTitle}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{sale.productTitle}</h3>
                      <p className="text-sm text-gray-600">購入者: {sale.buyerName}</p>
                      <p className="text-sm text-gray-600">注文日: {sale.orderDate}</p>
                      {sale.completedDate && (
                        <p className="text-sm text-gray-600">完了日: {sale.completedDate}</p>
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
                      <p className="font-semibold text-red-600">-¥{sale.platformFee.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">受取金額</p>
                      <p className="font-semibold text-green-600">¥{sale.netAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {sale.status === 'shipped' && (
                    <div className="mt-4">
                      <button className="text-pink-500 hover:text-pink-600 text-sm font-medium">
                        追跡番号を入力
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
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
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">支店名</label>
                <input
                  type="text"
                  placeholder="例: 渋谷支店"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">口座番号</label>
                <input
                  type="text"
                  placeholder="1234567"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">口座名義</label>
                <input
                  type="text"
                  placeholder="ヤマダ ハナコ"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
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