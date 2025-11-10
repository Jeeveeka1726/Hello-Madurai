import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from '@/contexts/LanguageContext'
import { AdminProvider } from '@/contexts/AdminContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import PopupAds from '@/components/PopupAds'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ஹலோ மதுரை - உங்கள் உள்ளூர் செய்தி மற்றும் தகவல் மையம்",
  description: "மதுரையின் சமீபத்திய செய்திகள், நிகழ்வுகள், முகவரி நூல் மற்றும் உள்ளூர் தகவல்களை பெறுங்கள்",
  keywords: "மதுரை, தமிழ்நாடு, செய்திகள், நிகழ்வுகள், முகவரி நூல், உள்ளூர் தகவல்",
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
        {/* Pre-load language setting BEFORE React hydrates to prevent flash */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var savedLang=localStorage.getItem('hello-madurai-language');console.log('🔧 Pre-load script - savedLang:',savedLang);if(savedLang==='ta'||savedLang==='en'){window.__HELLO_MADURAI_LANG__=savedLang;console.log('🔧 Pre-load script - set window.__HELLO_MADURAI_LANG__ to:',savedLang);}else{console.log('🔧 Pre-load script - no valid language found');}}catch(e){console.error('Error loading language:',e);}})();`,
          }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        ></script>
        {/* Instagram Embed Script */}
        <script
          async
          src="https://www.instagram.com/embed.js"
        ></script>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <AdminProvider>
              {children}
              <PopupAds />
            </AdminProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
