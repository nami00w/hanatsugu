'use client'

import React from 'react'
import { MessageSquare, User, Clock, ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import AuthGuard from '@/components/AuthGuard'
import { useAuth } from '@/contexts/AuthContext'
import { useMessages, type Conversation } from '@/hooks/useMessages'


export default function MessagesPage() {
  const { user } = useAuth()
  const { conversations, loading, error } = useMessages()


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
    return conversation.other_user_name || 'ユーザー'
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
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">メッセージ</h1>
                  <p className="text-sm text-gray-600">お問い合わせとやり取り</p>
                </div>
                {conversations.filter(c => c.unread_count > 0).length > 0 && (
                  <span className="bg-red-500 text-white text-sm font-medium rounded-full w-6 h-6 flex items-center justify-center">
                    {conversations.reduce((total, c) => total + c.unread_count, 0)}
                  </span>
                )}
              </div>
            </div>

            {/* メッセージ一覧 */}
            <div className="bg-white rounded-lg shadow-sm mb-6">

              {/* メッセージ一覧 */}
              <div className="divide-y divide-gray-200">
                {error && (
                  <div className="text-center py-12">
                    <p className="text-red-500">{error}</p>
                  </div>
                )}
                {!error && conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      メッセージはありません
                    </p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
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