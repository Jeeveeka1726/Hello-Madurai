'use client'

import { useEffect } from 'react'

/**
 * Client-side browser optimization wrapper
 * Applies browser-specific optimizations on mount
 */
export default function BrowserOptimizationWrapper() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Initialize optimizations
    const initOptimizations = async () => {
      try {
        // Import browser optimization utilities
        const { initializeBrowserOptimizations } = await import('@/utils/browserOptimizations')
        
        // Apply optimizations
        initializeBrowserOptimizations()
        
        console.log('✅ Browser optimizations applied')
      } catch (error) {
        console.warn('Failed to apply browser optimizations:', error)
      }
    }

    initOptimizations()

    // Register service worker for all browsers
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker registered:', registration.scope)
            
            // Check for updates periodically
            setInterval(() => {
              registration.update()
            }, 60000) // Check every minute
          })
          .catch((error) => {
            console.warn('Service Worker registration failed:', error)
          })
      })
    }

    // Performance observer for monitoring
    if ('PerformanceObserver' in window) {
      try {
        // Observe Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          console.log('📊 LCP:', lastEntry.renderTime || lastEntry.loadTime)
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // Observe First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            console.log('📊 FID:', entry.processingStart - entry.startTime)
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // Observe Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsScore = 0
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsScore += entry.value
            }
          })
          console.log('📊 CLS:', clsScore)
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (error) {
        // Performance observers not supported in some browsers
        console.log('Performance observers not available')
      }
    }

    // Connection quality detection
    if ('connection' in navigator || 'mozConnection' in navigator || 'webkitConnection' in navigator) {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      
      if (connection) {
        console.log('🌐 Connection:', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        })

        // Adjust quality based on connection
        if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          // Enable data saver mode
          document.documentElement.classList.add('data-saver-mode')
          console.log('💾 Data saver mode enabled')
        }
      }
    }

    // Memory monitoring for performance
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory
      console.log('💾 Memory:', {
        usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
        totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
        jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
      })
    }

    // Report Web Vitals
    const reportWebVitals = () => {
      if ('getEntriesByType' in performance) {
        const paintEntries = performance.getEntriesByType('paint')
        paintEntries.forEach((entry) => {
          console.log('🎨', entry.name, ':', Math.round(entry.startTime), 'ms')
        })

        const navigationEntries = performance.getEntriesByType('navigation')
        navigationEntries.forEach((entry: any) => {
          console.log('🚀 Navigation:', {
            'DOM Content Loaded': Math.round(entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart) + 'ms',
            'Load Complete': Math.round(entry.loadEventEnd - entry.loadEventStart) + 'ms',
            'DOM Interactive': Math.round(entry.domInteractive) + 'ms'
          })
        })
      }
    }

    // Report after page load
    if (document.readyState === 'complete') {
      reportWebVitals()
    } else {
      window.addEventListener('load', reportWebVitals)
    }

  }, [])

  // This component doesn't render anything
  return null
}
