"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { useCredits } from "@/lib/hooks/use-credits"
import { openBuyCredits } from "@/lib/hooks/use-buy-credits"
import { cn } from "@/lib/utils"

/** The credit chip shown in every tool bar. Click to top up. */
export function CreditChip({ className }: { className?: string }) {
  const { balance, isLoading } = useCredits()

  return (
    <button
      type="button"
      onClick={() => openBuyCredits()}
      title="Buy credits"
      className={cn(
        "inline-flex items-center gap-[7px] rounded-[10px] bg-[#e7efe8] px-[13px] py-2 font-mono text-[13px] font-medium text-[#2e6a4a] transition-colors hover:bg-[#dbe7dd]",
        className
      )}
    >
      <span aria-hidden="true">◇</span>
      {isLoading ? "—" : (balance ?? 0)}
    </button>
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
 * The tool bar: a deliberately narrow chrome, so the work itself is the page.
 */
export function ToolTopBar({ title, backHref = "/dashboard", actions }: ToolTopBarProps) {
  return (
    <header className="flex h-[58px] shrink-0 items-center justify-between gap-4 border-b border-[rgba(33,31,28,.08)] bg-[#fffdf8] px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={backHref}
          aria-label="Back"
          className="flex h-8 w-8 items-center justify-center rounded-[9px] text-[17px] text-[#4b463f] transition-colors hover:bg-[#f1ede4]"
        >
          <span aria-hidden="true">←</span>
        </Link>

        <span
          aria-hidden="true"
          className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#2e6a4a] font-display text-[16px] font-semibold text-[#f6f3ec]"
        >
          P
        </span>

        <h1 className="truncate text-[15px] font-semibold text-[#211f1c]">{title}</h1>
      </div>

      <div className="flex items-center gap-2.5">
        {actions}
        <CreditChip />
      </div>
    </header>
  )
}
