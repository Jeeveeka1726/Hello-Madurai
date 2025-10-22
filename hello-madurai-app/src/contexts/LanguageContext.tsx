'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'ta'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, enText: string, taText: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')
  const [isLoading, setIsLoading] = useState(true)

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('hello-madurai-language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ta')) {
      setLanguage(savedLanguage)
    }
    setIsLoading(false)
  }, [])

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('hello-madurai-language', language)
  }, [language])

  // Simple translation function - returns appropriate language text
  const t = (key: string, enText: string, taText: string) => {
    return language === 'ta' ? taText : enText
  }

  // Don't render children until language is loaded from localStorage
  if (isLoading) {
    return null
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
