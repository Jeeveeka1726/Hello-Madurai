'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import NewspaperHeader from '@/components/NewspaperHeader'

export default function AboutPage() {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen bg-white">
      <NewspaperHeader showTagline={true} />
      <NewHeader />
      
      <div className="bg-gradient-to-b from-blue-50 to-blue-100 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-4">
              {language === 'ta' ? 'எங்களை பற்றி' : 'About Us'}
            </h1>
            <p className="text-xl text-gray-600">
              {language === 'ta' ? 'அனைவருக்கும் வணக்கம்! 🙏' : 'Greetings to Everyone! 🙏'}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 space-y-6">
            {language === 'ta' ? (
              <>
                <p className="text-gray-700 leading-relaxed text-lg">
                  ஹலோ மதுரை என்பது மதுரையை மையமாகக் கொண்டு செயல்படும் ஒரு டிஜிட்டல் ஊடக நிறுவனம்.
                </p>

                <p className="text-gray-700 leading-relaxed">
                  எங்களது பயணம் <strong>2017 ஆம் ஆண்டு மார்ச் மாதத்தில்</strong>, மத்திய அரசின் அங்கீகாரம் பெற்ற மாத இதழாக தொடங்கியது. 52 பக்கங்களுடன் மதுரை மாவட்ட மக்களின் வரவேற்பைப் பெற்று, பல்வேறு சமூக, கல்வி, வணிக, கலாச்சார மற்றும் உள்ளூர் செய்திகளை தரமாக வெளியிட்டு வந்தோம்.
                </p>

                <p className="text-gray-700 leading-relaxed">
                  <strong>2020 ஆம் ஆண்டு</strong> கொரோனா பெருந்தொற்று காரணமாக அச்சு இதழின் வெளியீடு நிறுத்தப்பட்டாலும், எங்களது ஊடகப் பயணம் நிற்கவில்லை.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg my-6">
                  <p className="text-gray-700 leading-relaxed">
                    காலத்தின் மாற்றத்தை உணர்ந்து, <strong>2019 ஆம் ஆண்டு இறுதி முதல்</strong> டிஜிட்டல் ஊடகத் துறையில் புதிய பயணத்தைத் தொடங்கினோம். இன்று செய்திகள், நிகழ்வுகள், வீடியோக்கள், உள்ளூர் தகவல்கள் மற்றும் மக்களுக்கு பயனுள்ள சேவைகளை டிஜிட்டல் வடிவில் வேகமாகவும், நம்பகத்தன்மையுடனும் வழங்கி வருகிறோம்.
                  </p>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  தற்போது <strong>Hello Madurai செயலி Android மற்றும் iOS</strong> ஆகிய இரு தளங்களிலும் கிடைக்கிறது. மதுரையை உலகம் முழுவதும் உள்ள தமிழர்களுடன் டிஜிட்டல் வழியாக இணைக்கும் முயற்சியில் தொடர்ந்து செயல்பட்டு வருகிறோம்.
                </p>

                <p className="text-gray-700 leading-relaxed font-medium text-lg">
                  மக்களின் நம்பிக்கையே எங்களின் மிகப்பெரிய பலம். தரமான, பொறுப்பான மற்றும் மக்களுக்கு பயனுள்ள தகவல்களை வழங்குவதே எங்களின் நோக்கம்.
                </p>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-gray-700 mb-2">அன்புடன்,</p>
                  <p className="text-gray-900 font-bold text-lg">மு. ரமேஷ் குமார்</p>
                  <p className="text-gray-600">நிறுவனர் & ஆசிரியர்</p>
                  <p className="text-blue-600 font-medium">Hello Madurai</p>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Hello Madurai is a digital media organization dedicated to serving the people of Madurai through reliable and innovative journalism.
                </p>

                <p className="text-gray-700 leading-relaxed">
                  Our journey began in <strong>March 2017</strong> with the launch of a Government of India–registered monthly magazine. The 52-page publication earned the trust of readers by covering local news, business, education, culture, social developments, and community stories across Madurai district.
                </p>

                <p className="text-gray-700 leading-relaxed">
                  Due to the <strong>COVID-19 pandemic</strong>, the print edition was discontinued in March 2020. However, our commitment to journalism never stopped.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg my-6">
                  <p className="text-gray-700 leading-relaxed">
                    Recognizing the rapid shift toward digital media, we began our digital transformation in <strong>late 2019</strong>. Since then, we have been delivering timely news, videos, local updates, events, and useful public information through modern digital platforms.
                  </p>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  Today, <strong>Hello Madurai is available as a dedicated mobile application on both Android and iOS</strong>, enabling us to connect Madurai with audiences across the world through fast, accessible, and trusted digital media.
                </p>

                <p className="text-gray-700 leading-relaxed font-medium text-lg">
                  Our mission is to provide accurate, responsible, and community-focused journalism while embracing innovation to better serve our audience.
                </p>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-gray-700 mb-2">Warm Regards,</p>
                  <p className="text-gray-900 font-bold text-lg">M. Ramesh Kumar</p>
                  <p className="text-gray-600">Founder & Editor</p>
                  <p className="text-blue-600 font-medium">Hello Madurai</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
