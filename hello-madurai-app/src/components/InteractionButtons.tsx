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

interface InteractionButtonsProps {
  itemId: string
  itemType: 'news' | 'radio'
  title: string
  url: string
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
  likes = 0,
  dislikes = 0,
  comments = 0,
  shares = 0,
  onLike,
  onDislike,
  onComment,
  className = ''
}: InteractionButtonsProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [localLikes, setLocalLikes] = useState(Math.max(0, likes))
  const [localDislikes, setLocalDislikes] = useState(Math.max(0, dislikes))
  const [localShares, setLocalShares] = useState(Math.max(0, shares))
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false) // New state to prevent multiple clicks
  const [isLikeLoading, setIsLikeLoading] = useState(false) // Separate loading state for like
  const [isDislikeLoading, setIsDislikeLoading] = useState(false) // Separate loading state for dislike

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
    if (isProcessing || isLikeLoading) {
      console.log('🚫 Like action already in progress, ignoring click')
      return
    }
    
    setIsProcessing(true)
    setIsLikeLoading(true)
    
    try {
      const action = isLiked ? 'unlike' : 'like'
      console.log(`👍 Processing ${action} for ${itemType} ${itemId}`)
      
      // Make API call first
      const response = await fetch(`/api/${itemType}/${itemId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Update state with server response
        setIsLiked(!isLiked)
        setLocalLikes(Math.max(0, data.likes || 0))
        
        // Update localStorage
        const likeKey = `${itemType}_${itemId}_liked`
        if (!isLiked) {
          localStorage.setItem(likeKey, 'true')
        } else {
          localStorage.removeItem(likeKey)
        }
        
        // If switching from dislike to like, handle dislike removal
        if (!isLiked && isDisliked) {
          setIsDisliked(false)
          setLocalDislikes(prev => Math.max(0, prev - 1))
          
          // Remove dislike from localStorage
          const dislikeKey = `${itemType}_${itemId}_disliked`
          localStorage.removeItem(dislikeKey)
          
          // Call dislike API to remove dislike
          fetch(`/api/${itemType}/${itemId}/dislike`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'undislike' })
          }).catch(error => console.warn('Failed to remove dislike:', error))
        }
        
        onLike?.()
        console.log(`✅ ${action} successful: ${data.likes} likes`)
      } else {
        console.error('❌ Like API failed:', response.status)
      }
    } catch (error) {
      console.error('❌ Error in handleLike:', error)
    } finally {
      setIsLikeLoading(false)
      setIsProcessing(false)
    }
  }

  const handleDislike = async () => {
    // Prevent multiple simultaneous clicks
    if (isProcessing || isDislikeLoading) {
      console.log('🚫 Dislike action already in progress, ignoring click')
      return
    }
    
    setIsProcessing(true)
    setIsDislikeLoading(true)
    
    try {
      const action = isDisliked ? 'undislike' : 'dislike'
      console.log(`👎 Processing ${action} for ${itemType} ${itemId}`)
      
      // Make API call first
      const response = await fetch(`/api/${itemType}/${itemId}/dislike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Update state with server response
        setIsDisliked(!isDisliked)
        setLocalDislikes(Math.max(0, data.dislikes || 0))
        
        // Update localStorage
        const dislikeKey = `${itemType}_${itemId}_disliked`
        if (!isDisliked) {
          localStorage.setItem(dislikeKey, 'true')
        } else {
          localStorage.removeItem(dislikeKey)
        }
        
        // If switching from like to dislike, handle like removal
        if (!isDisliked && isLiked) {
          setIsLiked(false)
          setLocalLikes(prev => Math.max(0, prev - 1))
          
          // Remove like from localStorage
          const likeKey = `${itemType}_${itemId}_liked`
          localStorage.removeItem(likeKey)
          
          // Call like API to remove like
          fetch(`/api/${itemType}/${itemId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'unlike' })
          }).catch(error => console.warn('Failed to remove like:', error))
        }
        
        onDislike?.()
        console.log(`✅ ${action} successful: ${data.dislikes} dislikes`)
      } else {
        console.error('❌ Dislike API failed:', response.status)
      }
    } catch (error) {
      console.error('❌ Error in handleDislike:', error)
    } finally {
      setIsDislikeLoading(false)
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

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Like Button */}
      <button
        type="button"
        onClick={(e) => handleLike(e)}
        disabled={isLikeLoading || isProcessing}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
          (isLikeLoading || isProcessing)
            ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : isLiked 
              ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800' 
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
        }`}
        aria-label={isLiked ? 'Unlike' : 'Like'}
      >
        {(isLikeLoading || isProcessing) ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        ) : isLiked ? (
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
          disabled={isDislikeLoading || isProcessing}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            (isDislikeLoading || isProcessing)
              ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : isDisliked 
                ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800' 
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
          }`}
        >
          {(isDislikeLoading || isProcessing) ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          ) : isDisliked ? (
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
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
        >
          <ShareIcon className="h-4 w-4" />
          <span className="text-sm font-medium">{localShares}</span>
        </button>

        {/* Share Menu */}
        {showShareMenu && (
          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border p-3 z-10 min-w-[200px]">
            <div className="flex gap-2">
              <FacebookShareButton
                url={url}
                quote={title}
                onShareWindowClose={() => handleShare('facebook')}
              >
                <FacebookIcon size={32} round />
              </FacebookShareButton>

              <TwitterShareButton
                url={url}
                title={title}
                onShareWindowClose={() => handleShare('twitter')}
              >
                <TwitterIcon size={32} round />
              </TwitterShareButton>

              <WhatsappShareButton
                url={url}
                title={title}
                onShareWindowClose={() => handleShare('whatsapp')}
              >
                <WhatsappIcon size={32} round />
              </WhatsappShareButton>

              <TelegramShareButton
                url={url}
                title={title}
                onShareWindowClose={() => handleShare('telegram')}
              >
                <TelegramIcon size={32} round />
              </TelegramShareButton>
            </div>
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(url)
                handleShare('copy')
                setShowShareMenu(false)
              }}
              className="w-full mt-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              Copy Link
            </button>
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

