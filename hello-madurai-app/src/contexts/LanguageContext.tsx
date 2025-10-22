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

// Initialize language from localStorage before first render
const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    try {
      // First check if we have a pre-loaded language from the inline script
      if (window.__HELLO_MADURAI_LANG__) {
        return window.__HELLO_MADURAI_LANG__
      }
      
      // Fallback to reading from localStorage directly
      const saved = localStorage.getItem('hello-madurai-language')
      if (saved === 'ta' || saved === 'en') {
        return saved
      }
    } catch (error) {
      console.error('Error reading language from localStorage:', error)
    }
  }
  return 'en'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)
  const [mounted, setMounted] = useState(false)

  // Ensure we're mounted on client side
  useEffect(() => {
    setMounted(true)
    // Re-check localStorage after mount to ensure consistency
    const saved = localStorage.getItem('hello-madurai-language')
    if (saved === 'ta' || saved === 'en') {
      if (saved !== language) {
        setLanguageState(saved)
      }
    }
  }, [])

  // Custom setLanguage that also updates localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem('hello-madurai-language', lang)
    } catch (error) {
      console.error('Error saving language to localStorage:', error)
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
