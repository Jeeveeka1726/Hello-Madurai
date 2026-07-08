'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  CloudIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface WeatherData {
  temperature: number
  weatherCode: number
  humidity: number
  windSpeed: number
  description: string
  icon: string
}

interface Position {
  x: number
  y: number
}

export default function WeatherWidget() {
  const { language, t } = useLanguage()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const widgetRef = useRef<HTMLDivElement>(null)

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Madurai coordinates
  const MADURAI_LAT = 9.9252
  const MADURAI_LON = 78.1198

  const fetchWeather = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${MADURAI_LAT}&longitude=${MADURAI_LON}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia/Kolkata`,
        { next: { revalidate: 600 } } // Cache for 10 minutes
      )

      if (!response.ok) throw new Error('Failed to fetch weather')

      const data = await response.json()
      const current = data.current

      setWeather({
        temperature: Math.round(current.temperature_2m),
        weatherCode: current.weather_code,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        description: getWeatherDescription(current.weather_code, language),
        icon: getWeatherIcon(current.weather_code)
      })
    } catch (err) {
      setError(language === 'ta' ? 'வானிலை தரவு ஏற்ற முடியவில்லை' : 'Failed to load weather')
      console.error('Weather fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather()
    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 600000)
    return () => clearInterval(interval)
  }, [language])

  // Drag functionality - Mouse and Touch
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true)
    if (widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect()
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top
      })
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'BUTTON' || target.tagName === 'svg' || target.tagName === 'path') return
    e.preventDefault()
    handleStart(e.clientX, e.clientY)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'BUTTON' || target.tagName === 'svg' || target.tagName === 'path') return
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      e.preventDefault()
      updatePosition(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      e.preventDefault()
      const touch = e.touches[0]
      updatePosition(touch.clientX, touch.clientY)
    }

    const updatePosition = (clientX: number, clientY: number) => {
      const newX = clientX - dragOffset.x
      const newY = clientY - dragOffset.y

      const maxX = window.innerWidth - (widgetRef.current?.offsetWidth || 320)
      const maxY = window.innerHeight - (widgetRef.current?.offsetHeight || 100)

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      })
    }

    const handleEnd = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleEnd)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleEnd)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleEnd)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleEnd)
      }
    }
  }, [isDragging, dragOffset])

  const getWeatherDescription = (code: number, lang: string): string => {
    const descriptions: Record<number, { en: string; ta: string }> = {
      0: { en: 'Clear sky', ta: 'தெளிவான வானம்' },
      1: { en: 'Mainly clear', ta: 'பெரும்பாலும் தெளிவு' },
      2: { en: 'Partly cloudy', ta: 'பகுதி மேகமூட்டம்' },
      3: { en: 'Overcast', ta: 'முழு மேகமூட்டம்' },
      45: { en: 'Foggy', ta: 'மூடுபனி' },
      48: { en: 'Foggy', ta: 'மூடுபனி' },
      51: { en: 'Light drizzle', ta: 'லேசான தூறல்' },
      53: { en: 'Drizzle', ta: 'தூறல்' },
      55: { en: 'Heavy drizzle', ta: 'கடும் தூறல்' },
      61: { en: 'Light rain', ta: 'லேசான மழை' },
      63: { en: 'Rain', ta: 'மழை' },
      65: { en: 'Heavy rain', ta: 'கனமழை' },
      71: { en: 'Light snow', ta: 'லேசான பனி' },
      73: { en: 'Snow', ta: 'பனிப்பொழிவு' },
      75: { en: 'Heavy snow', ta: 'கடும் பனி' },
      80: { en: 'Rain showers', ta: 'மழை தூறல்' },
      81: { en: 'Rain showers', ta: 'மழை தூறல்' },
      82: { en: 'Heavy showers', ta: 'கனமழை தூறல்' },
      95: { en: 'Thunderstorm', ta: 'இடி மின்னல்' },
      96: { en: 'Thunderstorm', ta: 'இடி மின்னல்' },
      99: { en: 'Severe thunderstorm', ta: 'கடும் இடி மின்னல்' }
    }
    return descriptions[code]?.[lang] || (lang === 'ta' ? 'தெரியவில்லை' : 'Unknown')
  }

  const getWeatherIcon = (code: number): string => {
    if (code === 0) return '☀️'
    if (code <= 3) return '⛅'
    if (code <= 48) return '🌫️'
    if (code <= 55) return '🌦️'
    if (code <= 65) return '🌧️'
    if (code <= 75) return '❄️'
    if (code <= 82) return '🌧️'
    if (code >= 95) return '⛈️'
    return '🌤️'
  }

  if (!isVisible) return null

  if (isMinimized) {
    return (
      <div
        className="fixed z-[9999] backdrop-blur-md bg-blue-500/30 text-white rounded-full shadow-lg cursor-pointer hover:shadow-xl hover:bg-blue-500/40 transition-all p-2 sm:p-2.5 border border-white/30"
        onClick={() => setIsMinimized(false)}
        style={{
          top: position.y > 0 ? `${position.y}px` : '8px',
          right: position.x > 0 ? 'auto' : '8px',
          left: position.x > 0 ? `${position.x}px` : 'auto'
        }}
      >
        <CloudIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
    )
  }

  return (
    <div
      ref={widgetRef}
      className={`fixed z-[9999] backdrop-blur-md bg-white/60 rounded-xl shadow-2xl border border-white/50 overflow-hidden transition-shadow ${isDragging ? 'cursor-grabbing shadow-3xl' : 'cursor-grab hover:shadow-3xl'}`}
      style={{
        top: position.y > 0 ? `${position.y}px` : '8px',
        right: position.x > 0 ? 'auto' : '8px',
        left: position.x > 0 ? `${position.x}px` : 'auto',
        width: isMobile ? '260px' : '320px',
        userSelect: 'none',
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/50 to-blue-600/50 backdrop-blur-sm text-white px-2 sm:px-3 py-1 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <CloudIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
          <h3 className="font-semibold text-[9px] sm:text-[10px] whitespace-nowrap">
            {language === 'ta' ? 'மதுரை' : 'Madurai'}
          </h3>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation()
              fetchWeather()
            }}
            className="p-1 hover:bg-white/20 active:bg-white/30 rounded transition-colors touch-manipulation min-w-[24px] min-h-[24px] flex items-center justify-center"
            title={language === 'ta' ? 'புதுப்பிக்கவும்' : 'Refresh'}
          >
            <ArrowPathIcon className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsMinimized(true)
            }}
            className="p-1 hover:bg-white/20 active:bg-white/30 rounded transition-colors touch-manipulation min-w-[24px] min-h-[24px] flex items-center justify-center"
            title={language === 'ta' ? 'சிறிதாக்கு' : 'Minimize'}
          >
            <div className="h-3 w-3 flex items-center justify-center text-sm leading-none font-bold">−</div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-2 sm:px-3 py-1.5 sm:py-2">
        {loading && !weather ? (
          <div className="text-center py-1">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-[10px] sm:text-xs py-1">{error}</div>
        ) : weather ? (
          <>
            {/* Horizontal Layout - Temperature, Icon, Stats */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2.5">
              {/* Temperature & Description */}
              <div className="flex-shrink-0 min-w-0">
                <div className="text-lg sm:text-2xl font-bold text-gray-900 leading-none whitespace-nowrap">{weather.temperature}°C</div>
                <div className="text-[8px] sm:text-[10px] text-gray-800 mt-0.5 leading-none truncate max-w-[80px] sm:max-w-none">
                  {weather.description}
                </div>
              </div>

              {/* Weather Icon */}
              <div className="text-2xl sm:text-4xl flex-shrink-0 leading-none">{weather.icon}</div>

              {/* Additional Info - Vertical Stack */}
              <div className="flex flex-col gap-0.5 sm:gap-1 flex-shrink-0">
                <div className="text-center bg-white/40 rounded px-1.5 sm:px-2 py-0.5 sm:py-1">
                  <div className="text-[7px] sm:text-[8px] text-gray-700 uppercase tracking-tight font-medium leading-none whitespace-nowrap">
                    {language === 'ta' ? 'ஈரப்பதம்' : 'Humid'}
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-gray-900 leading-none mt-0.5">{weather.humidity}%</div>
                </div>
                <div className="text-center bg-white/40 rounded px-1.5 sm:px-2 py-0.5 sm:py-1">
                  <div className="text-[7px] sm:text-[8px] text-gray-700 uppercase tracking-tight font-medium leading-none whitespace-nowrap">
                    {language === 'ta' ? 'காற்று' : 'Wind'}
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-gray-900 leading-none mt-0.5 whitespace-nowrap">{weather.windSpeed}<span className="hidden sm:inline"> km/h</span></div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
