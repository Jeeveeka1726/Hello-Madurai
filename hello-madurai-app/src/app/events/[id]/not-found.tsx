'use client'

import Link from 'next/link'
import NewHeader from '@/components/layout/NewHeader'
import Button from '@/components/ui/Button'
import { useLanguage } from '@/contexts/LanguageContext'

export default function EventNotFound() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 dark:from-blue-950 dark:via-gray-900 dark:to-blue-900">
      <NewHeader />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4" suppressHydrationWarning>
            {t('events.notFound', 'Event Not Found', 'நிகழ்வு கிடைக்கவில்லை')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8" suppressHydrationWarning>
            {t('events.notFoundMessage', 'The event you are looking for does not exist or has been removed.', 'நீங்கள் தேடும் நிகழ்வு இல்லை அல்லது அகற்றப்பட்டது.')}
          </p>
          <Link href="/events">
            <Button className="text-lg py-3 px-6" suppressHydrationWarning>
              {t('events.backToEvents', 'Back to Events', 'நிகழ்வுகளுக்குத் திரும்பு')}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

