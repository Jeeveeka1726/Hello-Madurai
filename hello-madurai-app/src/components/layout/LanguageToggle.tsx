'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LanguageIcon } from '@heroicons/react/24/outline'

export default function LanguageToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentLocale, setCurrentLocale] = useState('en')

  useEffect(() => {
    // Extract locale from pathname
    const pathSegments = pathname.split('/')
    const locale = pathSegments[1]
    if (locale === 'ta' || locale === 'en') {
      setCurrentLocale(locale)
    }
  }, [pathname])

  const toggleLanguage = () => {
    const newLocale = currentLocale === 'en' ? 'ta' : 'en'
    
    // Replace the locale in the current path
    const pathSegments = pathname.split('/')
    pathSegments[1] = newLocale
    const newPath = pathSegments.join('/')
    
    router.push(newPath)
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      title={currentLocale === 'en' ? 'Switch to Tamil' : 'Switch to English'}
    >
      <LanguageIcon className="h-5 w-5" />
      <span className="hidden sm:block">
        {currentLocale === 'en' ? 'தமிழ்' : 'English'}
      </span>
      <span className="sm:hidden">
        {currentLocale === 'en' ? 'த' : 'En'}
      </span>
    </button>
  )
}
