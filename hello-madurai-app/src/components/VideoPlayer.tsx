'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import '@/styles/video.css'

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

interface VideoPlayerProps {
  url: string
  title: string
}

export default function VideoPlayer({ url, title }: VideoPlayerProps) {
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    // Set video as loaded after component mounts
    const timer = setTimeout(() => {
      setVideoLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Force video to be large
  useEffect(() => {
    const forceLargeVideo = () => {
      const videoContainer = document.querySelector('.video-player-container')
      if (videoContainer) {
        // Force large size
        videoContainer.style.height = '700px'
        videoContainer.style.minHeight = '700px'
        videoContainer.style.maxHeight = '900px'
        videoContainer.style.width = '100%'
        
        console.log('🎥 FORCED LARGE VIDEO:', {
          height: videoContainer.style.height,
          width: videoContainer.style.width
        })
      }
    }

    // Run on mount and after video loads
    forceLargeVideo()
    setTimeout(forceLargeVideo, 500)
    setTimeout(forceLargeVideo, 1000)
    
    return () => {}
  }, [videoLoaded])

  return (
    <div className="w-full">
      {/* Simple, Large Video Container */}
      <div className="video-player-container">
        {videoLoaded ? (
          <ReactPlayer
            url={url}
            width="100%"
            height="100%"
            controls={true}
            playing={false}
            playsinline={true}
            light={false}
            pip={false}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
            config={{
              youtube: {
                playerVars: { 
                  rel: 0,
                  modestbranding: 1,
                  playsinline: 1,
                  controls: 1,
                  fs: 1,
                  cc_load_policy: 0,
                  iv_load_policy: 3,
                  autohide: 0,
                  autoplay: 0,
                  disablekb: 0,
                  enablejsapi: 1,
                  end: 0,
                  hl: 'en',
                  loop: 0,
                  origin: typeof window !== 'undefined' ? window.location.origin : '',
                  playlist: '',
                  start: 0
                }
              }
            }}
            onReady={() => {
              console.log('✅ News video ready:', title)
            }}
            onError={(error) => {
              console.error('❌ Video error:', error)
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Loading video...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}