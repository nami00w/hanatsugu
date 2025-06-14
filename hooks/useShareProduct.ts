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
      // 常にSNS選択モーダルを表示するように変更
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

  const shareViaWebAPI = async (shareData: ShareData) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
        })
        return true
      } else {
        // Web Share API非対応の場合、URLをコピー
        return await copyToClipboard(shareData.url)
      }
    } catch (error) {
      console.error('Share via Web API failed:', error)
      return false
    }
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
    shareViaWebAPI,
    copyToClipboard,
    isSharing,
  }
}