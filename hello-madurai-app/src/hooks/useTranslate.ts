import { useState } from 'react'

interface TranslateOptions {
  text: string
  targetLanguage: 'en' | 'ta'
  sourceLanguage?: 'en' | 'ta'
}

interface TranslateResult {
  originalText: string
  translatedText: string
  targetLanguage: string
  sourceLanguage: string
}

export function useTranslate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const translate = async (options: TranslateOptions): Promise<string> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: options.text,
          targetLanguage: options.targetLanguage,
          sourceLanguage: options.sourceLanguage
        }),
      })

      if (!response.ok) {
        throw new Error('Translation failed')
      }

      const result = await response.json()
      return result.translatedText

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { translate, loading, error }
}
