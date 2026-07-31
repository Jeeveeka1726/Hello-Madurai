'use client'

/**
 * Performance monitoring utilities
 * Tracks Web Vitals and custom performance metrics
 */

export function reportWebVitals(metric: any) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 ${metric.name}:`, Math.round(metric.value), metric.rating)
  }

  // Send to analytics in production
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    })
  }
}

// Measure custom performance metrics
export function measurePerformance(name: string, startMark: string, endMark?: string) {
  if (typeof window === 'undefined' || !window.performance) return

  try {
    if (!endMark) {
      window.performance.mark(name)
    } else {
      window.performance.measure(name, startMark, endMark)
      const measure = window.performance.getEntriesByName(name)[0]
      console.log(`⏱️ ${name}:`, Math.round(measure.duration), 'ms')
    }
  } catch (error) {
    // Ignore errors
  }
}

// Preload images
export function preloadImages(urls: string[]) {
  if (typeof window === 'undefined') return

  urls.forEach((url) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = url
    document.head.appendChild(link)
  })
}

// Optimize image loading
export function optimizeImageLoading() {
  if (typeof window === 'undefined') return

  // Use Intersection Observer for lazy loading
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.removeAttribute('data-src')
            imageObserver.unobserve(img)
          }
        }
      })
    })

    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img)
    })
  }
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}
