"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useCredits } from "@/lib/hooks/use-credits"
import { cn } from "@/lib/utils"

/**
 * The dashboard sidebar, to the design.
 *
 * Nav is grouped under mono section labels so the tools read as a journey
 * (create → improve → practise) rather than an undifferentiated pile of links.
 */

const NAV_GROUPS = [
  {
    label: "CREATE",
    items: [
      { href: "/dashboard", label: "Dashboard", exact: true },
      { href: "/dashboard/resume-builder", label: "Résumé builder" },
      { href: "/dashboard/view-resumes", label: "My résumés" },
      { href: "/templates", label: "Templates" },
    ],
  },
  {
    label: "IMPROVE",
    items: [
      { href: "/dashboard/resume-tailoring", label: "Tailor to a job" },
      { href: "/dashboard/cover-letter", label: "Cover letter" },
    ],
  },
  {
    label: "PRACTICE",
    items: [
      { href: "/dashboard/interview", label: "Interview prep" },
      { href: "/dashboard/video-interview", label: "Voice interview" },
    ],
  },
]

/** The dark credit card that anchors the sidebar. */
function CreditsCard() {
  const { balance, isLoading } = useCredits()

  // A soft sense of runway. Full bar at 50 credits — the price of one voice interview.
  const pct = Math.min(100, Math.round(((balance ?? 0) / 50) * 100))

  return (
    <div className="rounded-[13px] bg-[#22322a] px-4 py-[15px]">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="font-mono text-[12px] text-[#a9b7ad]">◇ CREDITS</span>
        <span className="text-[17px] font-bold text-[#f4efe6]">
          {isLoading ? "—" : (balance ?? 0)}
        </span>
      </div>

      <div
        className="mb-3 h-[5px] overflow-hidden rounded-full bg-white/[.14]"
        role="progressbar"
        aria-valuenow={balance ?? 0}
        aria-valuemin={0}
        aria-valuemax={50}
        aria-label="Credit balance"
      >
        <div
          className="h-full rounded-full bg-[#8fc7a3] transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <Link
        href="/pricing"
        className="block rounded-[9px] bg-[#2e6a4a] py-[9px] text-center text-[13px] font-semibold text-[#f4efe6] hover:bg-[#357a56]"
      >
        Buy credits
      </Link>
    </div>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const name = session?.user?.name ?? "You"
  const initials =
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[rgba(33,31,28,.08)] bg-[#fffdf8] px-[18px] py-6">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-2 pb-[22px] pt-1">
        <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-[#2e6a4a] font-display text-[20px] font-semibold text-[#f6f3ec]">
          P
        </span>
        <span className="text-[18px] font-bold text-[#211f1c]">
          Profyle<span className="text-[#2e6a4a]">AI</span>
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto" aria-label="Main">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label}>
            <p
              className={cn(
                "px-2.5 pb-2 font-mono text-[10px] tracking-[0.14em] text-[#a79f93]",
                gi === 0 ? "pt-2.5" : "pt-4"
              )}
            >
              {group.label}
            </p>

            <ul>
              {group.items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname?.startsWith(item.href)

                return (
                  <li key={item.href} className="mb-0.5">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-[11px] rounded-[9px] p-2.5 text-[14px] transition-colors",
                        active
                          ? "bg-[#e7efe8] font-semibold text-[#22322a]"
                          : "text-[#4b463f] hover:bg-[#f1ede4]"
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "h-[7px] w-[7px] shrink-0 rounded-[2px]",
                          active ? "bg-[#2e6a4a]" : "bg-[#c9c2b6]"
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

      <div className="mt-auto flex flex-col gap-[14px] pt-4">
        <CreditsCard />

        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <span
            aria-hidden="true"
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#e7efe8] text-[14px] font-bold text-[#2e6a4a]"
          >
            {initials}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-[#211f1c]">{name}</p>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-[12px] text-[#8a837a] transition-colors hover:text-[#2e6a4a]"
            >
              Sign out
            </button>
          </div>

          <Link
            href="/dashboard/settings"
            aria-label="Settings"
            className="font-mono text-[11px] text-[#8a837a] transition-colors hover:text-[#2e6a4a]"
          >
            <span aria-hidden="true">⚙</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}
