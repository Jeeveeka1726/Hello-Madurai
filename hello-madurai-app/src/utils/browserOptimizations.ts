'use client'

/**
 * Browser-specific optimizations for cross-browser compatibility
 * Handles Firefox, Chrome, Safari, Edge, and mobile browsers
 */

// Detect browser type
export function detectBrowser(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  const userAgent = window.navigator.userAgent.toLowerCase()
  
  if (userAgent.indexOf('firefox') > -1) return 'firefox'
  if (userAgent.indexOf('edg') > -1) return 'edge'
  if (userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1) return 'safari'
  if (userAgent.indexOf('chrome') > -1) return 'chrome'
  
  return 'unknown'
}

// Apply browser-specific optimizations
export function applyBrowserOptimizations() {
  if (typeof window === 'undefined') return
  
  const browser = detectBrowser()
  
  // Firefox-specific optimizations
  if (browser === 'firefox') {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth'
    
    // Optimize image rendering
    document.querySelectorAll('img').forEach((img) => {
      (img as HTMLImageElement).style.imageRendering = 'crisp-edges'
    })
  }
  
  // Safari-specific optimizations
  if (browser === 'safari') {
    // Fix webkit rendering issues
    document.body.style.webkitFontSmoothing = 'antialiased'
    document.body.style.setProperty('-webkit-tap-highlight-color', 'transparent')
    
    // Enable hardware acceleration for smoother animations
    const elements = document.querySelectorAll('[class*="transition"]')
    elements.forEach((el) => {
      (el as HTMLElement).style.transform = 'translateZ(0)'
    })
  }
  
  // Edge-specific optimizations
  if (browser === 'edge') {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth'
  }
  
  // Chrome-specific optimizations
  if (browser === 'chrome') {
    // Enable font display swap for faster rendering
    document.fonts.ready.then(() => {
      document.body.style.visibility = 'visible'
    })
  }
}

// Optimize images for all browsers
export function optimizeImages() {
  if (typeof window === 'undefined') return
  
  const images = document.querySelectorAll('img')
  
  images.forEach((img) => {
    // Add loading attribute if not present
    if (!img.getAttribute('loading')) {
      img.setAttribute('loading', 'lazy')
    }
    
    // Add decoding attribute for better performance
    if (!img.getAttribute('decoding')) {
      img.setAttribute('decoding', 'async')
    }
    
    // Add fetchpriority for above-fold images
    const rect = img.getBoundingClientRect()
    if (rect.top < window.innerHeight && !img.getAttribute('fetchpriority')) {
      img.setAttribute('fetchpriority', 'high')
    }
  })
}

// Enable passive event listeners for better scroll performance
export function enablePassiveListeners() {
  if (typeof window === 'undefined') return
  
  try {
    const supportsPassive = (() => {
      let passive = false
      try {
        const opts = Object.defineProperty({}, 'passive', {
          get: function() {
            passive = true
            return true
          }
        })
        window.addEventListener('test', () => {}, opts)
      } catch (e) {}
      return passive
    })()
    
    if (supportsPassive) {
      // Override addEventListener for touch and wheel events
      const originalAddEventListener = EventTarget.prototype.addEventListener
      EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (type === 'touchstart' || type === 'touchmove' || type === 'wheel') {
          const opts = typeof options === 'object' ? options : {}
          opts.passive = opts.passive !== false
          return originalAddEventListener.call(this, type, listener, opts)
        }
        return originalAddEventListener.call(this, type, listener, options)
      }
    }
  } catch (e) {
    console.warn('Passive listeners not supported:', e)
  }
}

// Prefetch critical resources
export function prefetchCriticalResources() {
  if (typeof window === 'undefined') return
  
  const criticalAPIs = [
    '/api/notice-banners',
    '/api/home-features',
    '/api/news/latest',
  ]
  
  criticalAPIs.forEach((url) => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    link.as = 'fetch'
    document.head.appendChild(link)
  })
}

// Initialize all optimizations
export function initializeBrowserOptimizations() {
  if (typeof window === 'undefined') return
  
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyBrowserOptimizations()
      optimizeImages()
      enablePassiveListeners()
      prefetchCriticalResources()
    })
  } else {
    applyBrowserOptimizations()
    optimizeImages()
    enablePassiveListeners()
    prefetchCriticalResources()
  }
}
