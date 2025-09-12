'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppWrapper from '@/components/AppWrapper'
import { useAdmin } from '@/contexts/AdminContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

function AdminLoginPageContent() {
  const { t } = useLanguage()
  const { login } = useAdmin()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const success = login(password)
    
    if (success) {
      router.push('/admin')
    } else {
      setError('Invalid password. Please try again.')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Hello Madurai
          </h1>
          <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-4">
            {t('admin.login.title', 'Admin Login', 'நிர்வாக உள்நுழைவு')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {t('admin.login.subtitle', 'Enter your password to access the admin dashboard', 'நிர்வாக டாஷ்போர்டை அணுக உங்கள் கடவுச்சொல்லை உள்ளிடவும்')}
          </p>
        </div>

        <Card className="bg-white dark:bg-gray-800 shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-900 dark:text-white">
              {t('admin.login.form.title', 'Secure Access', 'பாதுகாப்பான அணுகல்')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.login.password', 'Admin Password', 'நிர்வாக கடவுச்சொல்')}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder={t('admin.login.placeholder', 'Enter admin password', 'நிர்வாக கடவுச்சொல்லை உள்ளிடவும்')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !password}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {t('admin.login.logging', 'Logging in...', 'உள்நுழைகிறது...')}
                  </div>
                ) : (
                  t('admin.login.button', 'Access Admin Dashboard', 'நிர்வாக டாஷ்போர்டை அணுகவும்')
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <button
                  onClick={() => router.push('/')}
                  className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium"
                >
                  ← {t('admin.login.back', 'Back to Website', 'வலைத்தளத்திற்கு திரும்பு')}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('admin.login.security', 'This is a secure admin area. Unauthorized access is prohibited.', 'இது ஒரு பாதுகாப்பான நிர்வாக பகுதி. அங்கீகரிக்கப்படாத அணுகல் தடைசெய்யப்பட்டுள்ளது.')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <AppWrapper>
      <AdminLoginPageContent />
    </AppWrapper>
  )
}
