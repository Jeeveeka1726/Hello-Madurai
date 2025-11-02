'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light') // Always light theme

  useEffect(() => {
    // ALWAYS force light theme - Hello Madurai is white themed
    setThemeState('light')
    // Clear any saved dark theme preference
    localStorage.setItem('theme', 'light')
  }, [])

  useEffect(() => {
    // Apply light theme to document - ALWAYS
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')

    // Save to localStorage - ALWAYS light
    localStorage.setItem('theme', 'light')
  }, [theme])

  const toggleTheme = () => {
    // Do nothing - always stay light
    setThemeState('light')
  }

  const setTheme = (newTheme: Theme) => {
    // Always force light theme regardless of input
    setThemeState('light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}