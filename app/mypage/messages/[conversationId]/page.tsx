'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Send, Package, User } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import AuthGuard from '@/components/AuthGuard'
import { useAuth } from '@/contexts/AuthContext'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_name: string
  content: string
  created_at: string
  is_read: boolean
}

interface Conversation {
  id: string
  participants: string[]
  participant_names: string[]
  dress_id?: string
  dress_title?: string
  dress_image?: string
  dress_price?: number
}

export default function MessageDetailPage() {
  const { conversationId } = useParams()
  const { user } = useAuth()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ダミーデータ
  const dummyConversation: Conversation = {
    id: conversationId as string,
    participants: ['user1', 'user2'],
    participant_names: ['田中 美咲', '佐藤 花子'],
    dress_id: '1',
    dress_title: 'VERA WANG Liesel エレガントドレス',
    dress_image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=400&h=600&fit=crop',
    dress_price: 128000
  }

  const dummyMessages: Message[] = [
    {
      id: '1',
      conversation_id: conversationId as string,
      sender_id: 'user2',
      sender_name: '田中 美咲',
      content: 'こんにちは。VERA WANGのドレスについてお聞きしたいことがあります。',
      created_at: '2024-01-15T10:00:00Z',
      is_read: true
    },
    {
      id: '2',
      conversation_id: conversationId as string,
      sender_id: 'user1',
      sender_name: '佐藤 花子',
      content: 'こんにちは！お問い合わせありがとうございます。どのようなことでしょうか？',
      created_at: '2024-01-15T10:05:00Z',
      is_read: true
    },
    {
      id: '3',
      conversation_id: conversationId as string,
      sender_id: 'user2',
      sender_name: '田中 美咲',
      content: 'サイズ調整は可能でしょうか？9号なのですが、少しウエストを詰めたいと思っています。',
      created_at: '2024-01-15T10:10:00Z',
      is_read: true
    },
    {
      id: '4',
      conversation_id: conversationId as string,
      sender_id: 'user1',
      sender_name: '佐藤 花子',
      content: 'はい、サイズ調整は可能です。信頼できるドレス専門の仕立て屋さんをご紹介できます。費用は別途かかりますが、5,000円〜15,000円程度が相場です。',
      created_at: '2024-01-15T10:15:00Z',
      is_read: true
    },
    {
      id: '5',
      conversation_id: conversationId as string,
      sender_id: 'user2',
      sender_name: '田中 美咲',
      content: 'ありがとうございます。それでは購入を検討させていただきます。もう少し詳しく教えていただけますでしょうか？',
      created_at: '2024-01-15T10:30:00Z',
      is_read: false
    }
  ]

  useEffect(() => {
    // TODO: 実際の実装ではSupabaseから会話とメッセージを取得
    setConversation(dummyConversation)
    setMessages(dummyMessages)
    setLoading(false)
  }, [conversationId])

  useEffect(() => {
    // メッセージが更新されたらスクロールを最下部に移動
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !user) return

    setSending(true)
    
    try {
      // TODO: 実際の実装ではSupabaseにメッセージを保存
      const message: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId as string,
        sender_id: user.id,
        sender_name: user.user_metadata?.display_name || 'あなた',
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
        is_read: false
      }

      setMessages(prev => [...prev, message])
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('メッセージの送信に失敗しました')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const getOtherParticipantName = () => {
    // TODO: 実際の実装では現在のユーザー以外の参加者名を返す
    return conversation?.participant_names[0] || 'ユーザー'
  }

  if (loading) {
    return (
      <>
        <Header />
        <AuthGuard>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-lg">読み込み中...</div>
          </div>
        </AuthGuard>
      </>
    )
  }

  if (!conversation) {
    return (
      <>
        <Header />
        <AuthGuard>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-lg">メッセージが見つかりませんでした</div>
          </div>
        </AuthGuard>
      </>
    )
  }

  return (
    <>
      <Header />
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* ヘッダー */}
          <div className="bg-white border-b border-gray-200 px-4 py-4">
            <div className="max-w-4xl mx-auto flex items-center gap-4">
              <Link 
                href="/mypage/messages"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              
              {/* 相手の情報と商品情報 */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h1 className="font-semibold text-gray-900 truncate">
                    {getOtherParticipantName()}
                  </h1>
                  {conversation.dress_title && (
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.dress_title}
                    </p>
                  )}
                </div>

                {/* 商品情報 */}
                {conversation.dress_id && (
                  <Link
                    href={`/products/${conversation.dress_id}`}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                      {conversation.dress_image ? (
                        <Image
                          src={conversation.dress_image}
                          alt={conversation.dress_title || '商品画像'}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs font-medium text-gray-900 truncate max-w-32">
                        {conversation.dress_title}
                      </p>
                      {conversation.dress_price && (
                        <p className="text-xs text-[var(--primary-green)] font-semibold">
                          ¥{conversation.dress_price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* メッセージエリア */}
          <div className="flex-1 overflow-hidden">
            <div className="max-w-4xl mx-auto h-full flex flex-col">
              {/* メッセージ履歴 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isMyMessage = message.sender_id === user?.id
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="max-w-[70%]">
                        <div className="relative">
                          <div
                            className={`px-4 py-3 relative ${
                              isMyMessage
                                ? 'bg-green-100 text-gray-900 rounded-t-2xl rounded-bl-2xl rounded-br-md'
                                : 'bg-white border border-gray-200 text-gray-900 rounded-t-2xl rounded-br-2xl rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
                          
                          {/* 吹き出しの尻尾（三角形） */}
                          {isMyMessage ? (
                            <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[8px] border-l-green-100 border-b-[8px] border-b-transparent"></div>
                          ) : (
                            <div className="absolute bottom-0 left-0 w-0 h-0 border-r-[8px] border-r-white border-b-[8px] border-b-transparent"></div>
                          )}
                        </div>
                        <p className={`text-xs text-gray-500 mt-2 px-2 ${
                          isMyMessage ? 'text-right' : 'text-left'
                        }`}>
                          {formatMessageTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* メッセージ入力エリア */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="メッセージを入力..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] focus:border-transparent"
                      rows={3}
                      disabled={sending}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="self-end p-3 bg-[var(--primary-green)] text-white rounded-lg hover:bg-[var(--primary-green-dark)] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    </>
  )
}