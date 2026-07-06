'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import NewspaperHeader from '@/components/NewspaperHeader'

export default function CorrectionsPage() {
  const { t, language } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <NewHeader />
      <NewspaperHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: '#1e3a8a' }}>
            {language === 'ta' ? '📋 திருத்தக் கொள்கை' : '📋 Corrections Policy'}
          </h1>

          {language === 'ta' ? (
            <>
              <p className="text-gray-700 leading-relaxed mb-6">
                Hello Madurai வெளியிடும் தகவல்களின் துல்லியத்திற்கு முக்கியத்துவம் அளிக்கிறது.
              </p>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">ஒரு செய்தியில் தவறு இருப்பது கண்டறியப்பட்டால்:</h3>
                <ul className="space-y-2">
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>உடனடியாக திருத்தம் செய்யப்படும்.</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>முக்கியமான திருத்தங்கள் கட்டுரையிலேயே குறிப்பிடப்படும்.</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>வாசகர்கள் பிழைகளை எங்களிடம் தெரிவிக்கலாம்.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
                <h3 className="text-lg font-bold text-orange-900 mb-2">தொடர்பு கொள்ள</h3>
                <p className="text-orange-800">
                  மின்னஞ்சல்: hellomaduraiapp@gmail.com
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-700 leading-relaxed mb-6">
                Accuracy is important to us.
              </p>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">If we discover an error after publication:</h3>
                <ul className="space-y-2">
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>The article will be corrected promptly.</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>Significant corrections will be noted within the article.</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>Readers can report mistakes by contacting us.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
                <h3 className="text-lg font-bold text-orange-900 mb-2">Contact</h3>
                <p className="text-orange-800">
                  Email: hellomaduraiapp@gmail.com
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
