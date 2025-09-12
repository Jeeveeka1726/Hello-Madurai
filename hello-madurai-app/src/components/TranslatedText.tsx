'use client'

import { useLanguage } from '@/contexts/LanguageContext'

interface TranslatedTextProps {
  children: string
  tamil?: string
  className?: string
}

export default function TranslatedText({ 
  children, 
  tamil,
  className = ''
}: TranslatedTextProps) {
  const { language } = useLanguage()

  // Basic translation mapping for common terms
  const translations: Record<string, string> = {
    'News': 'செய்திகள்',
    'Events': 'நிகழ்வுகள்',
    'Videos': 'வீடியோக்கள்',
    'Magazine': 'பத்திரிகை',
    'Directory': 'முகவரி நூல்',
    'Home': 'முகப்பு',
    'Podcast': 'பாட்காஸ்ட்',
    'Welcome to Hello Madurai': 'ஹலோ மதுரைக்கு வரவேற்கிறோம்',
    'Your local news and information hub': 'உங்கள் உள்ளூர் செய்தி மற்றும் தகவல் மையம்',
    'Main Sections': 'முக்கிய பிரிவுகள்',
    'All of Madurai\'s information in one place': 'மதுரையின் அனைத்து தகவல்களும் ஒரே இடத்தில்',
    'Stay Connected with Madurai': 'மதுரையுடன் இணைந்திருங்கள்',
    'Get the latest news, events, and local information delivered to you': 'சமீபத்திய செய்திகள், நிகழ்வுகள் மற்றும் உள்ளூர் தகவல்களை பெறுங்கள்',
    'Get Started Now': 'இப்போதே ஆரம்பிக்கவும்',
    'News Articles': 'செய்தி கட்டுரைகள்',
    'Business Listings': 'வணிக பட்டியல்',
    'News Management': 'செய்தி மேலாண்மை',
    'Create, edit, and manage news articles': 'செய்தி கட்டுரைகளை உருவாக்கவும், திருத்தவும், நிர்வகிக்கவும்',
    'Add News': 'செய்தி சேர்க்க',
    'Edit News': 'செய்தி திருத்து',
    'Magazine Management': 'பத்திரிகை மேலாண்மை',
    'Create, edit, and manage digital magazines': 'டிஜிட்டல் பத்திரிகைகளை உருவாக்கவும், திருத்தவும், நிர்வகிக்கவும்',
    'Add Magazine': 'பத்திரிகை சேர்க்க',
    'Edit Magazine': 'பத்திரிகை திருத்து',
    'Video Management': 'வீடியோ மேலாண்மை',
    'Create, edit, and manage video content': 'வீடியோ உள்ளடக்கத்தை உருவாக்கவும், திருத்தவும், நிர்வகிக்கவும்',
    'Add Video': 'வீடியோ சேர்க்க',
    'Edit Video': 'வீடியோ திருத்து',
    'Featured': 'சிறப்பு',
    'Cancel': 'ரத்து செய்',
    'View PDF': 'PDF பார்க்க',
    'Watch': 'பார்க்க',
    'No videos': 'வீடியோக்கள் இல்லை',
    'No magazines': 'பத்திரிகைகள் இல்லை',
    'Get started by creating a new magazine.': 'புதிய பத்திரிகையை உருவாக்குவதன் மூலம் தொடங்குங்கள்.',
    'Get started by adding a new video.': 'புதிய வீடியோவை சேர்ப்பதன் மூலம் தொடங்குங்கள்.'
  }

  if (language === 'ta') {
    // Use provided Tamil translation or fallback to mapping
    return <span className={className}>{tamil || translations[children] || children}</span>
  }

  return <span className={className}>{children}</span>
}
