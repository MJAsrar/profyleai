import Link from "next/link"

const LINKS = [
  { href: "/#product", label: "Product" },
  { href: "/pricing", label: "Pricing" },
  { href: "/templates", label: "Templates" },
  { href: "/docs", label: "Docs" },
  { href: "/privacy", label: "Privacy" },
]

/** Quiet marketing footer — a mark, a line of copyright, and five links. */
export function SiteFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 bg-[#f6f3ec] px-6 py-8 sm:px-14">
      <div className="flex items-center gap-2.5 text-[13px] text-[#8a837a]">
        <span className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-[#2e6a4a] font-display text-[13px] text-[#f6f3ec]">
          P
        </span>
        © 2026 ProfyleAI
      </div>

      <div className="flex flex-wrap gap-[22px] text-[13px] text-[#6f685f]">
        {LINKS.map((link) => (
          <Link key={link.label} href={link.href} className="hover:text-[#2e6a4a]">
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  )
}
