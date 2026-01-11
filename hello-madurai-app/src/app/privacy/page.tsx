'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import NewspaperHeader from '@/components/NewspaperHeader'

export default function PrivacyPolicyPage() {
  const { t, language } = useLanguage()

  const content = {
    en: {
      title: '🔐 Privacy Policy',
      subtitle: 'Content Scope Section',
      intro: 'Our application and website provide multiple digital services including News, Events, Digital FM (external radio streams), Videos, E-Paper, Business Directory, and Help Line services.',
      
      personalDataTitle: 'Personal Data:',
      personalData: [
        'We do not collect, store, or share personal information from users.',
        'No user registration or login is required to access the services.'
      ],
      
      radioTitle: 'External Radio Streams:',
      radio: [
        'The Digital FM section provides access only to publicly available external radio streams.',
        'We do not host, store, download, or rebroadcast any external audio content.',
        'All rights belong to the respective radio stations and content owners.',
        'The app also includes original audio content created by Hello Madurai, for which all content rights are owned by Hello Madurai.'
      ],
      
      contentTitle: 'News, Events, Videos, and E-Paper:',
      content: [
        'News articles, event updates, videos, and digital publications are either sourced from publicly available information or created by Hello Madurai.',
        'All original content rights are owned by Hello Madurai unless otherwise stated.'
      ],
      
      businessTitle: 'Business Directory & Help Line:',
      business: [
        'Business listings and help line information are provided for informational purposes only.',
        'We do not guarantee accuracy, availability, or outcomes of services listed in these sections.'
      ],
      
      thirdPartyTitle: 'Third-Party Links:',
      thirdParty: [
        'The app may contain links to third-party websites or services.',
        'We are not responsible for the privacy practices or content of external platforms.'
      ]
    },
    ta: {
      title: '🔐 தனியுரிமைக் கொள்கை',
      subtitle: 'சேவைகளின் வரம்பு',
      intro: 'எங்களது வலைதளம் மற்றும் செயலி மூலம் செய்திகள் (News), நிகழ்வுகள் (Events), டிஜிட்டல் எஃப்.எம் (வெளிப்புற ரேடியோ ஒலிப்பதிவுகள்), வீடியோக்கள், இ-பேப்பர், வணிக அடைவு (Business Directory) மற்றும் உதவி எண் (Help Line) போன்ற பல்வேறு டிஜிட்டல் சேவைகள் வழங்கப்படுகின்றன.',
      
      personalDataTitle: 'தனிப்பட்ட தகவல்கள்:',
      personalData: [
        'இந்த செயலி பயனர்களிடமிருந்து எந்தவொரு தனிப்பட்ட தகவல்களையும் (Personal Data) சேகரிக்கவோ, சேமிக்கவோ, பகிரவோ செய்யாது.',
        'இந்த சேவைகளைப் பயன்படுத்த பயனர் பதிவு அல்லது உள்நுழைவு அவசியமில்லை.'
      ],
      
      radioTitle: 'டிஜிட்டல் எஃப்.எம் (வெளிப்புற ரேடியோ):',
      radio: [
        'டிஜிட்டல் எஃப்.எம் பகுதியில் வெளிப்புற இணைய ரேடியோ ஒலிப்பதிவுகளுக்கான இணைப்புகள் மட்டுமே வழங்கப்படுகின்றன.',
        'எங்களால் எந்தவொரு பாடல்களும் சேமிக்கப்படவோ, பதிவிறக்கப்படவோ, மறுபரப்பப்படவோ இல்லை.',
        'அனைத்து ஒலிப்பதிவு உரிமைகளும் சம்பந்தப்பட்ட ரேடியோ நிலையங்கள் மற்றும் உள்ளடக்க உரிமையாளர்களுக்கே உரியது.',
        'இதில் ஹலோ மதுரை சொந்த ஒலிப்பதிவுகளும் வழங்கப்பட்டுள்ளது. அதன் உள்ளடக்க உரிமைகள் ஹலோ மதுரைக்கே.'
      ],
      
      contentTitle: 'செய்திகள், வீடியோக்கள் & இ-பேப்பர்:',
      content: [
        'செய்திகள், நிகழ்வுகள், வீடியோக்கள் மற்றும் இ-பேப்பர் உள்ளடக்கங்கள் பொதுவாக கிடைக்கும் தகவல்களிலிருந்தோ அல்லது ஹலோ மதுரை மூலம் சுயமாக உருவாக்கப்பட்டவையாகவோ இருக்கும்.',
        'வேறு விதமாக குறிப்பிடப்படாவிட்டால், சுயமாக உருவாக்கப்பட்ட உள்ளடக்கங்களின் உரிமைகள் ஹலோ மதுரைக்கே சொந்தமானவை.'
      ],
      
      businessTitle: 'வணிக அடைவு & உதவி எண்:',
      business: [
        'வணிக அடைவு மற்றும் உதவி எண் பகுதிகளில் வழங்கப்படும் தகவல்கள் பொது தகவல் நோக்கத்திற்காக மட்டுமே.',
        'அதில் குறிப்பிடப்படும் சேவைகள் அல்லது தகவல்களின் துல்லியம், தரம் அல்லது விளைவுகளுக்கு ஹலோ மதுரை பொறுப்பேற்காது.'
      ],
      
      thirdPartyTitle: 'மூன்றாம் தரப்பு இணைப்புகள்:',
      thirdParty: [
        'இந்த செயலியில் மூன்றாம் தரப்பு இணைப்புகள் அல்லது சேவைகள் இருக்கலாம்.',
        'அவற்றின் தனியுரிமை நடைமுறைகள் மற்றும் உள்ளடக்கங்களுக்கு ஹலோ மதுரை எந்தவொரு பொறுப்பும் ஏற்காது.'
      ]
    }
  }

  const t_content = content[language as keyof typeof content]

  return (
    <div className="min-h-screen bg-gray-50">
      <NewspaperHeader showTagline={true} />
      <NewHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t_content.title}
          </h1>
          <p className="text-lg text-gray-600">
            {t_content.subtitle}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          {/* Introduction */}
          <div className="mb-8">
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
              {t_content.intro}
            </p>
          </div>

          {/* Personal Data Section */}
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t_content.personalDataTitle}
            </h2>
            <ul className="space-y-2">
              {t_content.personalData.map((item, index) => (
                <li key={index} className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Radio Section */}
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t_content.radioTitle}
            </h2>
            <ul className="space-y-2">
              {t_content.radio.map((item, index) => (
                <li key={index} className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Content Section */}
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t_content.contentTitle}
            </h2>
            <ul className="space-y-2">
              {t_content.content.map((item, index) => (
                <li key={index} className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Business Directory Section */}
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t_content.businessTitle}
            </h2>
            <ul className="space-y-2">
              {t_content.business.map((item, index) => (
                <li key={index} className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Third Party Section */}
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t_content.thirdPartyTitle}
            </h2>
            <ul className="space-y-2">
              {t_content.thirdParty.map((item, index) => (
                <li key={index} className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-400">
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              {language === 'ta' ? '📞 தொடர்பு தகவல்' : '📞 Contact Information'}
            </h3>
            <p className="text-blue-800">
              {language === 'ta'
                ? 'கேள்விகள் அல்லது கவலைகளுக்கு: hellomadurai777@gmail.com'
                : 'For questions or concerns: hellomadurai777@gmail.com'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
