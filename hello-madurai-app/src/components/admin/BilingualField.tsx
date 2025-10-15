'use client'

import { useLanguage } from '@/contexts/LanguageContext'

interface BilingualFieldProps {
  label: string
  labelTamil?: string
  value?: string
  valueTa?: string
  englishValue?: string
  tamilValue?: string
  onChange?: (value: string) => void
  onChangeTa?: (value: string) => void
  onEnglishChange?: (value: string) => void
  onTamilChange?: (value: string) => void
  type?: 'text' | 'textarea' | 'email' | 'url' | 'tel' | 'number'
  textarea?: boolean
  rows?: number
  required?: boolean
  placeholder?: string | { english?: string; tamil?: string }
}

export default function BilingualField({
  label,
  labelTamil,
  value,
  valueTa,
  englishValue,
  tamilValue,
  onChange,
  onChangeTa,
  onEnglishChange,
  onTamilChange,
  type = 'text',
  textarea,
  rows = 4,
  required = false,
  placeholder
}: BilingualFieldProps) {
  const { language } = useLanguage()

  // Support both naming conventions
  const enValue = value ?? englishValue ?? ''
  const taValue = valueTa ?? tamilValue ?? ''
  const handleEnChange = onChange ?? onEnglishChange ?? (() => {})
  const handleTaChange = onChangeTa ?? onTamilChange ?? (() => {})

  // Handle placeholder
  let englishPlaceholder = ''
  let tamilPlaceholder = ''
  if (typeof placeholder === 'string') {
    englishPlaceholder = placeholder
    tamilPlaceholder = placeholder
  } else if (placeholder && typeof placeholder === 'object') {
    englishPlaceholder = placeholder.english || ''
    tamilPlaceholder = placeholder.tamil || ''
  }

  // Determine if textarea based on type or textarea prop
  const isTextarea = textarea || type === 'textarea'
  const InputComponent = isTextarea ? 'textarea' : 'input'
  const inputType = isTextarea ? undefined : type

  return (
    <div className="space-y-4">
      {/* English Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {language === 'ta' ? '(ஆங்கிலம்)' : '(English)'}
          {required && <span className="text-red-500">*</span>}
        </label>
        <InputComponent
          type={inputType}
          value={enValue}
          onChange={(e: any) => handleEnChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          rows={isTextarea ? rows : undefined}
          required={required}
          placeholder={englishPlaceholder}
        />
      </div>

      {/* Tamil Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {labelTamil || label} {language === 'ta' ? '(தமிழ்)' : '(Tamil)'}
        </label>
        <InputComponent
          type={inputType}
          value={taValue}
          onChange={(e: any) => handleTaChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          rows={isTextarea ? rows : undefined}
          placeholder={tamilPlaceholder}
        />
      </div>
    </div>
  )
}
