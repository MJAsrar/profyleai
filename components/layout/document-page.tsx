"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PublicNav } from "@/components/layout/public-nav"
import { SiteFooter } from "@/components/layout/site-footer"
import { cn } from "@/lib/utils"

export interface DocSection {
  id: string
  heading: string
  body: ReactNode
}

/**
 * The shell for the legal documents, on the prototype's three-column layout: the other
 * documents on the left, the text in the middle, an on-this-page rail on the right.
 *
 * This used to render the old `Header`/`Footer`, which is why terms, privacy, security and
 * cookies were still wearing the pre-redesign chrome after everything else had moved.
 */

const DOCUMENTS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/security", label: "Security" },
]

export function DocumentPage({
  title,
  summary,
  updated,
  sections,
}: {
  title: string
  /** One honest sentence about what this document is. Not marketing. */
  summary: string
  updated: string
  sections: DocSection[]
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#f6f3ec]">
      <div className="mx-auto w-full max-w-[1440px] bg-[#f6f3ec]">
        <PublicNav />

        <div className="grid lg:grid-cols-[264px_1fr_220px]">
          {/* ---- The other documents ---- */}
          <nav
            aria-label="Legal documents"
            className="border-b border-[rgba(33,31,28,.08)] bg-[#fffdf8] px-[18px] py-6 lg:sticky lg:top-0 lg:h-screen lg:overflow-auto lg:border-b-0 lg:border-r"
          >
            <p className="px-2.5 pb-1.5 pt-1.5 font-mono text-[10px] tracking-[0.14em] text-[#a79f93]">
              LEGAL
            </p>

            <ul>
              {DOCUMENTS.map((doc) => {
                const active = pathname === doc.href

                return (
                  <li key={doc.href} className="mb-0.5">
                    <Link
                      href={doc.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block rounded-[8px] px-2.5 py-2 text-[13.5px] transition-colors",
                        active
                          ? "bg-[#e7efe8] font-semibold text-[#22322a]"
                          : "text-[#4b463f] hover:bg-[#f1ede4]"
                      )}
                    >
                      {doc.label}
                    </Link>
                  </li>
                )
              })}
            </ul>

            <p className="mt-5 border-t border-[rgba(33,31,28,.08)] px-2.5 pt-4 font-mono text-[11px] leading-relaxed text-[#8a837a]">
              Last updated · {updated}
            </p>
          </nav>

          {/* ---- The document ---- */}
          <article className="min-w-0 bg-[#f6f3ec] px-6 py-10 sm:px-14">
            <h1 className="mb-4 font-display text-[34px] font-medium leading-[1.08] text-[#211f1c] sm:text-[42px]">
              {title}
            </h1>

            <p className="max-w-[620px] text-[16px] leading-[1.7] text-[#4b463f]">{summary}</p>

            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-8">
                <h2 className="mb-2.5 mt-8 text-[20px] font-bold text-[#211f1c]">
                  {section.heading}
                </h2>

                <div
                  className={[
                    "max-w-[620px] space-y-4 text-[15px] leading-[1.7] text-[#4b463f]",
                    "[&_a]:font-semibold [&_a]:text-[#2e6a4a] [&_a]:underline [&_a]:underline-offset-4",
                    "[&_strong]:font-semibold [&_strong]:text-[#211f1c]",
                    "[&_ul]:space-y-2 [&_ul]:pl-5 [&_li]:list-disc [&_li]:marker:text-[#c9c2b6]",
                  ].join(" ")}
                >
                  {section.body}
                </div>
              </section>
            ))}

            <p className="mt-10 max-w-[620px] border-t border-[rgba(33,31,28,.1)] pt-5 text-[14px] text-[#8a837a]">
              Questions about any of this?{" "}
              <Link
                href="/contact"
                className="font-semibold text-[#2e6a4a] underline underline-offset-4"
              >
                Ask us
              </Link>
              .
            </p>
          </article>

          {/* ---- On this page ---- */}
          <aside className="hidden border-l border-[rgba(33,31,28,.06)] px-5 py-10 lg:sticky lg:top-0 lg:block lg:h-screen lg:overflow-auto">
            <p className="mb-3.5 font-mono text-[10px] tracking-[0.12em] text-[#a79f93]">
              ON THIS PAGE
            </p>

            <ul className="space-y-2.5">
              {sections.map((section, i) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block text-[13px] leading-snug text-[#6f685f] transition-colors hover:text-[#2e6a4a]"
                  >
                    <span className="text-[#c9c2b6]">{i + 1} ·</span> {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <div className="border-t border-[rgba(33,31,28,.08)]">
          <SiteFooter />
        </div>
      </div>
    </div>
  )
}
