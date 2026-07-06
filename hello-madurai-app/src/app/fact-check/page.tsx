'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import NewspaperHeader from '@/components/NewspaperHeader'

export default function FactCheckPage() {
  const { t, language } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <NewHeader />
      <NewspaperHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: '#1e3a8a' }}>
            {language === 'ta' ? '✓ உண்மை சரிபார்ப்பு கொள்கை' : '✓ Fact Check Policy'}
          </h1>

          {language === 'ta' ? (
            <>
              <p className="text-gray-700 leading-relaxed mb-6">
                Hello Madurai வெளியிடும் அனைத்து செய்திகளும் முடிந்தவரை உறுதிப்படுத்தப்பட்ட தகவல்களின் அடிப்படையில் தயாரிக்கப்படுகின்றன.
              </p>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">வெளியீட்டிற்கு முன்</h3>
                <ul className="space-y-2">
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>அதிகாரப்பூர்வ ஆதாரங்கள் மூலம் தகவல்கள் சரிபார்க்கப்படுகின்றன.</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>பல்வேறு நம்பகமான ஆதாரங்களுடன் ஒப்பிட்டு உறுதி செய்யப்படுகிறது.</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>புகைப்படங்கள் மற்றும் வீடியோக்களின் உண்மைத்தன்மை சரிபார்க்கப்படுகிறது.</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>தவறுகள் கண்டறியப்பட்டால் உடனடியாக திருத்தம் செய்யப்படும்.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                <h3 className="text-lg font-bold text-green-900 mb-2">பிழைகளை தெரிவிக்க</h3>
                <p className="text-green-800">
                  மின்னஞ்சல்: hellomaduraiapp@gmail.com
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-700 leading-relaxed mb-6">
                Hello Madurai is committed to publishing verified and accurate information.
              </p>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Before Publishing</h3>
                <ul className="space-y-2">
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>Information is verified using official or trusted sources.</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>Facts are cross-checked whenever possible.</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>Images and videos are verified before use.</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>Corrections are made immediately if errors are identified.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                <h3 className="text-lg font-bold text-green-900 mb-2">Report Factual Errors</h3>
                <p className="text-green-800">
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
