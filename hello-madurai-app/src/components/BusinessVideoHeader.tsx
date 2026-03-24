'use client'

import { useState, useEffect } from 'react'
import VideoPlayerModal from '@/components/VideoPlayerModal'
import { PlayIcon } from '@heroicons/react/24/solid'

interface BusinessVideoHeaderProps {
  business: {
    id: string
    name: string
    address: string
    mainVideoUrl?: string
    videoType?: string
    mainImage?: string
  }
}

// Helper function to get YouTube ID from URL (including Shorts)
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  return null
}

// Helper function to get Instagram Reel ID from URL
function getInstagramReelId(url: string): string | null {
  const match = url.match(/instagram\.com\/reel\/([^/?#]+)/)
  return match ? match[1] : null
}

// Helper function to determine video type
function getVideoType(url: string, videoType?: string): 'YOUTUBE_VIDEO' | 'YOUTUBE_SHORTS' | 'INSTAGRAM_REEL' | null {
  if (videoType) {
    return videoType as 'YOUTUBE_VIDEO' | 'YOUTUBE_SHORTS' | 'INSTAGRAM_REEL'
  }

  if (url.includes('youtube.com/shorts') || url.includes('shorts/')) {
    return 'YOUTUBE_SHORTS'
  } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'YOUTUBE_VIDEO'
  } else if (url.includes('instagram.com/reel')) {
    return 'INSTAGRAM_REEL'
  }

  return null
}

export default function BusinessVideoHeader({ business }: BusinessVideoHeaderProps) {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)

  // Debug - log to both console and alert
  useEffect(() => {
    console.log('🎬 BusinessVideoHeader MOUNTED')
    console.log('Business data:', {
      name: business.name,
      hasVideo: !!business.mainVideoUrl,
      videoUrl: business.mainVideoUrl,
      videoType: business.videoType,
      hasImage: !!business.mainImage
    })
  }, [business])

  if (!business.mainVideoUrl) {
    // Show image if no video
    if (business.mainImage) {
      return (
        <div className="relative h-64">
          <img
            src={`/api/image/${business.mainImage}`}
            alt={business.name}
            className="w-full h-full object-cover"
          />
          {/* Overlay with business name and address */}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end pointer-events-none">
            <div className="p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
              <p className="text-lg opacity-90">{business.address}</p>
            </div>
          </div>
        </div>
      )
    }

    // No media at all
    return (
      <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="absolute inset-0 flex items-end">
          <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
            <p className="text-lg opacity-90">{business.address}</p>
          </div>
        </div>
      </div>
    )
  }

  const vType = getVideoType(business.mainVideoUrl, business.videoType)
  const videoId = getYouTubeId(business.mainVideoUrl)
  const reelId = getInstagramReelId(business.mainVideoUrl)

  console.log('Video details:', {
    vType,
    videoId,
    reelId
  })

  // Determine the modal video type
  let modalVideoType: 'youtube' | 'instagram' | 'upload' = 'youtube'
  if (vType === 'INSTAGRAM_REEL') {
    modalVideoType = 'instagram'
  }

  // Get thumbnail URL
  let thumbnailUrl = ''
  if (videoId) {
    thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }

  // Determine aspect ratio - use 16:9 for all YouTube videos for consistency
  const aspectRatio = vType === 'INSTAGRAM_REEL' ? '9/16' : '16/9'

  return (
    <>
      <div className="relative bg-black cursor-pointer group" onClick={() => setIsPlayerOpen(true)}>
        {/* Thumbnail */}
        {thumbnailUrl ? (
          <div className="relative w-full" style={{ aspectRatio }}>
            <img
              src={thumbnailUrl}
              alt={business.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Thumbnail failed to load, trying fallback')
                e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
              }}
            />
          </div>
        ) : vType === 'INSTAGRAM_REEL' ? (
          <div
            className="relative w-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500"
            style={{ aspectRatio }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <svg className="w-20 h-20 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                </svg>
                <p className="text-lg font-semibold">Instagram Reel</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full bg-gray-800" style={{ aspectRatio }}>
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <PlayIcon className="w-20 h-20 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold">Video</p>
              </div>
            </div>
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <PlayIcon className="w-10 h-10 text-white ml-1" />
          </div>
        </div>

        {/* Video Type Badge */}
        {vType && (
          <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
            {vType === 'YOUTUBE_SHORTS' && 'YouTube Shorts'}
            {vType === 'YOUTUBE_VIDEO' && 'YouTube Video'}
            {vType === 'INSTAGRAM_REEL' && 'Instagram Reel'}
          </div>
        )}

        {/* Overlay with business name and address */}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end pointer-events-none">
          <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
            <p className="text-lg opacity-90">{business.address}</p>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {business.mainVideoUrl && (
        <VideoPlayerModal
          isOpen={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
          videoUrl={business.mainVideoUrl}
          videoType={modalVideoType}
          title={business.name}
        />
      )}
    </>
  )
}

