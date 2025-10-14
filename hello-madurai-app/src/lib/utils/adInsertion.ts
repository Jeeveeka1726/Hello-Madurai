/**
 * Ad Insertion Utilities
 * Automatically insert ads every N paragraphs in article content
 */

export interface Ad {
  id: string
  imageUrl?: string | null
  htmlCode?: string | null
  link?: string | null
  title: string
  title_ta?: string | null
}

export const AD_CONFIG = {
  insertEvery: 2, // Insert ad after every N paragraphs
  minParagraphs: 3, // Minimum paragraphs needed to show ads
  maxAds: 3, // Maximum ads per article
}

/**
 * Split HTML content into paragraphs
 */
function splitIntoParagraphs(content: string): string[] {
  // Split by </p> tag and keep the tag
  return content
    .split('</p>')
    .filter((p) => p.trim())
    .map((p) => p + '</p>')
}

/**
 * Count paragraphs in HTML content
 */
export function countParagraphs(content: string): number {
  const paragraphs = content.match(/<p[^>]*>.*?<\/p>/gi)
  return paragraphs ? paragraphs.length : 0
}

/**
 * Render ad HTML
 */
function renderAd(ad: Ad, index: number, language: 'en' | 'ta' = 'en'): string {
  const adTitle = language === 'ta' && ad.title_ta ? ad.title_ta : ad.title

  // If ad has custom HTML code (e.g., Google AdSense)
  if (ad.htmlCode) {
    return `
      <div class="ad-block my-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" data-ad-id="${ad.id}" data-ad-index="${index}">
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">விளம்பரம் / Advertisement</div>
        ${ad.htmlCode}
      </div>
    `
  }

  // If ad has image
  if (ad.imageUrl) {
    const adContent = ad.link
      ? `<a href="${ad.link}" target="_blank" rel="noopener noreferrer" onclick="trackAdClick('${ad.id}')">
          <img src="${ad.imageUrl}" alt="${adTitle}" class="w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow" />
        </a>`
      : `<img src="${ad.imageUrl}" alt="${adTitle}" class="w-full h-auto rounded-lg shadow-md" />`

    return `
      <div class="ad-block my-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" data-ad-id="${ad.id}" data-ad-index="${index}">
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">விளம்பரம் / Advertisement</div>
        ${adContent}
      </div>
    `
  }

  return ''
}

/**
 * Insert ads into article content every N paragraphs
 */
export function insertAdsInContent(
  content: string,
  ads: Ad[],
  language: 'en' | 'ta' = 'en'
): string {
  if (!ads || ads.length === 0) return content

  const paragraphs = splitIntoParagraphs(content)
  const paragraphCount = paragraphs.length

  // Don't insert ads if article is too short
  if (paragraphCount < AD_CONFIG.minParagraphs) {
    return content
  }

  const result: string[] = []
  let adIndex = 0
  let adsInserted = 0

  paragraphs.forEach((paragraph, index) => {
    // Add paragraph
    result.push(paragraph)

    // Check if we should insert an ad after this paragraph
    const shouldInsertAd =
      (index + 1) % AD_CONFIG.insertEvery === 0 && // Every N paragraphs
      adsInserted < AD_CONFIG.maxAds && // Haven't exceeded max ads
      adsInserted < ads.length && // Have ads available
      index < paragraphCount - 1 // Not the last paragraph

    if (shouldInsertAd) {
      result.push(renderAd(ads[adIndex], adsInserted, language))
      adIndex = (adIndex + 1) % ads.length // Cycle through ads
      adsInserted++
    }
  })

  return result.join('\n')
}

/**
 * Get active ads for a category
 */
export async function getActiveAds(category: string = 'news'): Promise<Ad[]> {
  try {
    const response = await fetch(`/api/ads?category=${category}&active=true`)
    if (!response.ok) return []

    const data = await response.json()
    return data.ads || []
  } catch (error) {
    console.error('Error fetching ads:', error)
    return []
  }
}

/**
 * Track ad impression
 */
export async function trackAdImpression(adId: string): Promise<void> {
  try {
    await fetch(`/api/ads/${adId}/impression`, {
      method: 'POST',
    })
  } catch (error) {
    console.error('Error tracking ad impression:', error)
  }
}

/**
 * Track ad click
 */
export async function trackAdClick(adId: string): Promise<void> {
  try {
    await fetch(`/api/ads/${adId}/click`, {
      method: 'POST',
    })
  } catch (error) {
    console.error('Error tracking ad click:', error)
  }
}

/**
 * Client-side script to track ad clicks
 */
export const AD_TRACKING_SCRIPT = `
<script>
  function trackAdClick(adId) {
    fetch('/api/ads/' + adId + '/click', { method: 'POST' })
      .catch(err => console.error('Ad click tracking failed:', err));
  }
  
  // Track ad impressions when they come into view
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const adId = entry.target.getAttribute('data-ad-id');
          if (adId) {
            fetch('/api/ads/' + adId + '/impression', { method: 'POST' })
              .catch(err => console.error('Ad impression tracking failed:', err));
            observer.unobserve(entry.target);
          }
        }
      });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('.ad-block').forEach(ad => observer.observe(ad));
  }
</script>
`

