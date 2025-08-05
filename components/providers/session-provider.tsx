"use client"

import { SessionProvider } from "next-auth/react"

interface SessionProviderWrapperProps {
  children: React.ReactNode
}

export function SessionProviderWrapper({ children }: SessionProviderWrapperProps) {
  // Suppress console errors for session fetching when not authenticated
  const originalError = console.error
  const suppressNextAuthErrors = (...args: any[]) => {
    if (args[0]?.includes?.('CLIENT_FETCH_ERROR') || 
        args[0]?.includes?.('next-auth')) {
      return
    }
    originalError.apply(console, args)
  }
  
  if (typeof window !== 'undefined') {
    console.error = suppressNextAuthErrors
  }

  return (
    <SessionProvider 
      basePath="/api/auth"
      refetchInterval={5 * 60} // Refetch every 5 minutes
      refetchOnWindowFocus={true} // Refetch when window gains focus (important for mobile)
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  )
}