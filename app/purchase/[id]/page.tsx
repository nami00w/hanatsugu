'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  brand: string;
  size: string;
  seller_id: string;
}

interface ShippingAddress {
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  building?: string;
  name: string;
  phone: string;
}

function CheckoutForm({ product }: { product: Product; shippingAddress: ShippingAddress }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/purchase/complete`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || '決済処理中にエラーが発生しました');
      setIsProcessing(false);
    } else {
      // 決済成功 - 注文を確定
      router.push('/purchase/complete');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">お支払い情報</h3>
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-pink-500 text-white py-3 px-4 rounded-md hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? '処理中...' : `¥${product.price.toLocaleString()}を支払う`}
      </button>
    </form>
  );
}

export default function PurchasePage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [platformFee, setPlatformFee] = useState(0);
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    postalCode: '',
    prefecture: '',
    city: '',
    address: '',
    building: '',
    name: '',
    phone: '',
  });

  useEffect(() => {
    // ダミーデータ - 実際はAPIから取得
    const dummyProduct: Product = {
      id: params.id as string,
      title: 'エレガントなAラインドレス',
      price: 98000,
      images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8'],
      brand: 'Vera Wang',
      size: 'M (9号)',
      seller_id: 'seller123',
    };
    setProduct(dummyProduct);
  }, [params.id]);

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) return;

    // Payment Intentを作成
    const response = await fetch('/api/payment/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: product.price,
        productId: product.id,
        sellerId: product.seller_id,
      }),
    });

    const data = await response.json();
    setClientSecret(data.clientSecret);
    setPlatformFee(data.platformFee);
    setStep('payment');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  if (!product) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8">購入手続き</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 商品情報 */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">購入商品</h2>
            <div className="flex gap-4">
              <Image
                src={product.images[0]}
                alt={product.title}
                width={100}
                height={100}
                className="rounded-md object-cover"
              />
              <div>
                <h3 className="font-medium">{product.title}</h3>
                <p className="text-sm text-gray-600">{product.brand}</p>
                <p className="text-sm text-gray-600">サイズ: {product.size}</p>
                <p className="text-lg font-semibold mt-2">¥{product.price.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>商品価格</span>
                <span>¥{product.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>手数料（15%）</span>
                <span>¥{platformFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                <span>合計</span>
                <span>¥{product.price.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* フォーム */}
          <div>
            {step === 'shipping' ? (
              <form onSubmit={handleShippingSubmit} className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">配送先情報</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">お名前</label>
                    <input
                      type="text"
                      name="name"
                      value={shippingAddress.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">郵便番号</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={handleInputChange}
                      placeholder="123-4567"
                      required
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">都道府県</label>
                    <input
                      type="text"
                      name="prefecture"
                      value={shippingAddress.prefecture}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">市区町村</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">番地</label>
                    <input
                      type="text"
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">建物名・部屋番号（任意）</label>
                    <input
                      type="text"
                      name="building"
                      value={shippingAddress.building}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">電話番号</label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 bg-pink-500 text-white py-3 px-4 rounded-md hover:bg-pink-600 transition-colors"
                >
                  お支払いへ進む
                </button>
              </form>
            ) : (
              clientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#ec4899',
                      },
                    },
                  }}
                >
                  <CheckoutForm product={product} shippingAddress={shippingAddress} />
                </Elements>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}