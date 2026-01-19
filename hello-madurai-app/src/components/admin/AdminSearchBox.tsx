'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'

interface AdminSearchBoxProps {
  placeholder?: string
  placeholderTa?: string
  onSearch: (query: string) => void
  className?: string
}

export default function AdminSearchBox({ 
  placeholder = "Search...", 
  placeholderTa = "தேடுங்கள்...",
  onSearch,
  className = ""
}: AdminSearchBoxProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { language } = useLanguage()

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const clearSearch = () => {
    setSearchQuery('')
    onSearch('')
  }

  const currentPlaceholder = language === 'ta' ? placeholderTa : placeholder

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={currentPlaceholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
