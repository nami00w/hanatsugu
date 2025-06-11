'use client'

import { useState } from 'react'
import { useShareProduct } from '@/hooks/useShareProduct'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  shareData: {
    title: string
    text: string
    url: string
  }
}

export default function ShareModal({ isOpen, onClose, shareData }: ShareModalProps) {
  const { shareToLine, shareToTwitter, copyToClipboard, shareViaWebAPI } = useShareProduct()
  const [copySuccess, setCopySuccess] = useState(false)

  if (!isOpen) return null

  const handleCopy = async () => {
    const success = await copyToClipboard(shareData.url)
    if (success) {
      setCopySuccess(true)
      setTimeout(() => {
        setCopySuccess(false)
        onClose()
      }, 1500)
    }
  }

  const handleShare = (method: 'line' | 'twitter' | 'other') => {
    if (method === 'line') {
      shareToLine(shareData)
    } else if (method === 'twitter') {
      shareToTwitter(shareData)
    } else if (method === 'other') {
      shareViaWebAPI(shareData)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">商品をシェア</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* シェアオプション */}
        <div className="p-6 space-y-4">
          {/* LINE */}
          <button
            onClick={() => handleShare('line')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.628-.629.628M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">LINE</div>
              <div className="text-sm text-gray-500">LINEで友達にシェア</div>
            </div>
          </button>

          {/* Twitter */}
          <button
            onClick={() => handleShare('twitter')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">X (Twitter)</div>
              <div className="text-sm text-gray-500">Xでツイート</div>
            </div>
          </button>

          {/* その他（Web Share API） */}
          <button
            onClick={() => handleShare('other')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">その他</div>
              <div className="text-sm text-gray-500">他のアプリで共有</div>
            </div>
          </button>

          {/* URLコピー */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              {copySuccess ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">
                {copySuccess ? 'コピーしました！' : 'URLをコピー'}
              </div>
              <div className="text-sm text-gray-500">
                {copySuccess ? '他のアプリで共有できます' : 'リンクをクリップボードにコピー'}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}