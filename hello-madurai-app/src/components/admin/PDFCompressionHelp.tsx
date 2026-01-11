'use client'

import { useState } from 'react'
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'

export default function PDFCompressionHelp() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
      >
        <InformationCircleIcon className="w-4 h-4 mr-1" />
        {t('compression_help', 'Need help compressing PDFs?', 'PDF சுருக்க உதவி தேவையா?')}
      </button>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-medium text-blue-900">
          📄 {t('pdf_compression_title', 'PDF Compression Help', 'PDF சுருக்க உதவி')}
        </h4>
        <button
          onClick={() => setIsOpen(false)}
          className="text-blue-400 hover:text-blue-600"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
      
      <div className="text-xs text-blue-800 space-y-2">
        <p>
          <strong>{t('current_limit', 'Current limit:', 'தற்போதைய வரம்பு:')}</strong> 10MB (Cloudinary free plan)
        </p>
        
        <div>
          <strong>{t('free_compression_tools', 'Free online compression tools:', 'இலவச ஆன்லைன் சுருக்க கருவிகள்:')}</strong>
          <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
            <li>
              <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:underline">
                ILovePDF Compress
              </a>
            </li>
            <li>
              <a href="https://smallpdf.com/compress-pdf" target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:underline">
                SmallPDF Compress
              </a>
            </li>
            <li>
              <a href="https://www.pdf24.org/en/compress-pdf" target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:underline">
                PDF24 Compress
              </a>
            </li>
          </ul>
        </div>
        
        <p className="text-blue-700">
          💡 {t('compression_tip_detailed', 'Most PDFs can be compressed to 50-80% of original size without significant quality loss.', 'பெரும்பாலான PDF கள் குறிப்பிடத்தக்க தரம் இழப்பு இல்லாமல் அசல் அளவின் 50-80% வரை சுருக்கப்படலாம்.')}
        </p>
      </div>
    </div>
  )
}
