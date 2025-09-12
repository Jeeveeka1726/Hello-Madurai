import { NextRequest, NextResponse } from 'next/server'

// For development/demo purposes, we'll use a free translation service
// In production, you should use Google Translate API with proper credentials

interface TranslateRequest {
  text: string
  targetLanguage: 'en' | 'ta'
  sourceLanguage?: 'en' | 'ta'
}

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage }: TranslateRequest = await request.json()

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and target language are required' },
        { status: 400 }
      )
    }

    // For demo purposes, using a free translation service
    // You can replace this with Google Translate API
    const translatedText = await translateText(text, targetLanguage, sourceLanguage)

    return NextResponse.json({
      originalText: text,
      translatedText,
      targetLanguage,
      sourceLanguage: sourceLanguage || 'auto'
    })

  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}

// Free translation function using MyMemory API (for demo)
// In production, replace with Google Translate API
async function translateText(text: string, targetLang: string, sourceLang?: string): Promise<string> {
  try {
    // First try our basic translation for common terms
    const basicResult = basicTranslate(text, targetLang)
    if (basicResult !== text) {
      return basicResult
    }

    // Detect source language if not provided
    const fromLang = sourceLang === 'en' ? 'en' : 
                    sourceLang === 'ta' ? 'ta' : 
                    (isEnglish(text) ? 'en' : 'ta')
    
    const toLang = targetLang === 'en' ? 'en' : 'ta'
    
    // If source and target are the same, return original text
    if (fromLang === toLang) {
      return text
    }

    // Use MyMemory free translation API (has daily limits)
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`,
      { 
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; HelloMadurai/1.0)'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Translation service unavailable')
    }

    const data = await response.json()
    
    if (data.responseStatus === 200 && data.responseData.translatedText) {
      const translated = data.responseData.translatedText.trim()
      // Check if translation looks reasonable
      if (translated.length > 0 && 
          translated !== text && 
          !translated.includes('MYMEMORY WARNING') &&
          !translated.includes('QUOTA EXCEEDED') &&
          translated.length < text.length * 3) { // Avoid overly long translations
        return translated
      }
    }
    
    // If API translation failed, return original text
    return text

  } catch (error) {
    console.error('Translation API error:', error)
    // Return original text if all else fails
    return text
  }
}

// Simple language detection
function isEnglish(text: string): boolean {
  // Basic check for English characters
  const englishPattern = /^[a-zA-Z0-9\s.,!?;:'"()\-]*$/
  return englishPattern.test(text)
}

// Enhanced fallback translation for common terms
function basicTranslate(text: string, targetLang: string): string {
  const translations: Record<string, Record<string, string>> = {
    en: {
      'செய்திகள்': 'News',
      'நிகழ்வுகள்': 'Events', 
      'வீடியோக்கள்': 'Videos',
      'பத்திரிகை': 'Magazine',
      'முகவரி நூல்': 'Directory',
      'மதுரை': 'Madurai',
      'ஹலோ மதுரை': 'Hello Madurai',
      'வரவேற்கிறோம்': 'Welcome',
      'முகப்பு': 'Home',
      'பாட்காஸ்ட்': 'Podcast',
      'செய்தி மேலாண்மை': 'News Management',
      'செய்தி சேர்க்க': 'Add News',
      'செய்தி திருத்து': 'Edit News',
      'முக்கிய பிரிவுகள்': 'Main Sections',
      'மதுரையுடன் இணைந்திருங்கள்': 'Stay Connected with Madurai'
    },
    ta: {
      'News': 'செய்திகள்',
      'Events': 'நிகழ்வுகள்',
      'Videos': 'வீடியோக்கள்',
      'Magazine': 'பத்திரிகை',
      'Directory': 'முகவரி நூல்',
      'Madurai': 'மதுரை',
      'Hello Madurai': 'ஹலோ மதுரை',
      'Welcome': 'வரவேற்கிறோம்',
      'Home': 'முகப்பு',
      'Podcast': 'பாட்காஸ்ட்',
      'News Management': 'செய்தி மேலாண்மை',
      'Add News': 'செய்தி சேர்க்க',
      'Edit News': 'செய்தி திருத்து',
      'Main Sections': 'முக்கிய பிரிவுகள்',
      'Stay Connected with Madurai': 'மதுரையுடன் இணைந்திருங்கள்',
      'Your local news and information hub': 'உங்கள் உள்ளூர் செய்தி மற்றும் தகவல் மையம்',
      'All of Madurai\'s information in one place': 'மதுரையின் அனைத்து தகவல்களும் ஒரே இடத்தில்',
      'Get the latest news, events, and local information delivered to you': 'சமீபத்திய செய்திகள், நிகழ்வுகள் மற்றும் உள்ளூர் தகவல்களை பெறுங்கள்',
      'Get Started Now': 'இப்போதே ஆரம்பிக்கவும்',
      'News Articles': 'செய்தி கட்டுரைகள்',
      'Business Listings': 'வணிக பட்டியல்',
      'Create, edit, and manage news articles': 'செய்தி கட்டுரைகளை உருவாக்கவும், திருத்தவும், நிர்வகிக்கவும்',
      'Hello': 'வணக்கம்',
      'Title': 'தலைப்பு',
      'Content': 'உள்ளடக்கம்',
      'Description': 'விவரம்',
      'Save': 'சேமி',
      'Cancel': 'ரத்து',
      'Edit': 'திருத்து',
      'Delete': 'நீக்கு',
      'Add': 'சேர்',
      'Create': 'உருவாக்கு',
      'Update': 'புதுப்பி',
      'Submit': 'சமர்ப்பி',
      'Loading': 'ஏற்றுகிறது',
      'Success': 'வெற்றி',
      'Error': 'பிழை',
      'Warning': 'எச்சரிக்கை',
      'Information': 'தகவல்',
      'Please wait': 'தயவுசெய்து காத்திருக்கவும்',
      'Try again': 'மீண்டும் முயற்சிக்கவும்'
    }
  }

  // Try to find exact match first
  if (translations[targetLang] && translations[targetLang][text]) {
    return translations[targetLang][text]
  }

  // Try to find partial matches for longer texts
  let result = text
  if (translations[targetLang]) {
    Object.keys(translations[targetLang]).forEach(key => {
      if (text.includes(key)) {
        result = result.replace(new RegExp(key, 'gi'), translations[targetLang][key])
      }
    })
  }

  return result
}
