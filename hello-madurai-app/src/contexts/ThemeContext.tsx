'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  mounted: false
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // Initialize theme
  useEffect(() => {
    const initializeTheme = () => {
      try {
        // Check localStorage first
        const savedTheme = localStorage.getItem('hello-madurai-theme')
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setTheme(savedTheme)
          applyTheme(savedTheme)
        } else {
          // Default to light mode (ignore system preference for now)
          setTheme('light')
          applyTheme('light')
          localStorage.setItem('hello-madurai-theme', 'light')
        }
      } catch (error) {
        console.log('Theme initialization error:', error)
        setTheme('light')
        applyTheme('light')
      }
      setMounted(true)
    }

    initializeTheme()
  }, [])

  const applyTheme = (newTheme: Theme) => {
    try {
      const root = document.documentElement
      const body = document.body

      if (newTheme === 'dark') {
        root.classList.add('dark')
        body.classList.add('dark')
        root.style.colorScheme = 'dark'
      } else {
        root.classList.remove('dark')
        body.classList.remove('dark')
        root.style.colorScheme = 'light'
      }
    } catch (error) {
      console.log('Theme application error:', error)
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyTheme(newTheme)

    try {
      localStorage.setItem('hello-madurai-theme', newTheme)
    } catch (error) {
      console.log('Theme save error:', error)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  return context
}
