'use client'

import { useState } from 'react'

interface ShareData {
  title: string
  text: string
  url: string
}

export function useShareProduct() {
  const [isSharing, setIsSharing] = useState(false)

  const shareProduct = async (shareData: ShareData) => {
    setIsSharing(true)
    
    try {
      // Web Share API対応チェック（モバイル優先）
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
        })
        return { success: true, method: 'native' }
      }
      
      // Web Share API非対応またはPC：SNS選択モーダル表示
      return { success: false, method: 'fallback' }
      
    } catch (error) {
      console.error('Share failed:', error)
      return { success: false, method: 'fallback' }
    } finally {
      setIsSharing(false)
    }
  }

  const shareToLine = (shareData: ShareData) => {
    const message = `${shareData.text}\n${shareData.title}\n${shareData.url}`
    const encodedMessage = encodeURIComponent(message)
    const lineUrl = `https://line.me/R/msg/text/?${encodedMessage}`
    window.open(lineUrl, '_blank', 'noopener,noreferrer')
  }

  const shareToTwitter = (shareData: ShareData) => {
    const text = encodeURIComponent(`${shareData.text} - ${shareData.title}`)
    const url = encodeURIComponent(shareData.url)
    const twitterUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`
    window.open(twitterUrl, '_blank', 'noopener,noreferrer')
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      return true
    } catch (error) {
      console.error('Copy failed:', error)
      return false
    }
  }

  return {
    shareProduct,
    shareToLine,
    shareToTwitter,
    copyToClipboard,
    isSharing,
  }
}