'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, User, Clock, ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import AuthGuard from '@/components/AuthGuard'
import { useAuth } from '@/contexts/AuthContext'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_name: string
  receiver_id: string
  receiver_name: string
  content: string
  created_at: string
  is_read: boolean
  dress_id?: string
  dress_title?: string
  dress_image?: string
}

interface Conversation {
  id: string
  participants: string[]
  participant_names: string[]
  last_message: Message
  unread_count: number
  dress_id?: string
  dress_title?: string
  dress_image?: string
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  // ダミーデータ（実際の実装ではSupabaseから取得）
  const dummyConversations: Conversation[] = [
    {
      id: '1',
      participants: ['user1', 'user2'],
      participant_names: ['田中 美咲', '佐藤 花子'],
      last_message: {
        id: 'msg1',
        conversation_id: '1',
        sender_id: 'user2',
        sender_name: '田中 美咲',
        receiver_id: 'user1',
        receiver_name: '佐藤 花子',
        content: 'VERA WANGのドレスについてお聞きしたいことがあります。サイズ調整は可能でしょうか？',
        created_at: '2024-01-15T10:30:00Z',
        is_read: false
      },
      unread_count: 2,
      dress_id: '1',
      dress_title: 'VERA WANG Liesel エレガントドレス',
      dress_image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=80&h=80&fit=crop'
    },
    {
      id: '2',
      participants: ['user1', 'user3'],
      participant_names: ['山田 麗子', '鈴木 愛美'],
      last_message: {
        id: 'msg2',
        conversation_id: '2',
        sender_id: 'user1',
        sender_name: '山田 麗子',
        receiver_id: 'user3',
        receiver_name: '鈴木 愛美',
        content: 'ありがとうございます。検討いたします。',
        created_at: '2024-01-14T15:45:00Z',
        is_read: true
      },
      unread_count: 0,
      dress_id: '3',
      dress_title: 'ANTONIO RIVA Gemma クラシックドレス',
      dress_image: 'https://images.unsplash.com/photo-1522653216850-4f1415a174fb?w=80&h=80&fit=crop'
    },
    {
      id: '3',
      participants: ['user1', 'user4'],
      participant_names: ['高橋 真美', '佐々木 恵'],
      last_message: {
        id: 'msg3',
        conversation_id: '3',
        sender_id: 'user4',
        sender_name: '高橋 真美',
        receiver_id: 'user1',
        receiver_name: '佐々木 恵',
        content: 'こんにちは。こちらのドレスはまだ販売中でしょうか？',
        created_at: '2024-01-13T09:20:00Z',
        is_read: false
      },
      unread_count: 1,
      dress_id: '5',
      dress_title: 'JENNY PACKHAM Hermione グラマラスドレス',
      dress_image: 'https://images.unsplash.com/photo-1522621032211-ac0031dfbddc?w=80&h=80&fit=crop'
    }
  ]

  useEffect(() => {
    // TODO: 実際の実装ではSupabaseからメッセージを取得
    setConversations(dummyConversations)
    setLoading(false)
  }, [user])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}分前`
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)}時間前`
    } else {
      return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
    }
  }

  const getOtherParticipantName = (conversation: Conversation) => {
    // TODO: 実際の実装では現在のユーザー以外の参加者名を返す
    return conversation.participant_names[0]
  }

  const filteredConversations = conversations.filter(conversation => {
    if (activeTab === 'received') {
      // 受信メッセージ：最後のメッセージが自分以外から送信されたもの
      return conversation.last_message.sender_id !== user?.id
    } else {
      // 送信メッセージ：最後のメッセージが自分から送信されたもの  
      return conversation.last_message.sender_id === user?.id
    }
  })

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

  return (
    <>
      <Header />
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* ヘッダー */}
            <div className="flex items-center gap-4 mb-6">
              <Link 
                href="/mypage"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">メッセージ</h1>
                <p className="text-sm text-gray-600">お問い合わせとやり取り</p>
              </div>
            </div>

            {/* タブナビゲーション */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('received')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'received'
                      ? 'text-[var(--primary-green)] border-b-2 border-[var(--primary-green)]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  受信メッセージ
                  {conversations.filter(c => c.last_message.sender_id !== user?.id && c.unread_count > 0).length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                      {conversations.filter(c => c.last_message.sender_id !== user?.id && c.unread_count > 0).length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('sent')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'sent'
                      ? 'text-[var(--primary-green)] border-b-2 border-[var(--primary-green)]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  送信メッセージ
                </button>
              </div>

              {/* メッセージ一覧 */}
              <div className="divide-y divide-gray-200">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {activeTab === 'received' ? '受信したメッセージはありません' : '送信したメッセージはありません'}
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <Link
                      key={conversation.id}
                      href={`/mypage/messages/${conversation.id}`}
                      className="block p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* 商品画像 */}
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {conversation.dress_image ? (
                            <Image
                              src={conversation.dress_image}
                              alt={conversation.dress_title || '商品画像'}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* メッセージ内容 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900 truncate">
                                {getOtherParticipantName(conversation)}
                              </h3>
                              {conversation.unread_count > 0 && (
                                <span className="bg-red-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                                  {conversation.unread_count}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatDate(conversation.last_message.created_at)}
                            </span>
                          </div>
                          
                          {conversation.dress_title && (
                            <p className="text-sm text-gray-600 mb-1 truncate">
                              商品: {conversation.dress_title}
                            </p>
                          )}
                          
                          <p className={`text-sm truncate ${
                            conversation.unread_count > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
                          }`}>
                            {conversation.last_message.content}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    </>
  )
}