"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/templates", label: "Templates" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/help", label: "Help" },
]

/**
 * Dismissible announcement bar — dark evergreen, sits above the nav on the landing.
 */
function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="bg-brand-deep text-paper">
      <div className="mx-auto flex max-w-[1200px] items-center justify-center gap-3 px-6 py-2 text-[13px]">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand-on-dark">
          New
        </span>
        <p className="text-paper/85">
          Capture any job posting straight from LinkedIn with the ProfyleAI extension.
        </p>
        <Link
          href="/docs"
          className="font-medium text-brand-on-dark underline-offset-4 hover:underline"
        >
          Get it →
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss announcement"
          className="ml-2 rounded-full p-1 text-paper/60 transition-colors hover:text-paper"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>
    </div>
  )
}

interface PublicNavProps {
  /** Show the announcement bar (landing page only). */
  announcement?: boolean
}

export function PublicNav({ announcement = false }: PublicNavProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40">
      {announcement && <AnnouncementBar />}

      <nav className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-6">
          <Logo href="/" />

          <ul className="hidden items-center gap-8 md:flex">
            {LINKS.map((link) => {
              const active = pathname?.startsWith(link.href)
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-[14px] transition-colors",
                      active
                        ? "font-semibold text-brand"
                        : "text-ink-muted hover:text-ink"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-ink-muted hover:text-ink">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </nav>
    </header>
  )
}
