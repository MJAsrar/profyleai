"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { BuyCreditsHost } from "@/components/credits/buy-credits-host"
import { useMobileSession } from "@/hooks/use-mobile-session"
import { useNavigationGuard } from "@/hooks/use-navigation-guard"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, isLoading } = useMobileSession()
  const router = useRouter()

  // Protects an in-progress interview from being navigated away from.
  useNavigationGuard()

  useEffect(() => {
    if (isLoading) return
    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
    }
  }, [session, isLoading, router])

  // Layout-shaped loading rather than a bare centred spinner: the sidebar and
  // content skeleton hold their place, so nothing jumps when the session lands.
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-paper" role="status" aria-label="Loading">
        <div className="hidden w-64 shrink-0 border-r border-border bg-card p-5 md:block">
          <Skeleton className="h-8 w-32" />
          <div className="mt-8 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-3 h-4 w-96" />
        </div>
        <span className="sr-only">Loading…</span>
      </div>
    )
  }

  if (!session) {
    return null // Redirect in progress
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <div className="sticky top-0 hidden h-screen md:block">
        <AppSidebar />
      </div>

      <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        {children}
      </main>

      {/* One purchase modal for every "Buy credits" surface below the dashboard. */}
      <BuyCreditsHost />
    </div>
  )
}
