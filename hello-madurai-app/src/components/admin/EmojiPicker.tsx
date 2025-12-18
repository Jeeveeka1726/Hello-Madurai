'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
  placeholder?: string
}

const BUSINESS_EMOJIS = [
  // Healthcare & Medical
  '🏥', '⚕️', '💊', '🩺', '🦷', '👩‍⚕️', '👨‍⚕️', '🚑',
  
  // Food & Restaurants
  '🍽️', '🍕', '🍔', '🍜', '🍛', '🍱', '🥘', '🍳', '☕', '🧑‍🍳',
  
  // Education & Learning
  '🎓', '📚', '🏫', '✏️', '📝', '🧑‍🏫', '👩‍🎓', '🔬',
  
  // Shopping & Retail
  '🛍️', '🛒', '🏪', '🏬', '👕', '👗', '👠', '💍', '📱',
  
  // Services & Professional
  '💼', '🏢', '💻', '🔧', '🔨', '✂️', '💇‍♀️', '💇‍♂️', '🧑‍💼',
  
  // Transportation & Automotive
  '🚗', '🚕', '🚌', '🏍️', '🚲', '⛽', '🔧', '🚙',
  
  // Entertainment & Recreation
  '🎬', '🎭', '🎪', '🎨', '🎵', '🎸', '🏋️‍♀️', '⚽', '🎯',
  
  // Beauty & Wellness
  '💅', '💄', '🧴', '🧼', '🛁', '💆‍♀️', '💆‍♂️', '🧘‍♀️',
  
  // Finance & Banking
  '💰', '💳', '🏦', '💸', '📊', '📈', '🪙',
  
  // Real Estate & Construction
  '🏠', '🏡', '🏘️', '🏗️', '🔨', '🏢', '🏭',
  
  // Technology & Electronics
  '💻', '📱', '⌚', '🖥️', '⌨️', '🖱️', '📷', '🔌',
  
  // Travel & Tourism
  '✈️', '🏨', '🗺️', '🧳', '📍', '🎒', '🚢', '🏖️',
  
  // Sports & Fitness
  '⚽', '🏀', '🎾', '🏋️‍♀️', '🏋️‍♂️', '🏃‍♀️', '🏃‍♂️', '🚴‍♀️',
  
  // Agriculture & Nature
  '🌱', '🌾', '🚜', '🐄', '🐔', '🍎', '🥕', '🌻'
]

export default function EmojiPicker({ value, onChange, placeholder }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { language } = useLanguage()

  const handleEmojiSelect = (emoji: string) => {
    onChange(emoji)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder || "🏥 🎓 🍽️"}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
        >
          😀
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {language === 'ta' ? 'எமோஜி தேர்ந்தெடுக்கவும்:' : 'Choose an emoji:'}
            </h4>
            <div className="grid grid-cols-8 gap-1">
              {BUSINESS_EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleEmojiSelect(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-200 p-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              {language === 'ta' ? 'மூடு' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
