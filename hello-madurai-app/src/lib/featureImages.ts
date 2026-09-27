// Cache-busting for feature images.
//
// The images in /public/feature-images are replaced in place (same filename),
// which breaks every cache layer that keys on URL:
//   - browser HTTP cache
//   - the service worker (public/sw.js) Cache API
//   - iOS WKWebView native URL cache (ignores must-revalidate, used by the
//     Capacitor app)
//   - CDNs
//
// Bump FEATURE_IMAGES_VERSION whenever the files are replaced. The query
// string changes the URL, so every cache treats it as a brand-new resource
// and fetches the fresh file. Keep it in sync with the <link rel="preload">
// tags in src/app/layout.tsx.

export const FEATURE_IMAGES_VERSION = '2'

export function featureImageUrl(filename: string): string {
  return `/feature-images/${filename}?v=${FEATURE_IMAGES_VERSION}`
}
