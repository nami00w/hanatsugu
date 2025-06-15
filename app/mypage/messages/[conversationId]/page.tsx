'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Send, Package, User } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import AuthGuard from '@/components/AuthGuard'
import { useAuth } from '@/contexts/AuthContext'
import { useMessages, type Message, type Conversation } from '@/hooks/useMessages'
import { supabase } from '@/lib/supabase'


export default function MessageDetailPage() {
  const { conversationId } = useParams()
  const { user } = useAuth()
  const { fetchMessages, sendMessage, markMessagesAsRead, conversations } = useMessages()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [textareaRows, setTextareaRows] = useState(3)
  const messagesEndRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    const loadConversationAndMessages = async () => {
      if (!conversationId || !user) return
      
      try {
        setLoading(true)
        
        // 会話情報を直接Supabaseから取得
        const { data: conversationData, error: convError } = await supabase
          .from('conversations')
          .select(`
            *,
            listings:dress_id (
              title,
              images,
              price
            )
          `)
          .eq('id', conversationId)
          .single()

        if (convError) {
          console.error('Conversation not found:', convError)
          setConversation(null)
          setLoading(false)
          return
        }

        if (conversationData) {
          // 相手のプロフィール情報を取得
          const otherUserId = conversationData.buyer_id === user.id ? conversationData.seller_id : conversationData.buyer_id
          
          // profilesテーブルとauth.usersテーブル両方から取得を試す
          let otherUserName = 'ユーザー'
          
          try {
            // まずprofilesテーブルから取得
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', otherUserId)
              .maybeSingle()
            
            if (profileData?.full_name) {
              otherUserName = profileData.full_name
            } else {
              // profilesテーブルにない場合は、auth.usersのuser_metadataから取得
              const { data: { user: otherUser } } = await supabase.auth.admin.getUserById(otherUserId)
              if (otherUser?.user_metadata?.display_name) {
                otherUserName = otherUser.user_metadata.display_name
              } else if (otherUser?.email) {
                // display_nameがない場合はemailの@より前を使用
                otherUserName = otherUser.email.split('@')[0]
              }
            }
          } catch (error) {
            console.warn('Failed to fetch other user name:', error)
            // エラー時は匿名表示
            otherUserName = `ユーザー${otherUserId.slice(-4)}`
          }

          const conversationWithDetails = {
            ...conversationData,
            dress_title: conversationData.listings?.title,
            dress_image: conversationData.listings?.images?.[0],
            dress_price: conversationData.listings?.price,
            other_user_name: otherUserName,
            last_message: null,
            unread_count: 0
          }

          setConversation(conversationWithDetails)
        }
        
        // メッセージを取得
        const messagesData = await fetchMessages(conversationId as string)
        setMessages(messagesData)
        
        // メッセージを既読にする
        await markMessagesAsRead(conversationId as string)
      } catch (error) {
        console.error('Failed to load conversation:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadConversationAndMessages()
  }, [conversationId, user?.id]) // 依存関係を最小限に

  useEffect(() => {
    // メッセージが更新されたらスクロールを最下部に移動
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // 初回表示時に最下部へスクロール（入力欄が見えるように）
    if (!loading && conversation) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100) // 短いディレイでレンダリング完了を待つ
    }
  }, [loading, conversation])

  useEffect(() => {
    // 画面サイズに応じてtextareaの行数を調整
    const updateTextareaRows = () => {
      setTextareaRows(window.innerWidth < 768 ? 2 : 3)
    }
    
    updateTextareaRows()
    window.addEventListener('resize', updateTextareaRows)
    return () => window.removeEventListener('resize', updateTextareaRows)
  }, [])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !user || !conversationId) return

    setSending(true)
    
    try {
      // メッセージを送信
      const message = await sendMessage(conversationId as string, newMessage.trim())
      
      // メッセージ一覧を更新
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
    return conversation?.other_user_name || 'ユーザー'
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
        <div className="h-screen bg-gray-50 flex flex-col">
          {/* ヘッダー */}
          <div className="bg-white border-b border-gray-200 px-4 py-4 flex-shrink-0">
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
          <div className="flex-1 flex flex-col min-h-0">
            <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
              {/* メッセージ履歴 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
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

              {/* メッセージ入力エリア - 固定位置 */}
              <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0" 
                   style={{ paddingBottom: `calc(1rem + env(safe-area-inset-bottom))` }}>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="メッセージを入力..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] focus:border-transparent text-base"
                      rows={textareaRows}
                      disabled={sending}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="self-end p-3 bg-[var(--primary-green)] text-white rounded-lg hover:bg-[var(--primary-green-dark)] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed min-w-[48px] min-h-[48px] flex items-center justify-center"
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