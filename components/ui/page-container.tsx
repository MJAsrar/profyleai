"use client"

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  center?: boolean
}

export function PageContainer({ 
  children, 
  className = "",
  maxWidth = 'full',
  padding = 'md',
  center = true
}: PageContainerProps) {
  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md', 
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full'
  }

  const paddingClasses = {
    'none': '',
    'sm': 'px-3 py-2 sm:px-6 sm:py-4',
    'md': 'px-3 py-3 sm:px-6 sm:py-6 lg:px-8 lg:py-8',
    'lg': 'px-3 py-4 sm:px-6 sm:py-8 lg:px-8 lg:py-12',
    'xl': 'px-3 py-6 sm:px-6 sm:py-12 lg:px-8 lg:py-16'
  }

  return (
    <div className={cn(
      "w-full",
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      center && "mx-auto",
      className
    )}>
      {children}
    </div>
  )
}

interface SectionProps {
  children: ReactNode
  className?: string
  spacing?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Section({ 
  children, 
  className = "",
  spacing = 'lg'
}: SectionProps) {
  const spacingClasses = {
    'sm': 'py-8 sm:py-12',
    'md': 'py-12 sm:py-16',
    'lg': 'py-16 sm:py-20 lg:py-24',
    'xl': 'py-20 sm:py-24 lg:py-32'
  }

  return (
    <section className={cn(
      spacingClasses[spacing],
      className
    )}>
      {children}
    </section>
  )
}