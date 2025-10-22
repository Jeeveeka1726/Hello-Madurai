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

  return (
    <div className="w-full">
      {/* Clean, Responsive Video Container */}
      <div 
        className="relative w-full bg-black rounded-lg overflow-hidden" 
        style={{ 
          aspectRatio: '16/9',
          minHeight: '400px',
          maxHeight: '800px'
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
                }
              }
            }}
            onReady={() => {
              console.log('✅ News video ready:', title)
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
