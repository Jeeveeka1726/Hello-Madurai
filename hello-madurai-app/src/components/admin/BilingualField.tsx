'use client'

import { useLanguage } from '@/contexts/LanguageContext'

interface BilingualFieldProps {
  label: string
  value?: string
  valueTa?: string
  englishValue?: string
  tamilValue?: string
  onChange?: (value: string) => void
  onChangeTa?: (value: string) => void
  onEnglishChange?: (value: string) => void
  onTamilChange?: (value: string) => void
  type?: string
  textarea?: boolean
  rows?: number
  required?: boolean
  placeholder?: string
}

export default function BilingualField({
  label,
  value,
  valueTa,
  englishValue,
  tamilValue,
  onChange,
  onChangeTa,
  onEnglishChange,
  onTamilChange,
  type = 'text',
  textarea = false,
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

  const InputComponent = textarea ? 'textarea' : 'input'

  return (
    <div className="space-y-4">
      {/* English Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {language === 'ta' ? '(ஆங்கிலம்)' : '(English)'}
          {required && <span className="text-red-500">*</span>}
        </label>
        <InputComponent
          type={textarea ? undefined : type}
          value={enValue}
          onChange={(e: any) => handleEnChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          rows={textarea ? rows : undefined}
          required={required}
          placeholder={placeholder}
        />
      </div>

      {/* Tamil Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {language === 'ta' ? '(தமிழ்)' : '(Tamil)'}
        </label>
        <InputComponent
          type={textarea ? undefined : type}
          value={taValue}
          onChange={(e: any) => handleTaChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          rows={textarea ? rows : undefined}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
