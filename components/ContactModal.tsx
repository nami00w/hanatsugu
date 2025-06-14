'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMessages } from '@/hooks/useMessages'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  dressId: string
  dressTitle: string
  sellerId: string
}

export default function ContactModal({ isOpen, onClose, dressId, dressTitle, sellerId }: ContactModalProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const router = useRouter()
  const { createOrGetConversation, sendMessage } = useMessages()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    try {
      // 会話を作成または取得
      const conversationId = await createOrGetConversation(dressId, sellerId)
      
      // メッセージを送信
      await sendMessage(conversationId, message)

      // メッセージ画面に遷移
      router.push(`/mypage/messages/${conversationId}`)
      onClose()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('送信に失敗しました')
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">お問い合わせ</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          商品: {dressTitle}
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="出品者へのメッセージを入力してください"
            className="w-full border border-gray-300 rounded-lg p-3 min-h-[150px] focus:outline-none focus:border-[var(--primary-green)]"
            required
          />

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex-1 bg-[var(--primary-green)] text-white py-2 rounded-lg hover:bg-[var(--primary-green-dark)] transition-colors disabled:bg-gray-400"
            >
              {sending ? '送信中...' : '送信する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}