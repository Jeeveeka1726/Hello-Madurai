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
}

export default function AppWrapper({ 
  children, 
  showHeader = true, 
  showFooter = true 
}: AppWrapperProps) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AdminProvider>
          <div className="min-h-screen bg-white dark:bg-purple-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
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
        </AdminProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
