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

  // Fix YouTube iframes to use youtube-nocookie.com domain and ensure proper sizing
  useEffect(() => {
    if (contentWithAds) {
      setTimeout(() => {
        const iframes = document.querySelectorAll('.news-content iframe')
        iframes.forEach((iframe) => {
          const src = iframe.getAttribute('src')

          // Fix YouTube domain
          if (src && src.includes('youtube.com') && !src.includes('youtube-nocookie.com')) {
            const newSrc = src.replace('youtube.com', 'youtube-nocookie.com')
            iframe.setAttribute('src', newSrc)
          }

          // Remove inline width/height attributes - let CSS handle sizing
          if (src && (src.includes('youtube') || src.includes('instagram'))) {
            iframe.removeAttribute('width')
            iframe.removeAttribute('height')
            iframe.removeAttribute('style')
          }
        })
      }, 100)
    }
  }, [contentWithAds])

  const fetchAds = async () => {
    try {
      console.log('📢 Fetching ads for news article...')
      const response = await fetch('/api/ads/active?category=news')
      console.log('📢 Ads API response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('📢 Fetched ads:', data.length, 'ads found')
        console.log('📢 Ads data:', data)
        setAds(data)

        // Track impressions for each ad
        data.forEach((ad: Ad) => {
          fetch(`/api/ads/${ad.id}/impression`, { method: 'POST' }).catch(() => {})
        })
      } else {
        console.error('📢 Failed to fetch ads, status:', response.status)
      }
    } catch (error) {
      console.error('📢 Error fetching ads:', error)
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
    console.log('📢 Injecting ads into content...')
    console.log('📢 Number of ads to inject:', ads.length)

    if (ads.length === 0) {
      console.log('📢 No ads available, showing content without ads')
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

    let paragraphs = Array.from(doc.querySelectorAll('p, div'))
    console.log('📢 Number of paragraphs found:', paragraphs.length)

    // If only 1 paragraph found, try to split by <br> tags or newlines
    if (paragraphs.length <= 1) {
      console.log('📢 Only 1 paragraph found, attempting to split content...')
      const bodyContent = doc.body.innerHTML

      // Split by <br> tags and create virtual paragraphs (reduced minimum length to 20)
      const parts = bodyContent.split(/<br\s*\/?>/i).filter(part => part.trim().length > 20)
      console.log('📢 Split into', parts.length, 'parts by <br> tags')

      if (parts.length > 1) {
        // Reconstruct content with proper paragraph tags
        let reconstructed = parts.map(part => `<p>${part.trim()}</p>`).join('')
        doc.body.innerHTML = reconstructed
        paragraphs = Array.from(doc.querySelectorAll('p'))
        console.log('📢 Reconstructed into', paragraphs.length, 'paragraphs')
      } else {
        // If still only 1 paragraph, try splitting by sentences (periods followed by space)
        console.log('📢 Trying to split by sentences...')
        const textContent = doc.body.textContent || ''
        const sentences = textContent.split(/\.\s+/).filter(s => s.trim().length > 30)
        console.log('📢 Found', sentences.length, 'sentences')

        if (sentences.length > 2) {
          // Group sentences into paragraphs (2-3 sentences each)
          const newParagraphs: string[] = []
          for (let i = 0; i < sentences.length; i += 2) {
            const group = sentences.slice(i, i + 2).join('. ') + '.'
            newParagraphs.push(`<p>${group}</p>`)
          }
          doc.body.innerHTML = newParagraphs.join('')
          paragraphs = Array.from(doc.querySelectorAll('p'))
          console.log('📢 Reconstructed into', paragraphs.length, 'sentence-based paragraphs')
        }
      }
    }

    let adIndex = 0
    let paragraphCount = 0
    let adsInjected = 0

    paragraphs.forEach((paragraph, index) => {
      const textLength = paragraph.textContent ? paragraph.textContent.trim().length : 0
      console.log(`📢 Paragraph ${index + 1} length: ${textLength} chars`)

      // Insert ad after every 2 paragraphs - very low minimum (10 chars)
      if (paragraph.textContent && textLength > 10) { // Reduced from 20 to 10
        paragraphCount++
        console.log(`📢 Valid paragraph ${paragraphCount} found (${textLength} chars)`)

        // Insert ad after 2nd, 4th, 6th paragraph, etc. (every 2 paragraphs)
        if (paragraphCount % 2 === 0) {
          const ad = ads[adIndex]
          console.log(`📢 Inserting ad ${adIndex + 1} after paragraph ${paragraphCount}`)
          const adElement = createAdElement(ad)
          paragraph.insertAdjacentHTML('afterend', adElement)
          adIndex = (adIndex + 1) % ads.length // Cycle through ads
          adsInjected++
        }
      } else {
        console.log(`📢 Paragraph ${index + 1} skipped (too short: ${textLength} chars)`)
      }
    })

    console.log('📢 Total ads injected:', adsInjected)
    console.log('📢 Total valid paragraphs:', paragraphCount)
    setContentWithAds(doc.body.innerHTML)
  }

  const createAdElement = (ad: Ad): string => {
    if (ad.htmlCode) {
      // HTML/AdSense code
      return `
        <div class="ad-container my-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-400 shadow-lg">
          <p class="text-xs text-blue-700 mb-3 text-center font-bold">📢 Advertisement</p>
          ${ad.htmlCode}
        </div>
      `
    } else if (ad.imageUrl) {
      // Validate and clean image URL
      let imageUrl = ad.imageUrl

      // Skip broken base64 URLs (too long or malformed)
      if (imageUrl.startsWith('data:image/') && imageUrl.length > 100000) {
        console.warn('📢 Skipping broken base64 ad image:', ad.id)
        return '' // Skip this ad
      }

      // Image ad with optional link
      const img = `<img src="${imageUrl}" alt="${ad.title}" class="ad-image w-full h-auto rounded-lg shadow-md" onerror="this.parentElement.style.display='none'" />`
      const clickHandler = ad.link ? `onclick="handleAdClick('${ad.id}', '${ad.link}')"` : ''

      return `
        <div class="ad-container my-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-400 shadow-lg">
          <p class="text-xs text-blue-700 mb-3 text-center font-bold">📢 Advertisement</p>
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
          color: #000000 !important;
        }
        .news-content * {
          color: #000000 !important;
        }
        .news-content ul {
          list-style-type: disc !important;
          padding-left: 1.5rem !important;
          margin: 0.75rem 0 !important;
          list-style-position: outside !important;
          color: #000000 !important;
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
          color: #000000 !important;
        }
        @media (min-width: 640px) {
          .news-content ol {
            padding-left: 2rem !important;
          }
        }
        .news-content li {
          display: list-item !important;
          margin: 0.5rem 0 !important;
          color: #000000 !important;
          word-wrap: break-word !important;
        }
        .dark .news-content li {
          color: #000000 !important;
        }
        .news-content p {
          margin: 0.75rem 0 !important;
          line-height: 1.7 !important;
          color: #000000 !important;
        }
        .news-content div {
          color: #000000 !important;
        }
        .news-content span {
          color: #000000 !important;
        }
        .news-content strong,
        .news-content b {
          color: #000000 !important;
        }
        .news-content em,
        .news-content i {
          color: #000000 !important;
        }
        .news-content h1, .news-content h2, .news-content h3, .news-content h4, .news-content h5, .news-content h6 {
          margin: 1rem 0 0.5rem 0 !important;
          line-height: 1.3 !important;
          color: #000000 !important;
          font-weight: bold !important;
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
        /* Base styles for all iframes */
        .news-content iframe {
          border-radius: 0.5rem !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          margin: 1.5rem auto !important;
          display: block !important;
        }

        /* YouTube videos - 1280x720 max, responsive */
        .news-content iframe[src*="youtube"],
        .news-content iframe[src*="youtube-nocookie"] {
          width: 100% !important;
          max-width: 1280px !important;
          height: auto !important;
          aspect-ratio: 16 / 9 !important;
        }

        /* Instagram Reels - 540x720 max, responsive */
        .news-content iframe[src*="instagram"] {
          width: 100% !important;
          max-width: 540px !important;
          height: auto !important;
          aspect-ratio: 9 / 16 !important;
        }
        .news-content blockquote {
          margin: 1rem 0 !important;
          padding: 0.75rem 1rem !important;
          border-left: 4px solid #3B82F6 !important;
          background-color: #F8FAFC !important;
          border-radius: 0 0.5rem 0.5rem 0 !important;
          color: #000000 !important;
        }
        .dark .news-content blockquote {
          background-color: #F8FAFC !important;
          border-left-color: #3B82F6 !important;
          color: #000000 !important;
        }
        .news-content a {
          color: #2563eb !important;
          text-decoration: underline !important;
        }
      `}} />
      <div
        className="news-content prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none"
        dangerouslySetInnerHTML={{ __html: contentWithAds }}
        style={{
          fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)', // H4 size: 18px to 20px (larger default)
          lineHeight: '1.7',
          color: '#000000'
        }}
      />
    </>
  )
}

