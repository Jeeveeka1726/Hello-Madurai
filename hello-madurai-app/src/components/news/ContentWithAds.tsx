'use client'

import { useEffect, useState } from 'react'

interface Ad {
  id: string
  title: string
  imageUrl?: string
  htmlCode?: string
  link?: string
  impressions: number
  clicks: number
}

interface ContentWithAdsProps {
  content: string
  newsId: string
}

export default function ContentWithAds({ content, newsId }: ContentWithAdsProps) {
  const [ads, setAds] = useState<Ad[]>([])
  const [contentWithAds, setContentWithAds] = useState<string>(content) // Show content immediately
  const [isLoadingAds, setIsLoadingAds] = useState(true)

  useEffect(() => {
    fetchAds()
  }, [])

  useEffect(() => {
    if (!isLoadingAds && ads.length > 0) {
      injectAds()
    }
  }, [ads, content, isLoadingAds])

  // Fix YouTube iframes - Instagram iframes work automatically with /embed endpoint
  useEffect(() => {
    if (contentWithAds) {
      const processEmbeds = () => {
        // Fix YouTube iframes
        const iframes = document.querySelectorAll('.news-content iframe')
        iframes.forEach((iframe) => {
          const src = iframe.getAttribute('src')

          // Fix YouTube domain
          if (src && src.includes('youtube.com') && !src.includes('youtube-nocookie.com')) {
            const newSrc = src.replace('youtube.com', 'youtube-nocookie.com')
            iframe.setAttribute('src', newSrc)
          }

          // Remove inline width/height attributes for YouTube - let CSS handle sizing
          if (src && src.includes('youtube')) {
            iframe.removeAttribute('width')
            iframe.removeAttribute('height')
            iframe.removeAttribute('style')
          }
        })

        // Instagram iframes with /embed endpoint work automatically - no script needed!
        const instagramEmbeds = document.querySelectorAll('.news-content iframe[data-instagram-reel]')
        console.log('📸 Found Instagram iframe embeds:', instagramEmbeds.length)
      }

      // Process immediately
      processEmbeds()

      // Also process after a delay to catch any late-loading content
      setTimeout(processEmbeds, 500)
    }
  }, [contentWithAds])

  const fetchAds = async () => {
    try {
      console.log('📢 Fetching ads for news article...')
      const response = await fetch('/api/ads/active?category=news', {
        // Use cache-first strategy for faster loads
        cache: 'force-cache',
        next: { revalidate: 180 } // 3 minutes
      })
      console.log('📢 Ads API response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('📢 Fetched ads:', data.length, 'ads found')
        console.log('📢 Ads data:', data)
        setAds(data)

        // Track impressions in background (non-blocking)
        setTimeout(() => {
          data.forEach((ad: Ad) => {
            fetch(`/api/ads/${ad.id}/impression`, { method: 'POST' }).catch(() => {})
          })
        }, 1000) // Delay by 1 second to not block ad rendering
      } else {
        console.error('📢 Failed to fetch ads, status:', response.status)
      }
    } catch (error) {
      console.error('📢 Error fetching ads:', error)
    } finally {
      setIsLoadingAds(false)
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

    // Get all paragraph-like elements (p, h1-h6, div with text)
    // This handles both <p> tags and heading tags (h1-h6) used for content
    let paragraphs = Array.from(doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div'))
    console.log('📢 Number of paragraph-like elements found:', paragraphs.length)
    console.log('📢 Raw HTML structure:', doc.body.innerHTML.substring(0, 800))

    // Filter out empty elements and keep only those with meaningful content
    const validParagraphs = paragraphs.filter(p => {
      const text = (p.textContent || '').trim()
      return text.length > 30
    })
    console.log('📢 Valid paragraph-like elements (>30 chars):', validParagraphs.length)

    if (validParagraphs.length > 0) {
      paragraphs = validParagraphs
    }

    // If still only 1 or 0 paragraphs, try alternative splitting methods
    if (paragraphs.length <= 1) {
      console.log('📢 Only', paragraphs.length, 'valid paragraph(s) found, attempting alternative splitting...')
      const bodyContent = doc.body.innerHTML
      const textContent = doc.body.textContent || ''

      // Try splitting by double line breaks (\n\n) in the text content
      const textParagraphs = textContent.split(/\n\n+/).filter(p => p.trim().length > 30)
      console.log('📢 Found', textParagraphs.length, 'text paragraphs by double line breaks')

      if (textParagraphs.length > 1) {
        // Reconstruct content with proper paragraph tags
        let reconstructed = textParagraphs.map(p => `<p>${p.trim()}</p>`).join('')
        doc.body.innerHTML = reconstructed
        paragraphs = Array.from(doc.querySelectorAll('p'))
        console.log('📢 Reconstructed into', paragraphs.length, 'paragraphs from text')
      } else {
        // Try splitting by <br><br> or multiple <br> tags
        const parts = bodyContent.split(/<br\s*\/?>\s*<br\s*\/?>/i).filter(part => {
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = part
          return (tempDiv.textContent || '').trim().length > 30
        })
        console.log('📢 Split into', parts.length, 'parts by double <br> tags (min 30 chars)')

        if (parts.length > 1) {
          // Reconstruct content with proper paragraph tags
          let reconstructed = parts.map(part => `<p>${part.trim()}</p>`).join('')
          doc.body.innerHTML = reconstructed
          paragraphs = Array.from(doc.querySelectorAll('p'))
          console.log('📢 Reconstructed into', paragraphs.length, 'paragraphs from <br> tags')
        }
      }
    }

    let adIndex = 0
    let paragraphCount = 0
    let adsInjected = 0

    paragraphs.forEach((paragraph, index) => {
      const textLength = paragraph.textContent ? paragraph.textContent.trim().length : 0
      console.log(`📢 Paragraph ${index + 1} length: ${textLength} chars`)

      // Insert ad after every 3 paragraphs - minimum 30 chars for valid paragraph
      if (paragraph.textContent && textLength > 30) {
        paragraphCount++
        console.log(`📢 Valid paragraph ${paragraphCount} found (${textLength} chars)`)

        // Insert ad after 3rd, 6th, 9th paragraph, etc. (every 3 paragraphs)
        // Only insert if we still have ads available (no repeating)
        if (paragraphCount % 3 === 0 && adIndex < ads.length) {
          const ad = ads[adIndex]
          console.log(`📢 Inserting ad ${adIndex + 1} after paragraph ${paragraphCount}`)
          const adElement = createAdElement(ad)
          paragraph.insertAdjacentHTML('afterend', adElement)
          adIndex++ // Move to next ad (don't cycle, just increment)
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
    // Stats HTML for bottom - single line
    const statsHtml = `
      <div class="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 mt-4">
        <div class="flex items-center gap-1.5">
          <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span class="font-medium">${ad.impressions.toLocaleString()}</span>
          <span class="text-gray-500">views</span>
        </div>
        <div class="flex items-center gap-1.5">
          <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <span class="font-medium">${ad.clicks.toLocaleString()}</span>
          <span class="text-gray-500">clicks</span>
        </div>
      </div>
    `

    if (ad.htmlCode) {
      // HTML/AdSense code
      return `
        <div class="ad-container my-8">
          ${ad.htmlCode}
          ${statsHtml}
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

      // Image ad with optional link - optimized with lazy loading and fade-in
      const img = `<img
        src="${imageUrl}"
        alt="${ad.title}"
        class="ad-image w-full h-auto"
        loading="lazy"
        decoding="async"
        style="background: #f3f4f6; min-height: 200px; opacity: 0; transition: opacity 0.3s ease-in-out;"
        onload="this.style.opacity='1'"
        onerror="this.parentElement.style.display='none'"
      />`
      const clickHandler = ad.link ? `onclick="handleAdClick('${ad.id}', '${ad.link}')"` : ''

      return `
        <div class="ad-container my-8">
          ${ad.link
            ? `<a href="${ad.link}" target="_blank" rel="noopener noreferrer" ${clickHandler} class="block hover:opacity-90 transition-opacity cursor-pointer">${img}</a>`
            : img
          }
          ${statsHtml}
        </div>
      `
    }
    return ''
  }

  // Track ad clicks - optimized for instant response
  useEffect(() => {
    // Add global click handler
    (window as any).handleAdClick = (adId: string, link: string) => {
      // Open link immediately for instant response
      if (link) {
        window.open(link, '_blank', 'noopener,noreferrer')
      }

      // Track click in background (non-blocking)
      fetch(`/api/ads/${adId}/click`, { method: 'POST' })
        .catch(error => console.error('Error tracking click:', error))
    }

    return () => {
      delete (window as any).handleAdClick
    }
  }, [])

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `
        // Disable right-click context menu on news content
        document.addEventListener('DOMContentLoaded', function() {
          const newsContent = document.querySelector('.news-content');
          if (newsContent) {
            // Disable right-click
            newsContent.addEventListener('contextmenu', function(e) {
              e.preventDefault();
              return false;
            });

            // Disable common keyboard shortcuts for copying
            newsContent.addEventListener('keydown', function(e) {
              // Disable Ctrl+A (Select All), Ctrl+C (Copy), Ctrl+V (Paste), Ctrl+X (Cut)
              if (e.ctrlKey && (e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'x')) {
                e.preventDefault();
                return false;
              }
              // Disable F12 (Developer Tools)
              if (e.key === 'F12') {
                e.preventDefault();
                return false;
              }
            });

            // Disable drag and drop
            newsContent.addEventListener('dragstart', function(e) {
              e.preventDefault();
              return false;
            });
          }
        });
      ` }} />
      <style dangerouslySetInnerHTML={{ __html: `
        .news-content {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          color: #000000 !important;
          /* Prevent text selection and copying */
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          /* Disable right-click context menu */
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        .news-content * {
          color: #000000 !important;
          /* Prevent text selection on all child elements */
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
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
        .news-content img.float-left,
        .news-content img[style*="float: left"] {
          float: left !important;
          display: inline !important;
          margin: 0.5rem 1.5rem 1rem 0 !important;
          max-width: 350px !important;
        }
        .news-content img.float-right,
        .news-content img[style*="float: right"] {
          float: right !important;
          display: inline !important;
          margin: 0.5rem 0 1rem 1.5rem !important;
          max-width: 350px !important;
        }
        @media (max-width: 767px) {
          .news-content img.float-left,
          .news-content img.float-right,
          .news-content img[style*="float"] {
            float: none !important;
            display: block !important;
            margin: 1rem auto !important;
            max-width: 100% !important;
          }
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

        /* Instagram Reels - RESPONSIVE - Using iframe /embed endpoint */
        .news-content iframe[data-instagram-reel] {
          margin: 1rem auto !important;
          max-width: 540px !important;
          width: 100% !important;
          height: 960px !important;
          border: none !important;
          display: block !important;
        }

        /* Mobile - full width */
        @media (max-width: 639px) {
          .news-content iframe[data-instagram-reel] {
            max-width: 100% !important;
            height: 700px !important;
          }
        }

        /* Tablet - limit width to 400px */
        @media (min-width: 640px) and (max-width: 1023px) {
          .news-content iframe[data-instagram-reel] {
            max-width: 400px !important;
            height: 800px !important;
          }
        }

        /* Desktop - full Instagram Reel size (540px) */
        @media (min-width: 1024px) {
          .news-content iframe[data-instagram-reel] {
            max-width: 540px !important;
            height: 960px !important;
          }
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
          fontSize: 'clamp(1.25rem, 3vw, 1.375rem)', // Medium size: 20px to 22px (increased from small)
          lineHeight: '1.7',
          color: '#000000'
        }}
      />
    </>
  )
}

