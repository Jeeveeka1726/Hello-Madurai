'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function SimpleFooter() {
  const { t, language } = useLanguage()

  return (
    <footer>
      {/* Copyright Section */}
      <div className="bg-gray-900 text-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <span>{language === 'ta' ? 'பதிப்புரிமை © 2026 ஹலோ மதுரை' : 'Copyright © 2026 Hello Madurai'}</span>
              <span>|</span>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors duration-200">
                {language === 'ta' ? 'தொடர்பு' : 'Contact'}
              </Link>
              <span>|</span>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">
                {language === 'ta' ? 'தனியுரிமைக் கொள்கை' : 'Privacy Policy'}
              </Link>
              <span>|</span>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors duration-200">
                {language === 'ta' ? 'விதிமுறைகள் மற்றும் நிபந்தனைகள்' : 'Terms of Conditions'}
              </Link>
              <span>|</span>
              <Link href="/editorial-policy" className="text-gray-400 hover:text-white transition-colors duration-200">
                {language === 'ta' ? 'ஆசிரியர் கொள்கை' : 'Editorial Policy'}
              </Link>
              <span>|</span>
              <Link href="/fact-check" className="text-gray-400 hover:text-white transition-colors duration-200">
                {language === 'ta' ? 'உண்மை சரிபார்ப்பு' : 'Fact Check'}
              </Link>
              <span>|</span>
              <Link href="/corrections" className="text-gray-400 hover:text-white transition-colors duration-200">
                {language === 'ta' ? 'திருத்தக் கொள்கை' : 'Corrections'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
