'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon, LanguageIcon } from '@heroicons/react/24/outline'

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const [locale, setLocale] = useState('en')

  useEffect(() => {
    // Extract locale from pathname
    const pathLocale = pathname.split('/')[1]
    if (pathLocale === 'ta' || pathLocale === 'en') {
      setLocale(pathLocale)
    }
  }, [pathname])

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]

  const switchLanguage = (newLocale: string) => {
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
    // Navigate to the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`)
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          <LanguageIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          <span className="hidden sm:block">{currentLanguage.nativeName}</span>
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {languages.map((language) => (
              <Menu.Item key={language.code}>
                {({ active }) => (
                  <button
                    onClick={() => switchLanguage(language.code)}
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      locale === language.code ? 'bg-indigo-50 text-indigo-600' : '',
                      'block w-full px-4 py-2 text-left text-sm'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{language.nativeName}</span>
                      {locale === language.code && (
                        <span className="text-indigo-600">✓</span>
                      )}
                    </div>
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
