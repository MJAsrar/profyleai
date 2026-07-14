import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Monogram, type MonogramTone } from "@/components/ui/monogram"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * The shared system states (design 5f).
 *
 * The app previously had none of these: empty lists rendered as nothing, failures
 * rendered as nothing (or a swallowed console error), and loading was a bare
 * full-page spinner. Every surface now has an honest state to fall back on.
 */

interface EmptyStateProps {
  /** Two-letter monogram, matching the tool this empty state belongs to. */
  code: string
  tone?: MonogramTone
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  code,
  tone = "neutral",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-card/50 px-6 py-14 text-center",
        className
      )}
    >
      <Monogram tone={tone} size="lg">
        {code}
      </Monogram>

      <h3 className="mt-4 font-sans text-[16px] font-bold text-ink">{title}</h3>

      {description && (
        <p className="mt-1.5 max-w-sm text-[14px] leading-relaxed text-ink-muted">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = "That didn't load",
  description = "Something went wrong on our side. Nothing you were working on has been lost.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-border bg-card px-6 py-14 text-center",
        className
      )}
      role="alert"
    >
      <Monogram tone="clay" size="lg">
        !
      </Monogram>

      <h3 className="mt-4 font-sans text-[16px] font-bold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[14px] leading-relaxed text-ink-muted">
        {description}
      </p>

      <div className="mt-5 flex gap-2">
        {onRetry && (
          <Button size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
        <Button asChild size="sm" variant="outline">
          <a href="/contact">Contact support</a>
        </Button>
      </div>
    </div>
  )
}

/**
 * Layout-shaped loading. Skeletons match the content that's coming, so the page
 * doesn't jump when it arrives — unlike a centred spinner.
 */
export function CardGridSkeleton({
  count = 6,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div
      className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-card border border-border bg-card p-5">
          <Skeleton className="h-10 w-10 rounded-[11px]" />
          <Skeleton className="mt-4 h-4 w-2/3" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-1.5 h-3 w-4/5" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  )
}

export function ListSkeleton({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-2.5", className)} role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-card border border-border bg-card p-4"
        >
          <Skeleton className="h-9 w-9 rounded-[10px]" />
          <div className="flex-1">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="mt-2 h-3 w-1/2" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  )
}
