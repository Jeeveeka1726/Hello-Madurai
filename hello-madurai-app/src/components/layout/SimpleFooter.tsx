'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function SimpleFooter() {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white py-6 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Brand */}
          <div className="mb-4 md:mb-0">
            <Link href="/" className="flex items-center">
              <span className="text-lg font-bold text-white">Hello Madurai</span>
              <span className="ml-2 text-sm text-gray-300">ஹலோ மதுரை</span>
            </Link>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center md:justify-end space-x-6 mb-4 md:mb-0">
            <Link 
              href="/privacy" 
              className="text-gray-400 hover:text-white text-sm transition-colors duration-200" 
              suppressHydrationWarning
            >
              {t('footer.privacy', 'Privacy Policy', 'தனியுரிமை கொள்கை')}
            </Link>
            <Link 
              href="/terms" 
              className="text-gray-400 hover:text-white text-sm transition-colors duration-200" 
              suppressHydrationWarning
            >
              {t('footer.terms', 'Terms & Conditions', 'விதிமுறைகள்')}
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-400 hover:text-white text-sm transition-colors duration-200" 
              suppressHydrationWarning
            >
              {t('footer.contact', 'Contact', 'தொடர்பு')}
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-gray-400 text-xs" suppressHydrationWarning>
              © {currentYear} Hello Madurai. {t('footer.copyright', 'All rights reserved.', 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
