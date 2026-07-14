"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { LogoMark } from "@/components/ui/logo"
import { useCredits } from "@/lib/hooks/use-credits"
import { cn } from "@/lib/utils"

/** The credit chip shown in every focused tool bar. */
export function CreditChip({ className }: { className?: string }) {
  const { balance, isLoading } = useCredits()

  return (
    <Link
      href="/pricing"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[11px] tracking-[0.06em] text-ink-muted transition-colors hover:border-brand hover:text-brand",
        className
      )}
      title="Buy credits"
    >
      <span aria-hidden="true" className="text-brand">
        ◇
      </span>
      {isLoading ? "—" : `${balance ?? 0} credits`}
    </Link>
  )
}

interface ToolTopBarProps {
  title: string
  /** Where the back arrow goes. Defaults to the dashboard. */
  backHref?: string
  /** Right-hand controls (Export, Preview, Style…). */
  actions?: ReactNode
}

/**
 * The focused top bar used by the builder and every AI tool — a deliberately
 * narrow chrome so the work itself is the page.
 */
export function ToolTopBar({ title, backHref = "/dashboard", actions }: ToolTopBarProps) {
  return (
    <header className="flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-5">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={backHref}
          aria-label="Back to dashboard"
          className="rounded-[9px] p-1.5 text-ink-muted transition-colors hover:bg-section-tint hover:text-ink"
        >
          <span aria-hidden="true">←</span>
        </Link>

        <LogoMark className="h-7 w-7 rounded-[8px] text-[15px]" />

        <h1 className="truncate font-sans text-[15px] font-bold tracking-normal text-ink">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {actions}
        <CreditChip />
      </div>
    </header>
  )
}
