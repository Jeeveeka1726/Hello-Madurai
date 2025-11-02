'use client'

import { useLanguage } from '@/contexts/LanguageContext'

interface TranslatedTextProps {
  children: string
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

  const text = language === 'ta' ? (tamil || children) : children

  return <Component className={className} style={style} suppressHydrationWarning>{text}</Component>
}
