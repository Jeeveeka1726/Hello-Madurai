'use client'

import { useLanguage } from '@/contexts/LanguageContext'

interface TranslatedTextProps {
  children: React.ReactNode
  tamil?: string
  className?: string
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
  style?: React.CSSProperties
}

export default function TranslatedText({
  children,
  tamil,
  className = '',
  as: Component = 'span',
  style
}: TranslatedTextProps) {
  const { language } = useLanguage()

  // Use tamil translation if available and in Tamil mode, otherwise fallback to children
  const text = language === 'ta' ? (tamil || children) : children

  // If we still have nothing (e.g. both are null/undefined), use an empty string
  const content = text ?? children ?? ''

  if (!content && content !== 0) {
    console.warn('⚠️ TranslatedText: rendered content is empty!', { children, tamil, language })
  }

  return <Component className={className} style={style} suppressHydrationWarning>{content}</Component>
}
