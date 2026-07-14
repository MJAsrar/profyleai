import Link from "next/link"
import { LogoMark } from "@/components/ui/logo"

const LINKS = [
  { href: "/templates", label: "Templates" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/help", label: "Help" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
]

/** Quiet marketing footer — a single hairline rule, no heavy link farm. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-paper">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-6">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-6 w-6 rounded-[7px] text-[13px]" />
          <span className="font-mono text-[11px] tracking-[0.06em] text-ink-faint">
            © {new Date().getFullYear()} ProfyleAI
          </span>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[13px] text-ink-muted transition-colors hover:text-brand"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
