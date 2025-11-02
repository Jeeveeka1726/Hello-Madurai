'use client'

import { useState, useEffect } from 'react'
import { 
  HandThumbUpIcon, 
  HandThumbDownIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import {
  HandThumbUpIcon as HandThumbUpSolid,
  HandThumbDownIcon as HandThumbDownSolid,
  HeartIcon as HeartSolid
} from '@heroicons/react/24/solid'
import { 
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon
} from 'react-share'
import { useLanguage } from '@/contexts/LanguageContext'

interface InteractionButtonsProps {
  itemId: string
  itemType: 'news' | 'radio'
  title: string
  url: string
  imageUrl?: string  // Featured image URL for sharing
  likes?: number
  dislikes?: number
  comments?: number
  shares?: number
  onLike?: () => void
  onDislike?: () => void
  onComment?: () => void
  className?: string
}

export default function InteractionButtons({
  itemId,
  itemType,
  title,
  url,
  imageUrl,
  likes = 0,
  dislikes = 0,
  comments = 0,
  shares = 0,
  onLike,
  onDislike,
  onComment,
  className = ''
}: InteractionButtonsProps) {
  const { language, t } = useLanguage()
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [localLikes, setLocalLikes] = useState(Math.max(0, likes))
  const [localDislikes, setLocalDislikes] = useState(Math.max(0, dislikes))
  const [localShares, setLocalShares] = useState(Math.max(0, shares))
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false) // New state to prevent multiple clicks

  // Check localStorage on mount to see if user has already liked/disliked
  useEffect(() => {
    const likeKey = `${itemType}_${itemId}_liked`
    const dislikeKey = `${itemType}_${itemId}_disliked`
    
    const hasLiked = localStorage.getItem(likeKey) === 'true'
    const hasDisliked = localStorage.getItem(dislikeKey) === 'true'
    
    setIsLiked(hasLiked)
    setIsDisliked(hasDisliked)
  }, [itemId, itemType])

  const handleLike = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    // Prevent multiple simultaneous clicks
    if (isProcessing) {
      return
    }
    
    setIsProcessing(true)
    
    // Immediate UI update for better UX
    const newLikedState = !isLiked
    setIsLiked(newLikedState)
    setLocalLikes(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1))
    
    // Update localStorage immediately
    const likeKey = `${itemType}_${itemId}_liked`
    if (newLikedState) {
      localStorage.setItem(likeKey, 'true')
    } else {
      localStorage.removeItem(likeKey)
    }
    
    // Handle dislike removal if switching from dislike to like
    if (newLikedState && isDisliked) {
      setIsDisliked(false)
      setLocalDislikes(prev => Math.max(0, prev - 1))
      const dislikeKey = `${itemType}_${itemId}_disliked`
      localStorage.removeItem(dislikeKey)
    }
    
    try {
      const action = newLikedState ? 'like' : 'unlike'
      
      // Make API call in background (no loading state needed)
      const response = await fetch(`/api/${itemType}/${itemId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })
      
      if (response.ok) {
        const data = await response.json()
        // Update with server response
        setLocalLikes(Math.max(0, data.likes || 0))
        
        // Handle dislike removal API call
        if (newLikedState && isDisliked) {
          fetch(`/api/${itemType}/${itemId}/dislike`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'undislike' })
          }).catch(error => console.warn('Failed to remove dislike:', error))
        }
        
        onLike?.()
      } else {
        // Revert on error
        setIsLiked(!newLikedState)
        setLocalLikes(prev => newLikedState ? Math.max(0, prev - 1) : prev + 1)
        if (newLikedState) {
          localStorage.removeItem(likeKey)
        } else {
          localStorage.setItem(likeKey, 'true')
        }
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newLikedState)
      setLocalLikes(prev => newLikedState ? Math.max(0, prev - 1) : prev + 1)
      if (newLikedState) {
        localStorage.removeItem(likeKey)
      } else {
        localStorage.setItem(likeKey, 'true')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDislike = async () => {
    // Prevent multiple simultaneous clicks
    if (isProcessing) {
      return
    }
    
    setIsProcessing(true)
    
    // Immediate UI update for better UX
    const newDislikedState = !isDisliked
    setIsDisliked(newDislikedState)
    setLocalDislikes(prev => newDislikedState ? prev + 1 : Math.max(0, prev - 1))
    
    // Update localStorage immediately
    const dislikeKey = `${itemType}_${itemId}_disliked`
    if (newDislikedState) {
      localStorage.setItem(dislikeKey, 'true')
    } else {
      localStorage.removeItem(dislikeKey)
    }
    
    // Handle like removal if switching from like to dislike
    if (newDislikedState && isLiked) {
      setIsLiked(false)
      setLocalLikes(prev => Math.max(0, prev - 1))
      const likeKey = `${itemType}_${itemId}_liked`
      localStorage.removeItem(likeKey)
    }
    
    try {
      const action = newDislikedState ? 'dislike' : 'undislike'
      
      // Make API call in background (no loading state needed)
      const response = await fetch(`/api/${itemType}/${itemId}/dislike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })
      
      if (response.ok) {
        const data = await response.json()
        // Update with server response
        setLocalDislikes(Math.max(0, data.dislikes || 0))
        
        // Handle like removal API call
        if (newDislikedState && isLiked) {
          fetch(`/api/${itemType}/${itemId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'unlike' })
          }).catch(error => console.warn('Failed to remove like:', error))
        }
        
        onDislike?.()
      } else {
        // Revert on error
        setIsDisliked(!newDislikedState)
        setLocalDislikes(prev => newDislikedState ? Math.max(0, prev - 1) : prev + 1)
        if (newDislikedState) {
          localStorage.removeItem(dislikeKey)
        } else {
          localStorage.setItem(dislikeKey, 'true')
        }
      }
    } catch (error) {
      // Revert on error
      setIsDisliked(!newDislikedState)
      setLocalDislikes(prev => newDislikedState ? Math.max(0, prev - 1) : prev + 1)
      if (newDislikedState) {
        localStorage.removeItem(dislikeKey)
      } else {
        localStorage.setItem(dislikeKey, 'true')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleShare = async (platform: string) => {
    try {
      await fetch(`/api/${itemType}/${itemId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ platform })
      })
      
      setLocalShares(prev => prev + 1)
      setShowShareMenu(false)
    } catch (error) {
      console.error('Error recording share:', error)
    }
  }

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      
      // Show success message
      const button = document.getElementById(`share-btn-${itemId}`)
      if (button) {
        const originalText = button.innerHTML
        const copiedText = language === 'ta' ? '✅ நகலெடுக்கப்பட்டது!' : '✅ Copied!'
        button.innerHTML = copiedText
        setTimeout(() => {
          button.innerHTML = originalText
        }, 2000)
      }
      
      // Track the share
      await fetch(`/api/${itemType}/${itemId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ platform: 'copy-link' })
      })
      
      setLocalShares(prev => prev + 1)
      setShowShareMenu(false)
    } catch (error) {
      console.error('Error copying link:', error)
    }
  }

  // Native share with image support
  const handleNativeShare = async () => {
    try {
      // Check if Web Share API is supported
      if (!navigator.share) {
        // Fallback to showing share menu
        setShowShareMenu(!showShareMenu)
        return
      }

      const shareData: any = {
        title: title,
        text: title,
        url: url,
      }

      // Try to fetch and share image if available (works for WhatsApp, Telegram, etc.)
      if (imageUrl) {
        try {
          // Convert image URL to absolute URL if needed
          const absoluteImageUrl = imageUrl.startsWith('http') 
            ? imageUrl 
            : `${window.location.origin}${imageUrl}`

          // Fetch the image
          const response = await fetch(absoluteImageUrl)
          const blob = await response.blob()
          const file = new File([blob], 'news-image.jpg', { type: blob.type })

          // Check if files can be shared
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            shareData.files = [file]
          }
        } catch (imgError) {
          console.log('Could not fetch image for sharing:', imgError)
          // Continue without image (Facebook/Twitter will use Open Graph meta tags)
        }
      }

      // Share
      await navigator.share(shareData)
      
      // Track the share
      await fetch(`/api/${itemType}/${itemId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ platform: 'native' })
      })
      
      setLocalShares(prev => prev + 1)
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error)
        // Fallback to showing share menu
        setShowShareMenu(!showShareMenu)
      }
    }
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Like Button */}
      <button
        type="button"
        onClick={(e) => handleLike(e)}
        disabled={isProcessing}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
          isProcessing
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : isLiked
              ? 'bg-green-100 text-green-600 hover:bg-green-200'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        }`}
        aria-label={isLiked ? 'Unlike' : 'Like'}
      >
        {isLiked ? (
          <HandThumbUpSolid className="h-4 w-4" />
        ) : (
          <HandThumbUpIcon className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">{Math.max(0, localLikes)}</span>
      </button>

      {/* Dislike Button (only for news) */}
      {itemType === 'news' && (
        <button
          onClick={handleDislike}
          disabled={isProcessing}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            isProcessing
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isDisliked
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
        >
          {isDisliked ? (
            <HandThumbDownSolid className="h-4 w-4" />
          ) : (
            <HandThumbDownIcon className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">{Math.max(0, localDislikes)}</span>
        </button>
      )}

      {/* Share Button */}
      <div className="relative">
        <button
          id={`share-btn-${itemId}`}
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
        >
          <ShareIcon className="h-4 w-4" />
          <span className="text-sm font-medium">{localShares}</span>
        </button>

        {/* Share Menu with Facebook & WhatsApp prominently */}
        {showShareMenu && (
          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10 min-w-[280px]">
            {/* Main Share Options - Facebook & WhatsApp */}
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                {t('share.shareTo', 'Share to:', 'இதில் பகிரவும்:')}
              </p>
              <div className="flex gap-3 justify-center">
                {/* WhatsApp - Opens directly in WhatsApp */}
                <button
                  onClick={() => {
                    // WhatsApp share - opens WhatsApp directly with title and URL
                    // WhatsApp will fetch the link preview and show thumbnail automatically
                    const text = encodeURIComponent(`${title}\n\n${url}`)
                    const whatsappUrl = `https://wa.me/?text=${text}`
                    console.log('WhatsApp sharing:', title, url)
                    window.open(whatsappUrl, '_blank')
                    handleShare('whatsapp')
                    setShowShareMenu(false)
                  }}
                  className="transform hover:scale-110 transition-transform cursor-pointer"
                >
                  <div className="flex flex-col items-center gap-1">
                    <WhatsappIcon size={48} round />
                    <span className="text-xs text-gray-600">WhatsApp</span>
                  </div>
                </button>

                {/* Facebook - Large Button (uses Open Graph) */}
                <FacebookShareButton
                  url={url}
                  quote={title}
                  onClick={() => handleShare('facebook')}
                  className="transform hover:scale-110 transition-transform"
                >
                  <div className="flex flex-col items-center gap-1">
                    <FacebookIcon size={48} round />
                    <span className="text-xs text-gray-600">Facebook</span>
                  </div>
                </FacebookShareButton>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-3"></div>

            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              className="w-full px-4 py-2 mb-2 text-left text-sm font-medium text-gray-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {t('share.copyLink', 'Copy Link', 'இணைப்பை நகலெடுக்கவும்')}
            </button>
            
            {/* Other Share Options */}
            <p className="text-xs text-gray-500 mb-2 px-1">
              {t('share.moreOptions', 'More options:', 'மேலும் விருப்பங்கள்:')}
            </p>
            <div className="flex gap-2 justify-center">
              <TwitterShareButton
                url={url}
                title={title}
                onClick={() => handleShare('twitter')}
              >
                <TwitterIcon size={32} round />
              </TwitterShareButton>

              <TelegramShareButton
                url={url}
                title={title}
                onClick={() => handleShare('telegram')}
              >
                <TelegramIcon size={32} round />
              </TelegramShareButton>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  )
}

