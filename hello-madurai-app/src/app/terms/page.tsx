'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import NewspaperHeader from '@/components/NewspaperHeader'

export default function TermsOfServicePage() {
  const { t, language } = useLanguage()

  const content = {
    en: {
      title: '📜 Terms & Conditions',
      subtitle: 'Service Usage Clause',

      intro: 'Hello Madurai operates as a digital information and media platform. The application provides access to news, events, digital radio links, videos, e-papers, business listings, and help line information.',

      digitalFmTitle: 'Digital FM (External Radios):',
      digitalFm: [
        'The Digital FM feature acts only as an access point to external radio streams.',
        'Hello Madurai does not operate, control, or rebroadcast any radio station.',
        'All copyrights and broadcast rights belong to the respective owners.'
      ],

      contentOwnershipTitle: 'Content Ownership:',
      contentOwnership: [
        'All original content including text, audio, videos, graphics, and digital media produced by Hello Madurai are the intellectual property of Hello Madurai.',
        'Unauthorized reproduction, redistribution, or misuse is prohibited.'
      ],

      thirdPartyTitle: 'Third-Party Content:',
      thirdParty: [
        'Content from external sources is displayed for informational purposes.',
        'Hello Madurai does not take responsibility for third-party content, accuracy, or availability.'
      ],

      limitationTitle: 'Limitation of Liability:',
      limitation: 'Hello Madurai shall not be held responsible for any loss or damage arising from the use of information, services, or external links provided through the platform.'
    },
    ta: {
      title: '📜 விதிமுறைகள் & நிபந்தனைகள்',
      subtitle: 'சேவை பயன்பாடு',

      intro: 'ஹலோ மதுரை ஒரு டிஜிட்டல் தகவல் மற்றும் மீடியா தளமாக செயல்படுகிறது. இந்த செயலி - hellomadurai.com மூலம் செய்திகள், நிகழ்வுகள், வெளிப்புற ரேடியோ இணைப்புகள், வீடியோக்கள், இ-பேப்பர், வணிக பட்டியல்கள் மற்றும் உதவி எண் தகவல்கள் வழங்கப்படுகின்றன.',

      digitalFmTitle: 'டிஜிட்டல் எஃப்.எம் (External Radios):',
      digitalFm: [
        'டிஜிட்டல் எஃப்.எம் பகுதி வெளிப்புற இணைய ரேடியோ ஒலிப்பதிவுகளுக்கான அணுகல் வசதியை மட்டும் வழங்குகிறது.',
        'எந்தவொரு ரேடியோ நிலையத்தையும் ஹலோ மதுரை இயக்கவோ, கட்டுப்படுத்தவோ, மறுபரப்பவோ செய்யவில்லை.',
        'அனைத்து ஒலிப்பதிவு மற்றும் ஒலிபரப்பு உரிமைகளும் சம்பந்தப்பட்ட உரிமையாளர்களுக்கே சொந்தமானவை.',
        'இதில் ஹலோ மதுரை சொந்த ஒலிப்பதிவுகளும் வழங்கப்பட்டுள்ளது. அதன் உள்ளடக்க உரிமைகள் ஹலோ மதுரைக்கே.'
      ],

      contentOwnershipTitle: 'உள்ளடக்க உரிமைகள்:',
      contentOwnership: [
        'ஹலோ மதுரை மூலம் சுயமாக உருவாக்கப்படும் உரை, ஒலி, வீடியோ, படங்கள் மற்றும் டிஜிட்டல் உள்ளடக்கங்களின் அனைத்து அறிவுசார் உரிமைகளும் ஹலோ மதுரைக்கே சொந்தமானவை.',
        'அனுமதி இல்லாமல் அவற்றை நகலெடுக்க, பகிர, மறுபயன்படுத்த கடுமையாகத் தடை செய்யப்படுகிறது.'
      ],

      thirdPartyTitle: 'மூன்றாம் தரப்பு உள்ளடக்கம்:',
      thirdParty: [
        'வெளிப்புற மூலங்களிலிருந்து காண்பிக்கப்படும் உள்ளடக்கங்கள் தகவல் நோக்கத்திற்காக மட்டுமே.',
        'அவற்றின் துல்லியம், கிடைப்புத் தன்மை அல்லது உள்ளடக்கத்திற்கு ஹலோ மதுரை பொறுப்பல்ல.'
      ],

      limitationTitle: 'பொறுப்பு வரம்பு:',
      limitation: 'இந்த செயலி - hellomadurai.com அல்லது வலைதளம் மூலம் வழங்கப்படும் தகவல்கள் அல்லது வெளிப்புற இணைப்புகளைப் பயன்படுத்துவதால் ஏற்படும் எந்தவொரு இழப்பு அல்லது சேதத்திற்கும் ஹலோ மதுரை பொறுப்பேற்காது.'
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
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 space-y-8">
          {/* Introduction */}
          <div>
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
              {t_content.intro}
            </p>
          </div>

          {/* Digital FM */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t_content.digitalFmTitle}
            </h2>
            <ul className="space-y-2">
              {t_content.digitalFm.map((item, index) => (
                <li key={index} className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Content Ownership */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t_content.contentOwnershipTitle}
            </h2>
            <ul className="space-y-2">
              {t_content.contentOwnership.map((item, index) => (
                <li key={index} className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Third Party Content */}
          <div>
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

          {/* Limitation of Liability */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t_content.limitationTitle}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t_content.limitation}
            </p>
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
