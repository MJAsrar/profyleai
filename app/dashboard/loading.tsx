import { Skeleton } from '@/components/ui/skeleton'

/**
 * Layout-shaped loading state for the dashboard. Replaces a bare full-page spinner:
 * the skeleton matches the real content, so the page doesn't jump when it arrives.
 */
export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-8" role="status" aria-label="Loading dashboard">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>

      <span className="sr-only">Loading your dashboard…</span>
    </div>
  )
}
