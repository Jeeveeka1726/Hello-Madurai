import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from '@/contexts/LanguageContext'
import { AdminProvider } from '@/contexts/AdminContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import PopupAds from '@/components/PopupAds'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hello Madurai - Your Local News & Information Hub",
  description: "Stay connected with Madurai's latest news, events, directory, and local information in Tamil and English",
  keywords: "Madurai, Tamil Nadu, News, Events, Directory, Local Information",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={`${inter.className} dark`}>
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
