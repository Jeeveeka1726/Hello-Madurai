/**
 * URL Preview and Thumbnail Extraction Utilities
 */

interface UrlPreview {
  type: 'youtube' | 'vimeo' | 'instagram' | 'image' | 'unknown'
  thumbnail?: string
  title?: string
  embedUrl?: string
  originalUrl: string
}

/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
    /youtube\.com\/shorts\/([^&\?\/]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Get YouTube video thumbnail
 */
export function getYouTubeThumbnail(url: string): string | null {
  const videoId = extractYouTubeId(url)
  if (!videoId) return null

  // Use maxresdefault for best quality, fallback to hqdefault
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

/**
 * Get YouTube embed URL
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = extractYouTubeId(url)
  if (!videoId) return null

  return `https://www.youtube.com/embed/${videoId}`
}

/**
 * Extract Vimeo video ID from URL
 */
export function extractVimeoId(url: string): string | null {
  const pattern = /vimeo\.com\/(?:channels\/\w+\/|groups\/\w+\/videos\/|video\/|)(\d+)/
  const match = url.match(pattern)
  return match ? match[1] : null
}

/**
 * Get Vimeo video thumbnail (requires API call in production)
 */
export function getVimeoEmbedUrl(url: string): string | null {
  const videoId = extractVimeoId(url)
  if (!videoId) return null

  return `https://player.vimeo.com/video/${videoId}`
}

/**
 * Check if URL is an image
 */
export function isImageUrl(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
  const urlLower = url.toLowerCase()
  return imageExtensions.some((ext) => urlLower.includes(ext))
}

/**
 * Check if URL is Instagram
 */
export function isInstagramUrl(url: string): boolean {
  return url.includes('instagram.com')
}

/**
 * Get Instagram embed URL
 */
export function getInstagramEmbedUrl(url: string): string | null {
  if (!isInstagramUrl(url)) return null

  // Clean URL
  let cleanUrl = url.split('?')[0]
  if (!cleanUrl.endsWith('/')) {
    cleanUrl += '/'
  }

  return `${cleanUrl}embed`
}

/**
 * Parse URL and get preview data
 */
export async function getUrlPreview(url: string): Promise<UrlPreview> {
  const preview: UrlPreview = {
    type: 'unknown',
    originalUrl: url,
  }

  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    preview.type = 'youtube'
    preview.thumbnail = getYouTubeThumbnail(url) || undefined
    preview.embedUrl = getYouTubeEmbedUrl(url) || undefined
    return preview
  }

  // Vimeo
  if (url.includes('vimeo.com')) {
    preview.type = 'vimeo'
    preview.embedUrl = getVimeoEmbedUrl(url) || undefined
    return preview
  }

  // Instagram
  if (isInstagramUrl(url)) {
    preview.type = 'instagram'
    preview.embedUrl = getInstagramEmbedUrl(url) || undefined
    return preview
  }

  // Image
  if (isImageUrl(url)) {
    preview.type = 'image'
    preview.thumbnail = url
    return preview
  }

  return preview
}

/**
 * Generate iframe embed code for URL
 */
export function generateEmbedCode(
  url: string,
  width: number = 560,
  height: number = 315
): string | null {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const embedUrl = getYouTubeEmbedUrl(url)
    if (!embedUrl) return null

    return `<iframe width="${width}" height="${height}" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
  }

  if (url.includes('vimeo.com')) {
    const embedUrl = getVimeoEmbedUrl(url)
    if (!embedUrl) return null

    return `<iframe width="${width}" height="${height}" src="${embedUrl}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
  }

  if (isInstagramUrl(url)) {
    const embedUrl = getInstagramEmbedUrl(url)
    if (!embedUrl) return null

    return `<iframe width="${width}" height="${height}" src="${embedUrl}" frameborder="0" scrolling="no" allowtransparency="true"></iframe>`
  }

  if (isImageUrl(url)) {
    return `<img src="${url}" alt="Image" style="max-width: 100%; height: auto;" />`
  }

  return null
}

