/**
 * Utility functions to generate SEO-friendly slugs from text
 * Supports both English and Tamil text
 */

/**
 * Generate a URL-safe slug from a string
 * Handles English, Tamil, and mixed text
 */
export function slugify(text: string, maxLength: number = 100): string {
  if (!text) return ''
  
  let slug = text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove special characters but keep Tamil characters, alphanumeric, and hyphens
    .replace(/[^\u0B80-\u0BFF\w\-]+/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/\-\-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+/, '')
    .replace(/-+$/, '')
  
  // Truncate to max length while preserving word boundaries
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength)
    // Remove trailing incomplete word
    const lastHyphen = slug.lastIndexOf('-')
    if (lastHyphen > 0) {
      slug = slug.substring(0, lastHyphen)
    }
  }
  
  return slug
}

/**
 * Generate a unique slug by appending a unique identifier
 * Used when slug already exists in database
 */
export function generateUniqueSlug(baseSlug: string, uniqueId: string): string {
  // Take first 8 characters of the ID for brevity
  const shortId = uniqueId.substring(0, 8)
  return `${baseSlug}-${shortId}`
}

/**
 * Generate slug from news article title
 * Prefers English title for cleaner, more universal URLs
 */
export function generateNewsSlug(title: string, titleTa: string | null | undefined, id: string): string {
  // Prefer English title for cleaner URLs (no encoding issues)
  const preferredTitle = title || titleTa || 'news'
  const baseSlug = slugify(preferredTitle, 80)

  // Ensure uniqueness by appending short ID
  return generateUniqueSlug(baseSlug, id)
}

/**
 * Generate slug from business name
 * Prefers English name for cleaner, more universal URLs
 */
export function generateBusinessSlug(name: string, nameTa: string | null | undefined, id: string): string {
  // Prefer English name for cleaner URLs (no encoding issues)
  const preferredName = name || nameTa || 'business'
  const baseSlug = slugify(preferredName, 80)

  // Ensure uniqueness by appending short ID
  return generateUniqueSlug(baseSlug, id)
}

/**
 * Extract ID from a slug that contains ID suffix
 * E.g., "business-name-abc123" -> "abc123"
 */
export function extractIdFromSlug(slug: string): string | null {
  const parts = slug.split('-')
  if (parts.length > 0) {
    // Return the last part which should be the ID
    return parts[parts.length - 1]
  }
  return null
}

/**
 * Validate if a string is a valid slug format
 */
export function isValidSlug(slug: string): boolean {
  if (!slug) return false
  // Allow Tamil characters, alphanumeric, and hyphens
  const slugPattern = /^[\u0B80-\u0BFF\w\-]+$/
  return slugPattern.test(slug) && slug.length > 0 && slug.length <= 600
}
