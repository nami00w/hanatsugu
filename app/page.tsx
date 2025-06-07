export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* ヒーローセクション */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              大切なドレスに、次の物語を
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              あなたの特別な一着が、次の花嫁の特別な一日を彩ります
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 md:py-4 md:text-lg md:px-10">
                  ドレスを探す
                </button>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-pink-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                  ドレスを出品
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 検索セクション */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <input
              type="text"
              placeholder="ブランド名、スタイル、サイズで検索..."
              className="w-full px-6 py-4 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* カテゴリーセクション */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            価格帯から探す
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { price: "〜10万円", count: "234" },
              { price: "10〜20万円", count: "456" },
              { price: "20〜30万円", count: "189" },
              { price: "30万円〜", count: "87" },
            ].map((category) => (
              <div
                key={category.price}
                className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer"
              >
                <p className="text-2xl font-bold text-gray-900">{category.price}</p>
                <p className="text-sm text-gray-500 mt-2">{category.count}着</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 商品一覧セクション */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            新着ドレス
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* ダミー商品カード */}
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-80 bg-gray-200 relative">
                  <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    ブランド名 ドレスモデル
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">サイズ: 9号</p>
                  <p className="text-2xl font-bold text-pink-600 mt-4">
                    ¥128,000
                  </p>
                  <p className="text-sm text-gray-500 line-through">
                    定価 ¥380,000
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
