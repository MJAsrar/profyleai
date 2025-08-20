"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useMobileSession } from "@/hooks/use-mobile-session"
import { useNavigationGuard } from "@/hooks/use-navigation-guard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, isLoading } = useMobileSession()
  const router = useRouter()
  
  // Apply navigation guard for interview protection
  useNavigationGuard()

  useEffect(() => {
    if (isLoading) return // Still loading or waiting for mobile session
    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
    }
  }, [session, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null // Redirect in progress
  }

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="flex flex-col min-h-screen overflow-x-hidden">
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
