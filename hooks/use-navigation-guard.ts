"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useNavigationGuard() {
  const router = useRouter()

  useEffect(() => {
    // Override the router push method to check for active interview
    const originalPush = router.push
    
    router.push = (href: string, options?: any) => {
      // Check if interview is active
      if ((window as any).__resumeAid_interviewActive) {
        console.log('🚫 Navigation blocked - interview active:', href)
        
        // Store the intended navigation target
        if ((window as any).__resumeAid_showExitDialog) {
          // Set pending navigation for the dialog
          const setShowDialog = (window as any).__resumeAid_showExitDialog
          const setPendingNav = (window as any).__resumeAid_setPendingNavigation
          
          if (setPendingNav) {
            setPendingNav(href)
          }
          
          setShowDialog()
          return Promise.resolve(true) // Return resolved promise to match router.push signature
        }
        
        return Promise.resolve(true)
      }
      
      // If no interview active, proceed with navigation
      return originalPush.call(router, href, options)
    }

    // Cleanup function
    return () => {
      // Restore original router push (though this rarely gets called)
      router.push = originalPush
    }
  }, [router])
}
