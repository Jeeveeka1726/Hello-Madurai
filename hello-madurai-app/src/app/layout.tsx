import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from '@/contexts/LanguageContext'
import { AdminProvider } from '@/contexts/AdminContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { RadioPlayerProvider } from '@/contexts/RadioPlayerContext'
import PopupAds from '@/components/PopupAds'
import GlobalRadioPlayer from '@/components/GlobalRadioPlayer'
import ConditionalFooter from '@/components/layout/ConditionalFooter'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ஹலோ மதுரை - உங்கள் உள்ளூர் செய்தி மற்றும் தகவல் மையம்",
  description: "மதுரையின் சமீபத்திய செய்திகள், நிகழ்வுகள், வணிக முகவரி மற்றும் உள்ளூர் தகவல்களை பெறுங்கள்",
  keywords: "மதுரை, தமிழ்நாடு, செய்திகள், நிகழ்வுகள், வணிக முகவரி, உள்ளூர் தகவல்",
  icons: {
    icon: [
      { url: '/favicon.ico?v=3', sizes: '32x32' },
      { url: '/hello-madurai-icon.ico?v=3', sizes: '32x32' },
      { url: '/favicon-16x16.png?v=3', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png?v=3', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=3', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=3',
  },
  manifest: '/manifest.json',
  other: {
    'google': 'notranslate',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ta" translate="no" suppressHydrationWarning>
      <head suppressHydrationWarning>
        {/* Mobile viewport optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        {/* Disable browser auto-translate */}
        <meta name="google" content="notranslate" />
        {/* Favicon links - Hello Madurai Logo */}
        <link rel="icon" href="/favicon.ico?v=3" type="image/x-icon" />
        <link rel="icon" href="/hello-madurai-icon.ico?v=3" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png?v=3" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png?v=3" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" sizes="180x180" />
        <meta name="theme-color" content="#2563eb" />
        {/* Pre-load language setting BEFORE React hydrates to prevent flash */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var savedLang=localStorage.getItem('hello-madurai-language');console.log('🔧 Pre-load script - savedLang:',savedLang);if(savedLang==='ta'||savedLang==='en'){window.__HELLO_MADURAI_LANG__=savedLang;console.log('🔧 Pre-load script - set window.__HELLO_MADURAI_LANG__ to:',savedLang);}else{console.log('🔧 Pre-load script - defaulting to Tamil');window.__HELLO_MADURAI_LANG__='ta';localStorage.setItem('hello-madurai-language','ta');}}catch(e){console.error('Error loading language:',e);}})();`,
          }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <AdminProvider>
              <RadioPlayerProvider>
                <div className="min-h-screen flex flex-col">
                  <main className="flex-grow">
                    {children}
                  </main>
                  <ConditionalFooter />
                </div>
                <PopupAds />
                <GlobalRadioPlayer />
              </RadioPlayerProvider>
            </AdminProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
