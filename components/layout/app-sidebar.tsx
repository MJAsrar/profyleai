"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { useCredits } from "@/lib/hooks/use-credits"
import { cn } from "@/lib/utils"

/**
 * Dashboard sidebar.
 *
 * Nav is grouped under mono section labels so the six tools read as a journey
 * (create → improve → practise) rather than an undifferentiated pile of links —
 * which is how the old six-identical-cards dashboard felt.
 */

const NAV_GROUPS = [
  {
    label: "Create",
    items: [
      { href: "/dashboard/resume-builder", label: "Résumé builder" },
      { href: "/dashboard/view-resumes", label: "My résumés" },
    ],
  },
  {
    label: "Improve",
    items: [
      { href: "/dashboard/resume-tailoring", label: "Tailor to a job" },
      { href: "/dashboard/cover-letter", label: "Cover letter" },
    ],
  },
  {
    label: "Practise",
    items: [
      { href: "/dashboard/interview", label: "Interview prep" },
      { href: "/dashboard/video-interview", label: "Voice interview" },
    ],
  },
]

/** Dark evergreen credit card that anchors the sidebar. */
function CreditCard() {
  const { balance, isLoading } = useCredits()

  // A soft sense of "how much runway is left" — full at 100 credits.
  const pct = Math.min(100, Math.round(((balance ?? 0) / 100) * 100))

  return (
    <div className="rounded-card bg-brand-deep p-4 text-paper">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand-on-dark">
          Credits
        </span>
        <span className="font-display text-[22px] leading-none">
          {isLoading ? "—" : balance ?? 0}
        </span>
      </div>

      <div
        className="mt-3 h-1 overflow-hidden rounded-full bg-paper/15"
        role="progressbar"
        aria-valuenow={balance ?? 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Credit balance"
      >
        <div
          className="h-full rounded-full bg-brand-on-dark transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <Button asChild variant="onDark" size="sm" className="mt-3.5 w-full">
        <Link href="/pricing">Buy credits</Link>
      </Button>
    </div>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const name = session?.user?.name ?? "You"
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="px-5 py-5">
        <Logo href="/dashboard" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3" aria-label="Main">
        <Link
          href="/dashboard"
          className={cn(
            "mb-3 flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[14px] transition-colors",
            pathname === "/dashboard"
              ? "bg-brand-tint font-semibold text-brand-deep"
              : "text-ink-muted hover:bg-section-tint hover:text-ink"
          )}
          aria-current={pathname === "/dashboard" ? "page" : undefined}
        >
          <span
            aria-hidden="true"
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              pathname === "/dashboard" ? "bg-brand" : "bg-ink-faint-2"
            )}
          />
          Home
        </Link>

        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-3 pb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint-2">
              {group.label}
            </p>

            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname?.startsWith(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[14px] transition-colors",
                        active
                          ? "bg-brand-tint font-semibold text-brand-deep"
                          : "text-ink-muted hover:bg-section-tint hover:text-ink"
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "h-1.5 w-1.5 rotate-45",
                          active ? "bg-brand" : "bg-ink-faint-2"
                        )}
                      />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-3 p-3">
        <CreditCard />

        <div className="flex items-center gap-2.5 rounded-[10px] px-2 py-1.5">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-tint font-mono text-[11px] font-bold text-brand"
          >
            {initials || "?"}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-ink">{name}</p>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint transition-colors hover:text-brand"
            >
              Sign out
            </button>
          </div>

          <Link
            href="/dashboard/settings"
            aria-label="Settings"
            className="rounded-[8px] p-1.5 text-ink-faint transition-colors hover:bg-section-tint hover:text-ink"
          >
            <span aria-hidden="true">⚙</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}
