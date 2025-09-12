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
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div 
      className={`
        bg-white dark:bg-purple-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-lg border border-gray-200 dark:border-purple-800 backdrop-blur-sm
        ${hover ? 'hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover-lift' : ''}
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
    <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`text-gray-600 dark:text-gray-300 ${className}`}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`mt-4 pt-4 border-t border-white-800 dark:border-primary-700 ${className}`}>
      {children}
    </div>
  )
}
