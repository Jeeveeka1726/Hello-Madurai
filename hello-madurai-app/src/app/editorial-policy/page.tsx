'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import NewspaperHeader from '@/components/NewspaperHeader'

export default function EditorialPolicyPage() {
  const { t, language } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <NewHeader />
      <NewspaperHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: '#1e3a8a' }}>
            {language === 'ta' ? '📝 ஆசிரியர் கொள்கை' : '📝 Editorial Policy'}
          </h1>

          {language === 'ta' ? (
            <>
              <p className="text-gray-700 leading-relaxed mb-6">
                Hello Madurai மதுரை மற்றும் சுற்றுவட்டார மக்களுக்கு துல்லியமான, நம்பகமான மற்றும் நேரமையான செய்திகளை வழங்குவதை தனது முதன்மை நோக்கமாகக் கொண்டுள்ளது.
              </p>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">எங்கள் ஆசிரியர் கொள்கைகள்</h3>
                <ul className="space-y-2">
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>உண்மைத் தகவல்களை மட்டுமே வெளியிட முயற்சிக்கிறோம்.</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>ஒவ்வொரு கட்டுரையும் ஆசிரியர் குழுவால் பரிசீலிக்கப்பட்ட பிறகே வெளியிடப்படுகிறது.</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>தவறான அல்லது வழிதவறச் செய்யும் தகவல்களை வேண்டுமென்றே வெளியிடமாட்டோம்.</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>செய்தி, கருத்து, விளம்பரம் மற்றும் ஆதரவு உள்ளடக்கம் ஆகியவற்றை தெளிவாக வேறுபடுத்தி காட்டுகிறோம்.</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>புதிய உறுதிப்படுத்தப்பட்ட தகவல்கள் கிடைத்தால் கட்டுரைகளை புதுப்பிக்கிறோம்.</span>
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">தகவல் ஆதாரங்கள்</h3>
                <ul className="space-y-2">
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>நேரடி செய்தி சேகரிப்பு</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>அரசு அறிவிப்புகள்</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>செய்திக் குறிப்புகள்</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>நேர்காணல்கள்</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>உறுதிப்படுத்தப்பட்ட பொது தகவல்கள்</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>Hello Madurai குழுவின் நேரடி களப்பணி</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                <h3 className="text-lg font-bold text-blue-900 mb-2">ஆசிரியர் சுதந்திரம்</h3>
                <p className="text-blue-800">
                  விளம்பரதாரர்கள் அல்லது வணிக கூட்டாளர்கள் எங்களின் செய்தி வெளியீட்டில் எந்தவொரு செல்வாக்கும் செலுத்த முடியாது.
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-700 leading-relaxed mb-6">
                At Hello Madurai, our mission is to provide accurate, reliable, and timely news and information about Madurai and its surrounding regions.
              </p>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Our Editorial Principles</h3>
                <ul className="space-y-2">
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>We strive to publish factual, accurate, and unbiased content.</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>Every article is reviewed by our editorial team before publication.</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>We do not knowingly publish false or misleading information.</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>We clearly distinguish between news, opinions, sponsored content, and advertisements.</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>We regularly update our articles whenever new verified information becomes available.</span>
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Sources of Information</h3>
                <ul className="space-y-2">
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>Original reporting</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>Official government announcements</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>Press releases</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>Interviews</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>Verified public sources</span>
                  </li>
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>On-site reporting and photography by the Hello Madurai team</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                <h3 className="text-lg font-bold text-blue-900 mb-2">Editorial Independence</h3>
                <p className="text-blue-800">
                  Our editorial decisions are independent. Advertisers, sponsors, or business partners do not influence our editorial content.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
