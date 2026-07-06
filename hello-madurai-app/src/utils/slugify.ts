/**
 * Convert a string to a URL-friendly slug
 * This function should be used consistently across the app
 * to ensure author names always convert to the same slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars except -
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '')             // Trim - from end
}

/**
 * Get author profile URL by author name
 * Converts the author name to slug format
 */
export function getAuthorUrl(authorName: string): string {
  return `/reporters/${slugify(authorName)}`
}
