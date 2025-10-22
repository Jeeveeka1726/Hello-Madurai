'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

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

  // Force video to be large on laptop screens
  useEffect(() => {
    const forceLargeVideo = () => {
      const videoContainer = document.querySelector('.video-container')
      if (videoContainer && window.innerWidth >= 1024) {
        // Force large size for laptop screens
        videoContainer.style.height = '90vh'
        videoContainer.style.minHeight = '800px'
        videoContainer.style.maxHeight = '1400px'
        console.log('🎥 FORCED LARGE VIDEO:', {
          height: videoContainer.style.height,
          minHeight: videoContainer.style.minHeight,
          maxHeight: videoContainer.style.maxHeight
        })
      }
    }

    // Run on mount and resize
    forceLargeVideo()
    window.addEventListener('resize', forceLargeVideo)
    
    return () => {
      window.removeEventListener('resize', forceLargeVideo)
    }
  }, [])

  return (
    <div className="w-full">
      {/* Clean, Responsive Video Container */}
      <style jsx>{`
        .video-container {
          width: 100% !important;
          height: 80vh !important;
          min-height: 600px !important;
          max-height: 1200px !important;
        }
        
        @media (min-width: 1024px) {
          .video-container {
            height: 90vh !important;
            min-height: 800px !important;
            max-height: 1400px !important;
          }
        }
        
        @media (min-width: 1200px) {
          .video-container {
            height: 95vh !important;
            min-height: 1000px !important;
            max-height: 1600px !important;
          }
        }
      `}</style>
      <div 
        className="video-container relative w-full bg-black rounded-lg overflow-hidden" 
        style={{ 
          aspectRatio: '16/9',
          minHeight: '600px',
          maxHeight: '1200px',
          height: '80vh'
        }}
      >
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
