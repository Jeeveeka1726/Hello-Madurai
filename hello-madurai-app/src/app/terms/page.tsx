'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import NewspaperHeader from '@/components/NewspaperHeader'

export default function TermsOfServicePage() {
  const { t, language } = useLanguage()

  const content = {
    en: {
      title: '📋 Terms of Service',
      subtitle: 'Hello Madurai Platform Terms',
      lastUpdated: 'Last Updated: January 2025',
      
      acceptanceTitle: '1. Acceptance of Terms',
      acceptance: 'By accessing and using Hello Madurai website and mobile application, you accept and agree to be bound by the terms and provision of this agreement.',
      
      servicesTitle: '2. Services Provided',
      services: [
        'News and information updates',
        'Event listings and announcements',
        'Digital FM radio streaming (external sources)',
        'Video content and entertainment',
        'E-Paper and digital publications',
        'Business directory listings',
        'Emergency helpline information'
      ],
      
      userConductTitle: '3. User Conduct',
      userConduct: [
        'Users must not misuse our services or interfere with their operation',
        'Prohibited activities include spamming, harassment, or posting inappropriate content',
        'Users are responsible for their own actions and content they may submit',
        'We reserve the right to suspend access for violations of these terms'
      ],
      
      contentTitle: '4. Content and Intellectual Property',
      content: [
        'Original content created by Hello Madurai is protected by copyright',
        'External radio streams and third-party content remain property of their respective owners',
        'Users may not reproduce, distribute, or commercially use our content without permission',
        'We respect intellectual property rights and expect users to do the same'
      ],
      
      disclaimerTitle: '5. Disclaimer',
      disclaimer: [
        'Services are provided "as is" without warranties of any kind',
        'We do not guarantee accuracy, completeness, or reliability of information',
        'Business directory listings are for informational purposes only',
        'We are not responsible for third-party content or external links'
      ],
      
      limitationTitle: '6. Limitation of Liability',
      limitation: 'Hello Madurai shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services.',
      
      changesTitle: '7. Changes to Terms',
      changes: 'We reserve the right to modify these terms at any time. Continued use of our services constitutes acceptance of any changes.',
      
      contactTitle: '8. Contact Information',
      contact: 'For questions about these terms, please contact us at: support@hellomadurai.com'
    },
    ta: {
      title: '📋 சேவை விதிமுறைகள்',
      subtitle: 'ஹலோ மதுரை தளத்தின் விதிமுறைகள்',
      lastUpdated: 'கடைசியாக புதுப்பிக்கப்பட்டது: ஜனவரி 2025',
      
      acceptanceTitle: '1. விதிமுறைகளின் ஏற்றுக்கொள்ளல்',
      acceptance: 'ஹலோ மதுரை வலைதளம் மற்றும் மொபைல் செயலியை அணுகி பயன்படுத்துவதன் மூலம், இந்த ஒப்பந்தத்தின் விதிமுறைகள் மற்றும் நிபந்தனைகளுக்கு நீங்கள் ஒப்புக்கொள்கிறீர்கள்.',
      
      servicesTitle: '2. வழங்கப்படும் சேவைகள்',
      services: [
        'செய்திகள் மற்றும் தகவல் புதுப்பிப்புகள்',
        'நிகழ்வு பட்டியல்கள் மற்றும் அறிவிப்புகள்',
        'டிஜிட்டல் எஃப்.எம் ரேடியோ ஸ்ட்ரீமிங் (வெளிப்புற மூலங்கள்)',
        'வீடியோ உள்ளடக்கம் மற்றும் பொழுதுபோக்கு',
        'இ-பேப்பர் மற்றும் டிஜிட்டல் வெளியீடுகள்',
        'வணிக அடைவு பட்டியல்கள்',
        'அவசர உதவி எண் தகவல்கள்'
      ],
      
      userConductTitle: '3. பயனர் நடத்தை',
      userConduct: [
        'பயனர்கள் எங்கள் சேவைகளை தவறாக பயன்படுத்தவோ அல்லது அவற்றின் செயல்பாட்டில் தலையிடவோ கூடாது',
        'தடைசெய்யப்பட்ட செயல்பாடுகளில் ஸ்பேம், துன்புறுத்தல் அல்லது பொருத்தமற்ற உள்ளடக்கத்தை இடுகை செய்தல் ஆகியவை அடங்கும்',
        'பயனர்கள் தங்கள் சொந்த செயல்கள் மற்றும் அவர்கள் சமர்ப்பிக்கும் உள்ளடக்கத்திற்கு பொறுப்பு',
        'இந்த விதிமுறைகளை மீறினால் அணுகலை நிறுத்தும் உரிமையை நாங்கள் வைத்துள்ளோம்'
      ],
      
      contentTitle: '4. உள்ளடக்கம் மற்றும் அறிவுசார் சொத்து',
      content: [
        'ஹலோ மதுரையால் உருவாக்கப்பட்ட அசல் உள்ளடக்கம் பதிப்புரிமையால் பாதுகாக்கப்படுகிறது',
        'வெளிப்புற ரேடியோ ஸ்ட்ரீம்கள் மற்றும் மூன்றாம் தரப்பு உள்ளடக்கம் அந்தந்த உரிமையாளர்களின் சொத்தாக இருக்கும்',
        'அனுமதியின்றி எங்கள் உள்ளடக்கத்தை பயனர்கள் மறுஉற்பத்தி, விநியோகம் அல்லது வணிக ரீதியாக பயன்படுத்த முடியாது',
        'நாங்கள் அறிவுசார் சொத்து உரிமைகளை மதிக்கிறோம் மற்றும் பயனர்களும் அவ்வாறே செய்ய எதிர்பார்க்கிறோம்'
      ],
      
      disclaimerTitle: '5. மறுப்பு',
      disclaimer: [
        'சேவைகள் எந்தவிதமான உத்தரவாதமும் இல்லாமல் "அப்படியே" வழங்கப்படுகின்றன',
        'தகவல்களின் துல்லியம், முழுமை அல்லது நம்பகத்தன்மைக்கு நாங்கள் உத்தரவாதம் அளிக்கவில்லை',
        'வணிக அடைவு பட்டியல்கள் தகவல் நோக்கங்களுக்காக மட்டுமே',
        'மூன்றாம் தரப்பு உள்ளடக்கம் அல்லது வெளிப்புற இணைப்புகளுக்கு நாங்கள் பொறுப்பல்ல'
      ],
      
      limitationTitle: '6. பொறுப்பின் வரம்பு',
      limitation: 'எங்கள் சேவைகளைப் பயன்படுத்துவதால் அல்லது பயன்படுத்த இயலாமையால் ஏற்படும் எந்தவொரு நேரடி, மறைமுக, தற்செயலான, சிறப்பு அல்லது விளைவு சேதங்களுக்கும் ஹலோ மதுரை பொறுப்பேற்காது.',
      
      changesTitle: '7. விதிமுறைகளில் மாற்றங்கள்',
      changes: 'எந்த நேரத்திலும் இந்த விதிமுறைகளை மாற்றும் உரிமையை நாங்கள் வைத்துள்ளோம். எங்கள் சேவைகளின் தொடர்ச்சியான பயன்பாடு எந்தவொரு மாற்றங்களையும் ஏற்றுக்கொள்வதாக கருதப்படும்.',
      
      contactTitle: '8. தொடர்பு தகவல்',
      contact: 'இந்த விதிமுறைகள் பற்றிய கேள்விகளுக்கு, தயவுசெய்து எங்களை தொடர்பு கொள்ளுங்கள்: support@hellomadurai.com'
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
          <p className="text-lg text-gray-600 mb-2">
            {t_content.subtitle}
          </p>
          <p className="text-sm text-gray-500">
            {t_content.lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 space-y-8">
          {/* Acceptance */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t_content.acceptanceTitle}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t_content.acceptance}
            </p>
          </div>

          {/* Services */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t_content.servicesTitle}
            </h2>
            <ul className="space-y-2">
              {t_content.services.map((item, index) => (
                <li key={index} className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* User Conduct */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t_content.userConductTitle}
            </h2>
            <ul className="space-y-2">
              {t_content.userConduct.map((item, index) => (
                <li key={index} className="text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Content and IP */}
          <div>
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

          {/* Disclaimer */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t_content.disclaimerTitle}
            </h2>
            <ul className="space-y-2">
              {t_content.disclaimer.map((item, index) => (
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

          {/* Changes to Terms */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {t_content.changesTitle}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t_content.changes}
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-400">
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              {t_content.contactTitle}
            </h3>
            <p className="text-blue-800">
              {t_content.contact}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
