"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

/**
 * Custom hook that handles mobile-specific session management issues
 * Addresses the common problem where mobile browsers don't immediately 
 * recognize the session after login
 */
export function useMobileSession() {
  const { data: session, status } = useSession()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && 
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    if (status === "loading") {
      setIsReady(false)
      return
    }

    if (isMobile) {
      // On mobile, add a small delay to ensure session is properly established
      const timer = setTimeout(() => {
        setIsReady(true)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      // On desktop, session should be immediately available
      setIsReady(true)
    }
  }, [session, status])

  return {
    session,
    status,
    isReady,
    isLoading: status === "loading" || !isReady
  }
}