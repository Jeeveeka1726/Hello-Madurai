'use client'

import { useEffect, useState } from 'react'

interface Ad {
  id: string
  title: string
  imageUrl?: string
  htmlCode?: string
  link?: string
}

interface ContentWithAdsProps {
  content: string
  newsId: string
}

export default function ContentWithAds({ content, newsId }: ContentWithAdsProps) {
  const [ads, setAds] = useState<Ad[]>([])
  const [contentWithAds, setContentWithAds] = useState<string>('')

  useEffect(() => {
    fetchAds()
  }, [])

  useEffect(() => {
    if (ads.length > 0) {
      injectAds()
    } else {
      setContentWithAds(content)
    }
  }, [ads, content])

  const fetchAds = async () => {
    try {
      const response = await fetch('/api/ads/active?category=news')
      if (response.ok) {
        const data = await response.json()
        setAds(data)
        
        // Track impressions for each ad
        data.forEach((ad: Ad) => {
          fetch(`/api/ads/${ad.id}/impression`, { method: 'POST' }).catch(() => {})
        })
      }
    } catch (error) {
      console.error('Error fetching ads:', error)
    }
  }

  const validateImageSrc = (src: string): string => {
    // Check if it's a valid base64 image
    if (src.startsWith('data:image/')) {
      try {
        // Basic validation for base64 data URL
        const base64Match = src.match(/^data:image\/([a-zA-Z]*);base64,(.*)$/)
        if (base64Match && base64Match[2]) {
          // Check if base64 string is valid
          const base64String = base64Match[2]
          if (base64String.length > 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(base64String)) {
            return src
          }
        }
      } catch (error) {
        console.warn('Invalid base64 image URL:', src.substring(0, 50) + '...')
      }
      // Return a placeholder for invalid base64 images
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIFVuYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='
    }
    return src
  }

  const injectAds = () => {
    if (ads.length === 0) {
      setContentWithAds(content)
      return
    }

    // Parse HTML and find paragraphs
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    
    // Fix any invalid image sources
    const images = doc.querySelectorAll('img')
    images.forEach((img) => {
      const originalSrc = img.getAttribute('src')
      if (originalSrc) {
        const validatedSrc = validateImageSrc(originalSrc)
        if (validatedSrc !== originalSrc) {
          img.setAttribute('src', validatedSrc)
        }
      }
    })
    
    const paragraphs = Array.from(doc.querySelectorAll('p, div'))

    let adIndex = 0
    let paragraphCount = 0

    paragraphs.forEach((paragraph, index) => {
      // Insert ad after every 2-3 paragraphs
      if (paragraph.textContent && paragraph.textContent.trim().length > 50) {
        paragraphCount++
        
        // Insert ad after 2nd, 5th, 8th paragraph, etc. (every 3 paragraphs)
        if (paragraphCount % 3 === 0 && adIndex < ads.length) {
          const ad = ads[adIndex]
          const adElement = createAdElement(ad)
          paragraph.insertAdjacentHTML('afterend', adElement)
          adIndex = (adIndex + 1) % ads.length // Cycle through ads
        }
      }
    })

    setContentWithAds(doc.body.innerHTML)
  }

  const createAdElement = (ad: Ad): string => {
    if (ad.htmlCode) {
      // HTML/AdSense code
      return `
        <div class="ad-container my-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg border-2 border-blue-300 dark:border-blue-600 shadow-lg">
          <p class="text-xs text-blue-600 dark:text-blue-400 mb-3 text-center font-semibold">📢 Advertisement</p>
          ${ad.htmlCode}
        </div>
      `
    } else if (ad.imageUrl) {
      // Image ad with optional link
      const img = `<img src="${ad.imageUrl}" alt="${ad.title}" class="ad-image w-full h-auto rounded-lg shadow-md" />`
      const clickHandler = ad.link ? `onclick="handleAdClick('${ad.id}', '${ad.link}')"` : ''
      
      return `
        <div class="ad-container my-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg border-2 border-blue-300 dark:border-blue-600 shadow-lg">
          <p class="text-xs text-blue-600 dark:text-blue-400 mb-3 text-center font-semibold">📢 Advertisement</p>
          ${ad.link 
            ? `<a href="${ad.link}" target="_blank" rel="noopener noreferrer" ${clickHandler} class="block hover:opacity-90 transition-opacity cursor-pointer">${img}</a>`
            : img
          }
        </div>
      `
    }
    return ''
  }

  // Track ad clicks
  useEffect(() => {
    // Add global click handler
    (window as any).handleAdClick = async (adId: string, link: string) => {
      try {
        await fetch(`/api/ads/${adId}/click`, { method: 'POST' })
      } catch (error) {
        console.error('Error tracking click:', error)
      }
    }

    return () => {
      delete (window as any).handleAdClick
    }
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .news-content {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        .news-content ul {
          list-style-type: disc !important;
          padding-left: 1.5rem !important;
          margin: 0.75rem 0 !important;
          list-style-position: outside !important;
        }
        @media (min-width: 640px) {
          .news-content ul {
            padding-left: 2rem !important;
          }
        }
        .news-content ol {
          list-style-type: decimal !important;
          padding-left: 1.5rem !important;
          margin: 0.75rem 0 !important;
          list-style-position: outside !important;
        }
        @media (min-width: 640px) {
          .news-content ol {
            padding-left: 2rem !important;
          }
        }
        .news-content li {
          display: list-item !important;
          margin: 0.5rem 0 !important;
          color: #374151 !important;
          word-wrap: break-word !important;
        }
        .dark .news-content li {
          color: #F9FAFB !important;
        }
        .news-content p {
          margin: 0.75rem 0 !important;
          line-height: 1.7 !important;
        }
        .news-content h1, .news-content h2, .news-content h3, .news-content h4, .news-content h5, .news-content h6 {
          margin: 1rem 0 0.5rem 0 !important;
          line-height: 1.3 !important;
        }
        .news-content img {
          max-width: 100% !important;
          height: auto !important;
          margin: 1rem auto !important;
          display: block !important;
        }
        .news-content img[src^="data:image/"] {
          max-width: 100% !important;
          height: auto !important;
          object-fit: contain !important;
        }
        .news-content img[src*="base64"] {
          max-width: 100% !important;
          height: auto !important;
          object-fit: contain !important;
        }
        .news-content iframe {
          width: 100% !important;
          aspect-ratio: 16 / 9 !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          margin: 1.5rem auto !important;
          display: block !important;
        }
        @media (min-width: 1024px) {
          .news-content iframe {
            width: 1280px !important;
            height: 720px !important;
            max-width: 100% !important;
            margin: 2rem auto !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .news-content iframe {
            height: 500px !important;
          }
        }
        @media (max-width: 767px) {
          .news-content iframe {
            height: 250px !important;
            margin: 1rem auto !important;
          }
        }
        .news-content blockquote {
          margin: 1rem 0 !important;
          padding: 0.75rem 1rem !important;
          border-left: 4px solid #3B82F6 !important;
          background-color: #F8FAFC !important;
          border-radius: 0 0.5rem 0.5rem 0 !important;
        }
        .dark .news-content blockquote {
          background-color: #1E293B !important;
          border-left-color: #93C5FD !important;
        }
      `}} />
      <div 
        className="news-content prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: contentWithAds }}
        style={{
          fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
          lineHeight: '1.7'
        }}
      />
    </>
  )
}

