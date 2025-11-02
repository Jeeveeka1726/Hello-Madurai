'use client'

import { Toaster } from 'react-hot-toast'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AdminProvider } from '@/contexts/AdminContext'
import NewHeader from '@/components/layout/NewHeader'
import Footer from '@/components/layout/Footer'

interface AppWrapperProps {
  children: React.ReactNode
  showHeader?: boolean
  showFooter?: boolean
  noWrapper?: boolean
}

export default function AppWrapper({
  children,
  showHeader = true,
  showFooter = true,
  noWrapper = false
}: AppWrapperProps) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AdminProvider>
          {noWrapper ? (
            <>
              {showHeader && <NewHeader />}
              {children}
              {showFooter && <Footer />}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </>
          ) : (
            <>
              <div className="min-h-screen bg-white text-gray-900 transition-colors duration-300">
                {showHeader && <NewHeader />}
                <main>
                  {children}
                </main>
                {showFooter && <Footer />}
              </div>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </>
          )}
        </AdminProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
