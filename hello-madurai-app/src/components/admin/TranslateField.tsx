'use client'

import { useState } from 'react'
import { ArrowPathIcon, LanguageIcon } from '@heroicons/react/24/outline'
import { useTranslate } from '@/hooks/useTranslate'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

interface TranslateFieldProps {
  label: string
  englishValue: string
  tamilValue: string
  onEnglishChange: (value: string) => void
  onTamilChange: (value: string) => void
  placeholder?: {
    english?: string
    tamil?: string
  }
  type?: 'input' | 'textarea'
  required?: boolean
}

export default function TranslateField({
  label,
  englishValue,
  tamilValue,
  onEnglishChange,
  onTamilChange,
  placeholder = {},
  type = 'input',
  required = false
}: TranslateFieldProps) {
  const { translate, loading } = useTranslate()
  const [translating, setTranslating] = useState<'en-to-ta' | 'ta-to-en' | null>(null)

  const handleTranslate = async (direction: 'en-to-ta' | 'ta-to-en') => {
    setTranslating(direction)
    
    try {
      if (direction === 'en-to-ta' && englishValue.trim()) {
        const translated = await translate({
          text: englishValue,
          targetLanguage: 'ta',
          sourceLanguage: 'en'
        })
        onTamilChange(translated)
        toast.success('Translated to Tamil!')
      } else if (direction === 'ta-to-en' && tamilValue.trim()) {
        const translated = await translate({
          text: tamilValue,
          targetLanguage: 'en',
          sourceLanguage: 'ta'
        })
        onEnglishChange(translated)
        toast.success('Translated to English!')
      }
    } catch (error) {
      console.error('Translation error:', error)
      toast.error('Translation failed. Please try again.')
    } finally {
      setTranslating(null)
    }
  }

  const InputComponent = type === 'textarea' ? 'textarea' : 'input'

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* English Field */}
      <div className="relative">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">🇺🇸 English</span>
          {tamilValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleTranslate('ta-to-en')}
              disabled={loading || translating === 'ta-to-en'}
              className="text-xs"
            >
              {translating === 'ta-to-en' ? (
                <ArrowPathIcon className="h-3 w-3 animate-spin" />
              ) : (
                <LanguageIcon className="h-3 w-3" />
              )}
              Translate from Tamil
            </Button>
          )}
        </div>
        <InputComponent
          type={type === 'input' ? 'text' : undefined}
          value={englishValue}
          onChange={(e) => onEnglishChange(e.target.value)}
          placeholder={placeholder.english || `Enter ${label.toLowerCase()} in English`}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
          rows={type === 'textarea' ? 4 : undefined}
          required={required}
        />
      </div>

      {/* Tamil Field */}
      <div className="relative">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">🇮🇳 தமிழ் (Tamil)</span>
          {englishValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleTranslate('en-to-ta')}
              disabled={loading || translating === 'en-to-ta'}
              className="text-xs"
            >
              {translating === 'en-to-ta' ? (
                <ArrowPathIcon className="h-3 w-3 animate-spin" />
              ) : (
                <LanguageIcon className="h-3 w-3" />
              )}
              Translate from English
            </Button>
          )}
        </div>
        <InputComponent
          type={type === 'input' ? 'text' : undefined}
          value={tamilValue}
          onChange={(e) => onTamilChange(e.target.value)}
          placeholder={placeholder.tamil || `Enter ${label.toLowerCase()} in Tamil`}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white font-tamil"
          rows={type === 'textarea' ? 4 : undefined}
        />
      </div>

      {/* Translation Status */}
      {translating && (
        <div className="flex items-center space-x-2 text-sm text-purple-600 dark:text-purple-400">
          <ArrowPathIcon className="h-4 w-4 animate-spin" />
          <span>Translating...</span>
        </div>
      )}
    </div>
  )
}
