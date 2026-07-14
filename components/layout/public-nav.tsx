"use client"

import { useState } from "react"
import Link from "next/link"

const LINKS = [
  { href: "/#product", label: "Product" },
  { href: "/templates", label: "Templates" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
]

/** The dismissible extension banner that sits above the nav on the landing page. */
function AnnouncementBar() {
  const [open, setOpen] = useState(true)
  if (!open) return null

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 bg-[#22322a] px-5 py-[11px] text-[14px] text-[#dfeae2]">
      <span className="rounded-[6px] bg-[#2e6a4a] px-2 py-[3px] font-mono text-[11px] tracking-[0.12em] text-[#eaf3ec]">
        NEW
      </span>

      <span>
        The ProfyleAI Chrome extension autofills any job application straight from your
        profile.
      </span>

      <Link href="/docs" className="font-semibold text-[#a9d3b7] hover:text-[#eaf3ec]">
        Add to Chrome →
      </Link>

      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Dismiss announcement"
        className="ml-1.5 cursor-pointer border-0 bg-none text-[15px] leading-none text-[#7f9a89] hover:text-[#dfeae2]"
      >
        ✕
      </button>
    </div>
  )
}

export function PublicNav({ announcement = false }: { announcement?: boolean }) {
  return (
    <header>
      {announcement && <AnnouncementBar />}

      <nav className="flex items-center justify-between gap-6 border-b border-[rgba(33,31,28,.08)] px-6 py-[22px] sm:px-14">
        <Link href="/" className="flex items-center gap-[11px]">
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-[#2e6a4a] font-display text-[20px] font-semibold text-[#f6f3ec]">
            P
          </span>
          <span className="text-[19px] font-bold tracking-[-0.01em] text-[#211f1c]">
            Profyle<span className="text-[#2e6a4a]">AI</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-8 text-[15px] text-[#4b463f] md:flex">
          {LINKS.map((link) => (
            <li key={link.label}>
              <Link href={link.href} className="hover:text-[#2e6a4a]">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-[18px]">
          <Link
            href="/login"
            className="text-[15px] font-medium text-[#211f1c] hover:text-[#2e6a4a]"
          >
            Log in
          </Link>

          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-[11px] bg-[#2e6a4a] px-[18px] py-[11px] text-[15px] font-semibold text-[#f4efe6] hover:bg-[#26583d]"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  )
}
