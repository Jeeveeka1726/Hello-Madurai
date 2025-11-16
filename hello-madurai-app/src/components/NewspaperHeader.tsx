'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect } from 'react'

interface NewspaperHeaderProps {
  className?: string
}

export default function NewspaperHeader({ className = '' }: NewspaperHeaderProps) {
  const { t } = useLanguage()
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const updateDate = () => {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
      setCurrentDate(new Date().toLocaleDateString('en-IN', options))
    }
    updateDate()
    const intervalId = setInterval(updateDate, 60000) // Update every minute
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className={`w-full bg-white border-b-4 border-blue-600 shadow-lg ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-4 sm:py-6">
          {/* Logo and Title */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
            <img 
              src="/logo.jpg" 
              alt="Hello Madurai Logo" 
              className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shadow-md flex-shrink-0"
            />
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-blue-600 leading-tight" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
                Hello Madurai
              </h1>
              <div className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                {currentDate || 'Loading...'}
              </div>
            </div>
          </div>
          
          {/* Tagline */}
          <p className="text-sm sm:text-base lg:text-lg text-gray-700 font-medium" suppressHydrationWarning>
            {t('news.newspaperTagline', 'Your Local News & Information Center', 'உங்கள் உள்ளூர் செய்தி மற்றும் தகவல் மையம்')}
          </p>
          
        </div>
      </div>
    </div>
  )
}
