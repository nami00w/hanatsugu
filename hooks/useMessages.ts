'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface Conversation {
  id: string
  dress_id?: string
  buyer_id: string
  seller_id: string
  status: string
  created_at: string
  updated_at: string
  last_message?: Message
  unread_count: number
  // Join data
  dress_title?: string
  dress_image?: string
  dress_price?: number
  other_user_name?: string
}

export function useMessages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 会話一覧を取得
  const fetchConversations = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // テーブルの存在確認
      const { data: tableCheck, error: tableError } = await supabase
        .from('conversations')
        .select('id')
        .limit(1)

      if (tableError) {
        console.error('Conversations table not found or accessible:', tableError)
        if (tableError.message.includes('relation "public.conversations" does not exist')) {
          setError('メッセージ機能を使用するには、データベースのセットアップが必要です。管理者にお問い合わせください。')
          setConversations([])
          return
        }
        throw tableError
      }

      // 会話一覧を取得（商品情報のみ、プロフィール情報は別途取得）
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          *,
          listings:dress_id (
            title,
            images,
            price
          )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })

      if (conversationsError) {
        console.error('Conversations query error:', conversationsError)
        throw conversationsError
      }

      // 各会話の最新メッセージ、未読数、プロフィール情報を取得
      const conversationsWithMessages = await Promise.all(
        (conversationsData || []).map(async (conversation) => {
          // 最新メッセージを取得
          const { data: latestMessage } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          // 未読数を取得（自分以外が送信した未読メッセージ）
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversation.id)
            .neq('sender_id', user.id)
            .eq('is_read', false)

          // 相手のプロフィール情報を取得
          const otherUserId = conversation.buyer_id === user.id ? conversation.seller_id : conversation.buyer_id
          const { data: otherUserProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', otherUserId)
            .maybeSingle()

          return {
            ...conversation,
            last_message: latestMessage,
            unread_count: unreadCount || 0,
            dress_title: conversation.listings?.title,
            dress_image: conversation.listings?.images?.[0],
            dress_price: conversation.listings?.price,
            other_user_name: otherUserProfile?.full_name || 'ユーザー'
          }
        })
      )

      setConversations(conversationsWithMessages)
    } catch (err) {
      console.error('Error fetching conversations:', err)
      console.error('Error details:', JSON.stringify(err, null, 2))
      setError(`会話の取得に失敗しました: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // 特定の会話のメッセージを取得
  const fetchMessages = async (conversationId: string): Promise<Message[]> => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Messages query error:', error)
        if (error.message.includes('relation "public.messages" does not exist')) {
          throw new Error('メッセージ機能を使用するには、データベースのセットアップが必要です。')
        }
        throw error
      }
      return data || []
    } catch (err) {
      console.error('Error fetching messages:', err)
      throw new Error(`メッセージの取得に失敗しました: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // メッセージを送信
  const sendMessage = async (conversationId: string, content: string): Promise<Message> => {
    if (!user) throw new Error('ログインが必要です')

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error sending message:', err)
      throw new Error('メッセージの送信に失敗しました')
    }
  }

  // 会話を作成または取得
  const createOrGetConversation = async (dressId: string, sellerId: string): Promise<string> => {
    if (!user) throw new Error('ログインが必要です')

    try {
      // 既存の会話を確認
      const { data: existingConversation, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('dress_id', dressId)
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
        .maybeSingle()

      if (fetchError) {
        console.error('Error fetching existing conversation:', fetchError)
        if (fetchError.message.includes('relation "public.conversations" does not exist')) {
          throw new Error('メッセージ機能を使用するには、データベースのセットアップが必要です。')
        }
      }

      if (existingConversation) {
        return existingConversation.id
      }

      // 新しい会話を作成
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          dress_id: dressId,
          buyer_id: user.id,
          seller_id: sellerId
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error creating conversation:', error)
        throw error
      }
      return newConversation.id
    } catch (err) {
      console.error('Error creating conversation:', err)
      throw new Error(`会話の作成に失敗しました: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // メッセージを既読にする
  const markMessagesAsRead = async (conversationId: string) => {
    if (!user) return

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false)
    } catch (err) {
      console.error('Error marking messages as read:', err)
    }
  }

  // 総未読数を取得
  const getTotalUnreadCount = () => {
    return conversations.reduce((total, conversation) => total + conversation.unread_count, 0)
  }

  useEffect(() => {
    fetchConversations()
  }, [user])

  return {
    conversations,
    loading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    createOrGetConversation,
    markMessagesAsRead,
    totalUnreadCount: getTotalUnreadCount()
  }
}