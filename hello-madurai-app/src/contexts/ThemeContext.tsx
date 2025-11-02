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
  const [theme, setThemeState] = useState<Theme>('dark') // Always dark theme

  useEffect(() => {
    // ALWAYS force dark theme - Hello Madurai is dark blue themed
    setThemeState('dark')
    // Clear any saved light theme preference
    localStorage.setItem('theme', 'dark')
  }, [])

  useEffect(() => {
    // Apply dark theme to document - ALWAYS
    document.documentElement.classList.remove('light')
    document.documentElement.classList.add('dark')

    // Save to localStorage - ALWAYS dark
    localStorage.setItem('theme', 'dark')
  }, [theme])

  const toggleTheme = () => {
    // Do nothing - always stay dark
    setThemeState('dark')
  }

  const setTheme = (newTheme: Theme) => {
    // Always force dark theme regardless of input
    setThemeState('dark')
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