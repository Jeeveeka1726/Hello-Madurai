'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function SSLHelpPage() {
  const { language } = useLanguage()

  const content = {
    en: {
      title: 'Security Error Help',
      subtitle: 'Seeing a security warning? Here\'s how to fix it.',
      issue: 'The Issue',
      issueDesc: 'You may see a security error like "Your connection is not private" or "NET::ERR_CERT_COMMON_NAME_INVALID". This is because your browser has cached old security settings from before our recent server upgrade.',
      solution: 'The Solution',
      chrome: 'Google Chrome',
      chromeSteps: [
        'Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)',
        'Select "All time" as the time range',
        'Check "Cookies and other site data" and "Cached images and files"',
        'Click "Clear data"',
        'Restart Chrome',
        'Visit hellomadurai.com again'
      ],
      firefox: 'Mozilla Firefox',
      firefoxSteps: [
        'Click menu (☰) → Settings',
        'Go to Privacy & Security',
        'Scroll to "Cookies and Site Data"',
        'Click "Clear Data..."',
        'Check both boxes and click "Clear"',
        'Restart Firefox',
        'Visit hellomadurai.com again'
      ],
      safari: 'Safari (Mac/iPhone)',
      safariSteps: [
        'Safari → Settings → Privacy',
        'Click "Manage Website Data..."',
        'Search for "hellomadurai"',
        'Click "Remove"',
        'Restart Safari',
        'Visit hellomadurai.com again'
      ],
      mobile: 'Mobile Browsers',
      mobileSteps: [
        'Go to Settings → Apps → Your Browser',
        'Tap Storage',
        'Tap "Clear Cache"',
        'Tap "Clear Data"',
        'Restart your browser',
        'Visit hellomadurai.com again'
      ],
      alternative: 'Quick Alternative',
      alternativeDesc: 'Try opening the website in Incognito/Private mode. If it works there, the issue is definitely browser cache.',
      stillIssue: 'Still Having Issues?',
      contact: 'Contact us at: support@hellomadurai.com',
      secure: 'Your Security Matters',
      secureDesc: 'We recently upgraded our servers for better security and performance. Our website uses industry-standard SSL encryption to protect your data. The security error you\'re seeing is temporary and only affects browsers that visited our site before the upgrade.'
    },
    ta: {
      title: 'பாதுகாப்பு பிழை உதவி',
      subtitle: 'பாதுகாப்பு எச்சரிக்கையைக் காண்கிறீர்களா? இதை எவ்வாறு சரிசெய்வது என்பது இங்கே.',
      issue: 'பிரச்சினை',
      issueDesc: '"உங்கள் இணைப்பு தனிப்பட்டதல்ல" அல்லது "NET::ERR_CERT_COMMON_NAME_INVALID" போன்ற பாதுகாப்பு பிழையைக் காணலாம். எங்கள் சமீபத்திய சேவையக மேம்படுத்தலுக்கு முன்பு உங்கள் உலாவி பழைய பாதுகாப்பு அமைப்புகளை தற்காலிக சேமிப்பில் வைத்திருப்பதால் இது நிகழ்கிறது.',
      solution: 'தீர்வு',
      chrome: 'கூகுள் குரோம்',
      chromeSteps: [
        'Ctrl+Shift+Delete (Windows) அல்லது Cmd+Shift+Delete (Mac) அழுத்தவும்',
        'நேர வரம்பாக "எல்லா நேரமும்" தேர்ந்தெடுக்கவும்',
        '"குக்கீகள் மற்றும் பிற தள தரவு" மற்றும் "தற்காலிக சேமிப்பு படங்கள் மற்றும் கோப்புகள்" தேர்வு செய்யவும்',
        '"தரவை அழி" என்பதைக் கிளிக் செய்யவும்',
        'குரோமை மறுதொடக்கம் செய்யவும்',
        'hellomadurai.com ஐ மீண்டும் பார்வையிடவும்'
      ],
      firefox: 'மொசில்லா பயர்பாக்ஸ்',
      firefoxSteps: [
        'மெனு (☰) → அமைப்புகள் என்பதைக் கிளிக் செய்யவும்',
        'தனியுரிமை & பாதுகாப்புக்கு செல்லவும்',
        '"குக்கீகள் மற்றும் தள தரவு" க்கு உருட்டவும்',
        '"தரவை அழி..." என்பதைக் கிளிக் செய்யவும்',
        'இரண்டு பெட்டிகளையும் தேர்வு செய்து "அழி" என்பதைக் கிளிக் செய்யவும்',
        'பயர்பாக்ஸை மறுதொடக்கம் செய்யவும்',
        'hellomadurai.com ஐ மீண்டும் பார்வையிடவும்'
      ],
      safari: 'சபாரி (Mac/iPhone)',
      safariSteps: [
        'சபாரி → அமைப்புகள் → தனியுரிமை',
        '"இணையதள தரவை நிர்வகி..." என்பதைக் கிளிக் செய்யவும்',
        '"hellomadurai" ஐத் தேடவும்',
        '"அகற்று" என்பதைக் கிளிக் செய்யவும்',
        'சபாரியை மறுதொடக்கம் செய்யவும்',
        'hellomadurai.com ஐ மீண்டும் பார்வையிடவும்'
      ],
      mobile: 'மொபைல் உலாவிகள்',
      mobileSteps: [
        'அமைப்புகள் → பயன்பாடுகள் → உங்கள் உலாவிக்கு செல்லவும்',
        'சேமிப்பகத்தைத் தட்டவும்',
        '"தற்காலிக சேமிப்பை அழி" என்பதைத் தட்டவும்',
        '"தரவை அழி" என்பதைத் தட்டவும்',
        'உங்கள் உலாவியை மறுதொடக்கம் செய்யவும்',
        'hellomadurai.com ஐ மீண்டும் பார்வையிடவும்'
      ],
      alternative: 'விரைவு மாற்று',
      alternativeDesc: 'இன்காக்னிட்டோ/தனிப்பட்ட பயன்முறையில் இணையதளத்தைத் திறக்க முயற்சிக்கவும். அங்கு வேலை செய்தால், பிரச்சினை நிச்சயமாக உலாவி தற்காலிக சேமிப்பு.',
      stillIssue: 'இன்னும் சிக்கல்கள் உள்ளதா?',
      contact: 'எங்களை தொடர்பு கொள்ளவும்: support@hellomadurai.com',
      secure: 'உங்கள் பாதுகாப்பு முக்கியம்',
      secureDesc: 'சிறந்த பாதுகாப்பு மற்றும் செயல்திறனுக்காக நாங்கள் சமீபத்தில் எங்கள் சேவையகங்களை மேம்படுத்தியுள்ளோம். உங்கள் தரவைப் பாதுகாக்க எங்கள் இணையதளம் தொழில்துறை-தரநிலை SSL குறியாக்கத்தைப் பயன்படுத்துகிறது. நீங்கள் காணும் பாதுகாப்பு பிழை தற்காலிகமானது மற்றும் மேம்படுத்தலுக்கு முன்பு எங்கள் தளத்தைப் பார்வையிட்ட உலாவிகளை மட்டுமே பாதிக்கிறது.'
    }
  }

  const t = content[language as keyof typeof content]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{t.title}</h1>
            <p className="text-lg text-gray-600">{t.subtitle}</p>
          </div>
        </div>

        {/* Issue Explanation */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-yellow-800 mb-3">⚠️ {t.issue}</h2>
          <p className="text-yellow-700">{t.issueDesc}</p>
        </div>

        {/* Solutions */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">✅ {t.solution}</h2>

          {/* Chrome */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-blue-600 mb-4">🌐 {t.chrome}</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              {t.chromeSteps.map((step, index) => (
                <li key={index} className="ml-4">{step}</li>
              ))}
            </ol>
          </div>

          {/* Firefox */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-orange-600 mb-4">🦊 {t.firefox}</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              {t.firefoxSteps.map((step, index) => (
                <li key={index} className="ml-4">{step}</li>
              ))}
            </ol>
          </div>

          {/* Safari */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-blue-500 mb-4">🧭 {t.safari}</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              {t.safariSteps.map((step, index) => (
                <li key={index} className="ml-4">{step}</li>
              ))}
            </ol>
          </div>

          {/* Mobile */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-green-600 mb-4">📱 {t.mobile}</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              {t.mobileSteps.map((step, index) => (
                <li key={index} className="ml-4">{step}</li>
              ))}
            </ol>
          </div>
        </div>

        {/* Alternative */}
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-blue-800 mb-2">💡 {t.alternative}</h3>
          <p className="text-blue-700">{t.alternativeDesc}</p>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-3">❓ {t.stillIssue}</h3>
          <p className="text-gray-600 mb-4">{t.contact}</p>
        </div>

        {/* Security Info */}
        <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-800 mb-2">🛡️ {t.secure}</h3>
          <p className="text-green-700">{t.secureDesc}</p>
        </div>
      </div>
    </div>
  )
}

