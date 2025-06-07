interface DressCardProps {
  id: number;
  brand: string;
  model: string;
  size: string;
  price: number;
  originalPrice: number;
  imageUrl?: string;
}

export default function DressCard({
  id,
  brand,
  model,
  size,
  price,
  originalPrice,
  imageUrl,
}: DressCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
      <div className="h-80 bg-gray-200 relative">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={`${brand} ${model}`}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow">
          <svg
            className="w-6 h-6 text-gray-400 hover:text-pink-500 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {brand} {model}
        </h3>
        <p className="text-sm text-gray-500 mt-1">サイズ: {size}</p>
        <p className="text-2xl font-bold text-pink-600 mt-4">
          ¥{price.toLocaleString()}
        </p>
        <p className="text-sm text-gray-500 line-through">
          定価 ¥{originalPrice.toLocaleString()}
        </p>
        <div className="mt-2">
          <span className="text-sm font-medium text-green-600">
            {Math.round((1 - price / originalPrice) * 100)}% OFF
          </span>
        </div>
      </div>
    </div>
  );
}
