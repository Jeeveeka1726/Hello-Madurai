'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'ta'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, enText: string, taText: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Declare global type for pre-loaded language
declare global {
  interface Window {
    __HELLO_MADURAI_LANG__?: Language
  }
}

// Initialize language from pre-loaded value or default to 'ta' (Tamil)
const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    try {
      // Check if we have a pre-loaded language from the inline script
      if (window.__HELLO_MADURAI_LANG__) {
        console.log('🔧 getInitialLanguage - using window.__HELLO_MADURAI_LANG__:', window.__HELLO_MADURAI_LANG__)
        return window.__HELLO_MADURAI_LANG__
      }
      // Fallback to localStorage
      const savedLang = localStorage.getItem('hello-madurai-language')
      if (savedLang === 'ta' || savedLang === 'en') {
        console.log('🔧 getInitialLanguage - using localStorage:', savedLang)
        return savedLang
      }
    } catch (error) {
      console.error('Error reading language:', error)
    }
  }
  console.log('🔧 getInitialLanguage - using default: ta (Tamil)')
  return 'ta'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Use lazy initialization to read from localStorage on first render (client-side only)
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLang = localStorage.getItem('hello-madurai-language')
        if (savedLang === 'ta' || savedLang === 'en') {
          return savedLang
        }
      } catch (error) {
        // Silent fail, use default
      }
    }
    return 'ta' // Default fallback
  })

  // Sync with localStorage if not set
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLang = localStorage.getItem('hello-madurai-language')
        if (!savedLang) {
          localStorage.setItem('hello-madurai-language', language)
        }
      } catch (error) {
        console.error('❌ Error syncing language:', error)
      }
    }
  }, [])

  // Custom setLanguage that also updates localStorage
  const setLanguage = (lang: Language) => {
    console.log('🌐 [CHANGE] Changing language to:', lang)
    setLanguageState(lang)

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('hello-madurai-language', lang)
        console.log('🌐 [CHANGE] Saved to localStorage:', lang)
        window.__HELLO_MADURAI_LANG__ = lang
        console.log('🌐 [CHANGE] Updated window variable:', lang)
      } catch (error) {
        console.error('❌ Error saving language:', error)
      }
    }
  }

  // Simple translation function - returns appropriate language text
  const t = (key: string, enText: string, taText: string) => {
    return language === 'ta' ? taText : enText
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
