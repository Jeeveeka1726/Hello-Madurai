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

  const injectAds = () => {
    if (ads.length === 0) {
      setContentWithAds(content)
      return
    }

    // Parse HTML and find paragraphs
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
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
        <div class="ad-container my-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-blue-200 dark:border-blue-700">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">Advertisement</p>
          ${ad.htmlCode}
        </div>
      `
    } else if (ad.imageUrl) {
      // Image ad with optional link
      const img = `<img src="${ad.imageUrl}" alt="${ad.title}" class="w-full h-auto rounded-lg shadow-md" />`
      const clickHandler = ad.link ? `onclick="handleAdClick('${ad.id}', '${ad.link}')"` : ''
      
      return `
        <div class="ad-container my-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-blue-200 dark:border-blue-700">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">Advertisement</p>
          ${ad.link 
            ? `<a href="${ad.link}" target="_blank" rel="noopener noreferrer" ${clickHandler} class="block hover:opacity-90 transition-opacity">${img}</a>`
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
        .news-content ul {
          list-style-type: disc !important;
          padding-left: 2rem !important;
          margin: 0.75rem 0 !important;
          list-style-position: outside !important;
        }
        .news-content ol {
          list-style-type: decimal !important;
          padding-left: 2rem !important;
          margin: 0.75rem 0 !important;
          list-style-position: outside !important;
        }
        .news-content li {
          display: list-item !important;
          margin: 0.5rem 0 !important;
          color: #374151 !important;
        }
        .dark .news-content li {
          color: #F9FAFB !important;
        }
      `}} />
      <div 
        className="news-content prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: contentWithAds }}
        style={{
          fontSize: '1.1rem',
          lineHeight: '1.8'
        }}
      />
    </>
  )
}

