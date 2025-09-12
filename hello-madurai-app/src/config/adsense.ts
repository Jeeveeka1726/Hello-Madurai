// AdSense Configuration
// Replace these with your real AdSense codes after approval

export const ADSENSE_CONFIG = {
  // Your AdSense Publisher ID (replace after approval)
  publisherId: 'ca-pub-XXXXXXXXXXXXXXXXX',
  
  // Ad Slot IDs (get these from AdSense dashboard after approval)
  adSlots: {
    // Banner ads (728x90 or responsive)
    homeBanner: '1234567890',
    newsBanner: '1234567891', 
    articleBanner: '1234567892',
    
    // Square ads (300x250)
    sidebarSquare: '0987654321',
    contentSquare: '0987654322',
    
    // In-article ads (fluid/responsive)
    inArticle: '1122334455',
    
    // Responsive ads (auto-sizing)
    responsive: '5566778899',
  },
  
  // Ad settings
  settings: {
    // Enable ads in development (usually false)
    enableInDev: false,
    
    // Auto ad refresh (not recommended for AdSense)
    autoRefresh: false,
    
    // Ad loading timeout
    timeout: 5000,
  }
}

// Helper function to check if ads should be shown
export const shouldShowAds = () => {
  if (typeof window === 'undefined') return false
  
  const isDev = process.env.NODE_ENV === 'development'
  return !isDev || ADSENSE_CONFIG.settings.enableInDev
}

// Helper to get ad slot ID
export const getAdSlot = (slotName: keyof typeof ADSENSE_CONFIG.adSlots) => {
  return ADSENSE_CONFIG.adSlots[slotName]
}
