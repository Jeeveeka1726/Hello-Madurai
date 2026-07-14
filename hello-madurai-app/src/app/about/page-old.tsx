'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import TranslatedText from '@/components/TranslatedText'
import { NewspaperIcon, VideoCameraIcon, MicrophoneIcon, BuildingOfficeIcon, UsersIcon, HeartIcon } from '@heroicons/react/24/outline'

export default function AboutPage() {
  const { language } = useLanguage()

  const features = [
    {
      icon: NewspaperIcon,
      titleEn: 'Local News Coverage',
      titleTa: 'உள்ளூர் செய்தி கவரேஜ்',
      descEn: 'Comprehensive coverage of Madurai and surrounding areas with timely, accurate reporting.',
      descTa: 'மதுரை மற்றும் சுற்றியுள்ள பகுதிகளின் விரிவான செய்திகள் சரியான நேரத்தில்.'
    },
    {
      icon: VideoCameraIcon,
      titleEn: 'Video Content',
      titleTa: 'வீடியோ உள்ளடக்கம்',
      descEn: 'Engaging video stories and documentaries showcasing Madurai\'s culture and daily life.',
      descTa: 'மதுரையின் கலாச்சாரம் மற்றும் தினசரி வாழ்க்கையை காட்டும் வீடியோக்கள்.'
    },
    {
      icon: MicrophoneIcon,
      titleEn: 'Digital FM Radio',
      titleTa: 'டிஜிட்டல் எஃப்எம் வானொலி',
      descEn: 'Listen to curated music collections and radio shows from Madurai.',
      descTa: 'மதுரையின் இசை தொகுப்புகள் மற்றும் வானொலி நிகழ்ச்சிகளை கேளுங்கள்.'
    },
    {
      icon: BuildingOfficeIcon,
      titleEn: 'Business Directory',
      titleTa: 'வணிக முகவரி',
      descEn: 'Complete directory of local businesses, services, and contact information.',
      descTa: 'உள்ளூர் வணிகங்கள், சேவைகள் மற்றும் தொடர்பு தகவல்களின் முழு பட்டியல்.'
    },
    {
      icon: UsersIcon,
      titleEn: 'Community Focus',
      titleTa: 'சமூக கவனம்',
      descEn: 'Dedicated to serving the Madurai community with relevant local information.',
      descTa: 'மதுரை சமூகத்திற்கு தொடர்புடைய உள்ளூர் தகவல்களை வழங்குவதில் அர்ப்பணிப்பு.'
    },
    {
      icon: HeartIcon,
      titleEn: 'Temple City Heritage',
      titleTa: 'கோவில் நகர பாரம்பரியம்',
      descEn: 'Celebrating and preserving Madurai\'s rich cultural and religious heritage.',
      descTa: 'மதுரையின் வளமான கலாச்சார மற்றும் மத பாரம்பரியத்தை கொண்டாடுதல்.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <NewHeader />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              <TranslatedText tamil="ஹலோ மதுரை பற்றி">About Hello Madurai</TranslatedText>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              <TranslatedText tamil="மதுரைக்கான உங்கள் நம்பகமான டிஜிட்டல் தகவல் மையம்">
                Your Trusted Digital Information Hub for Madurai
              </TranslatedText>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <div className="prose prose-lg max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            <TranslatedText tamil="எங்கள் கதை">Our Story</TranslatedText>
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {language === 'ta' ? (
              <>
                ஹலோ மதுரை என்பது மதுரை மற்றும் அதன் சுற்றியுள்ள பகுதிகளுக்கான முழுமையான டிஜிட்டல் தகவல் தளமாகும். 
                உள்ளூர் செய்திகள், நிகழ்வுகள், வணிக தகவல்கள் மற்றும் பலவற்றை வழங்குவதில் நாங்கள் அர்ப்பணிப்புடன் செயல்படுகிறோம். 
                கோவில் நகரமான மதுரையில் நடக்கும் அனைத்து செய்திகளையும் உங்களுக்கு கொண்டு செல்வதே எங்கள் நோக்கம்.
              </>
            ) : (
              <>
                Hello Madurai is a comprehensive digital information platform dedicated to serving Madurai and its surrounding areas. 
                We are committed to providing timely local news, event coverage, business information, and community resources. 
                Our mission is to keep the people of Madurai connected and informed about everything happening in and around the temple city.
              </>
            )}
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            {language === 'ta' ? (
              <>
                50க்கும் மேற்பட்ட செய்தி கட்டுரைகள், 140க்கும் மேற்பட்ட வீடியோக்கள், டிஜிட்டல் பத்திரிகை இதழ்கள், 
                வானொலி நிகழ்ச்சிகள், வணிக முகவரி மற்றும் நிகழ்வு தகவல்களுடன், நாங்கள் மதுரையின் மிக நம்பகமான 
                உள்ளூர் தகவல் மூலமாக வளர்ந்து வருகிறோம்.
              </>
            ) : (
              <>
                With over 50 news articles, 140+ videos, digital magazine issues, radio shows, business directory, and event information, 
                we continue to grow as Madurai's most trusted local information source. We serve thousands of readers daily who rely on us 
                for accurate, timely, and relevant local content.
              </>
            )}
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            <TranslatedText tamil="நாம் என்ன வழங்குகிறோம்">What We Offer</TranslatedText>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {language === 'ta' ? feature.titleTa : feature.titleEn}
                </h3>
                <p className="text-gray-600">
                  {language === 'ta' ? feature.descTa : feature.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-blue-50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            <TranslatedText tamil="எங்கள் நோக்கம்">Our Mission</TranslatedText>
          </h2>
          <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto">
            {language === 'ta' ? (
              <>
                மதுரை மக்களுக்கு சரியான நேரத்தில், துல்லியமான மற்றும் தொடர்புடைய உள்ளூர் தகவல்களை வழங்குவதன் மூலம் 
                சமூகத்தை ஒன்றிணைத்து, கல்வி மற்றும் மேம்பாட்டை ஊக்குவிப்பதே எங்கள் நோக்கம்.
              </>
            ) : (
              <>
                Our mission is to unite and empower the Madurai community by providing timely, accurate, and relevant local information. 
                We strive to be the primary digital platform connecting people with local news, businesses, events, and cultural heritage, 
                fostering community engagement and informed citizenship.
              </>
            )}
          </p>
        </div>

        {/* Contact CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            <TranslatedText tamil="எங்களை தொடர்பு கொள்ளுங்கள்">Get In Touch</TranslatedText>
          </h2>
          <p className="text-gray-600 mb-6">
            <TranslatedText tamil="கேள்விகள் அல்லது பின்னூட்டம் உள்ளதா? எங்களிடம் கேளுங்கள்!">
              Have questions or feedback? We'd love to hear from you!
            </TranslatedText>
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <TranslatedText tamil="தொடர்பு கொள்ள">Contact Us</TranslatedText>
          </a>
        </div>
      </div>
    </div>
  )
}
