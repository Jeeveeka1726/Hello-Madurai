import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

export default function Card({ 
  children, 
  className = '', 
  hover = false,
  padding = 'md'
}: CardProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }

  return (
    <div
      className={`
        bg-white text-gray-900 rounded-xl shadow-lg border border-gray-200 backdrop-blur-sm
        ${hover ? 'hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover-lift' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`text-gray-600 ${className}`}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  )
}
