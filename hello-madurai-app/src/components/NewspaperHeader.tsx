'use client'

import { useLanguage } from '@/contexts/LanguageContext'

interface NewspaperHeaderProps {
  className?: string
}

export default function NewspaperHeader({ className = '' }: NewspaperHeaderProps) {
  const { t } = useLanguage()

  return (
    <div className={`w-full bg-white dark:bg-gray-800 border-b-4 border-blue-600 dark:border-blue-400 shadow-lg ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-4 sm:py-6">
          {/* Logo and Title */}
          <div className="flex items-center justify-center space-x-3 mb-3">
            <img 
              src="/logo.jpg" 
              alt="Hello Madurai Logo" 
              className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shadow-md"
            />
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-600 dark:text-blue-400 leading-tight">
                Hello Madurai
              </h1>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                {t('newspaper.date', new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }), new Date().toLocaleDateString('ta-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }))}
              </div>
            </div>
          </div>
          
          {/* Tagline */}
          <p className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 font-medium">
            {t('news.newspaperTagline', 'Your Local News & Information Center', 'உங்கள் உள்ளூர் செய்தி மற்றும் தகவல் மையம்')}
          </p>
          
          {/* Decorative line */}
          <div className="mt-4 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 dark:from-blue-400 dark:via-blue-300 dark:to-blue-400 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}
