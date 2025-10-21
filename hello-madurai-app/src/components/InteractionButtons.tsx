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
  itemType: 'news' | 'video' | 'radio'
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
  const [localLikes, setLocalLikes] = useState(likes)
  const [localDislikes, setLocalDislikes] = useState(dislikes)
  const [localShares, setLocalShares] = useState(shares)
  const [isLoading, setIsLoading] = useState(false)

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
    
    if (isLoading) return // Prevent multiple clicks
    
    setIsLoading(true)
    
    // Optimistic update for instant UI response
    const newLiked = !isLiked
    const wasDisliked = isDisliked
    
    // Update UI immediately
    setIsLiked(newLiked)
    setLocalLikes(prev => newLiked ? prev + 1 : prev - 1)
    
    // If switching from dislike to like, update dislike UI too
    if (newLiked && wasDisliked) {
      setIsDisliked(false)
      setLocalDislikes(prev => prev - 1)
    }
    
    // Save to localStorage immediately
    const likeKey = `${itemType}_${itemId}_liked`
    const dislikeKey = `${itemType}_${itemId}_disliked`
    
    if (newLiked) {
      localStorage.setItem(likeKey, 'true')
      if (wasDisliked) {
        localStorage.removeItem(dislikeKey)
      }
    } else {
      localStorage.removeItem(likeKey)
    }
    
    try {
      const action = newLiked ? 'like' : 'unlike'
      
      // Single API call with shorter timeout for better UX
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
      
      const response = await fetch(`/api/${itemType}/${itemId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        // Update with server response
        setLocalLikes(data.likes)
        
        // Handle dislike removal if needed (async, don't wait)
        if (newLiked && wasDisliked) {
          fetch(`/api/${itemType}/${itemId}/dislike`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'undislike' })
          }).catch(error => console.warn('Failed to remove dislike:', error))
        }
        
        onLike?.()
      } else {
        // Revert optimistic update on failure
        setIsLiked(!newLiked)
        setLocalLikes(prev => newLiked ? prev - 1 : prev + 1)
        if (newLiked && wasDisliked) {
          setIsDisliked(true)
          setLocalDislikes(prev => prev + 1)
        }
        console.error('❌ Like failed:', response.status)
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!newLiked)
      setLocalLikes(prev => newLiked ? prev - 1 : prev + 1)
      if (newLiked && wasDisliked) {
        setIsDisliked(true)
        setLocalDislikes(prev => prev + 1)
      }
      console.error('❌ Error liking item:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDislike = async () => {
    if (isLoading) return // Prevent multiple clicks
    
    setIsLoading(true)
    
    // Optimistic update for instant UI response
    const newDisliked = !isDisliked
    const wasLiked = isLiked
    
    // Update UI immediately
    setIsDisliked(newDisliked)
    setLocalDislikes(prev => newDisliked ? prev + 1 : prev - 1)
    
    // If switching from like to dislike, update like UI too
    if (newDisliked && wasLiked) {
      setIsLiked(false)
      setLocalLikes(prev => prev - 1)
    }
    
    // Save to localStorage immediately
    const dislikeKey = `${itemType}_${itemId}_disliked`
    const likeKey = `${itemType}_${itemId}_liked`
    
    if (newDisliked) {
      localStorage.setItem(dislikeKey, 'true')
      if (wasLiked) {
        localStorage.removeItem(likeKey)
      }
    } else {
      localStorage.removeItem(dislikeKey)
    }
    
    try {
      const action = newDisliked ? 'dislike' : 'undislike'
      
      // Single API call with shorter timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
      
      const response = await fetch(`/api/${itemType}/${itemId}/dislike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        // Update with server response
        setLocalDislikes(data.dislikes)
        
        // Handle like removal if needed (async, don't wait)
        if (newDisliked && wasLiked) {
          fetch(`/api/${itemType}/${itemId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'unlike' })
          }).catch(error => console.warn('Failed to remove like:', error))
        }
        
        onDislike?.()
      } else {
        // Revert optimistic update on failure
        setIsDisliked(!newDisliked)
        setLocalDislikes(prev => newDisliked ? prev - 1 : prev + 1)
        if (newDisliked && wasLiked) {
          setIsLiked(true)
          setLocalLikes(prev => prev + 1)
        }
        console.error('❌ Dislike failed:', response.status)
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsDisliked(!newDisliked)
      setLocalDislikes(prev => newDisliked ? prev - 1 : prev + 1)
      if (newDisliked && wasLiked) {
        setIsLiked(true)
        setLocalLikes(prev => prev + 1)
      }
      console.error('❌ Error disliking item:', error)
    } finally {
      setIsLoading(false)
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
        disabled={isLoading}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
          isLoading 
            ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : isLiked 
              ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' 
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
        }`}
        aria-label={isLiked ? 'Unlike' : 'Like'}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        ) : isLiked ? (
          <HandThumbUpSolid className="h-4 w-4" />
        ) : (
          <HandThumbUpIcon className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">{localLikes}</span>
      </button>

      {/* Dislike Button (only for news) */}
      {itemType === 'news' && (
        <button
          onClick={handleDislike}
          disabled={isLoading}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            isLoading 
              ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : isDisliked 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          ) : isDisliked ? (
            <HandThumbDownSolid className="h-4 w-4" />
          ) : (
            <HandThumbDownIcon className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">{localDislikes}</span>
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

