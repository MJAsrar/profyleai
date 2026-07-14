import type { ReactNode } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export interface DocSection {
  id: string
  heading: string
  body: ReactNode
}

/**
 * The shell for every long-form page: terms, privacy, security, docs.
 *
 * Documents get read two ways — skimmed for one specific thing, or read straight through by
 * someone deciding whether to trust you. The contents rail serves the first; a single
 * measured column of real prose serves the second. No cards, no icon grid: this is a
 * document, so it should look like one.
 */
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
  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <main className="mx-auto w-full max-w-[1000px] px-8 py-16">
        <header className="max-w-[640px]">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Last updated {updated}
          </p>
          <h1 className="mt-3 font-display text-[42px] leading-[1.1] text-ink">{title}</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-muted">{summary}</p>
        </header>

        <div className="mt-14 flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* ---- Contents ---- */}
          <nav
            aria-label="Contents"
            className="lg:sticky lg:top-8 lg:h-fit lg:w-[200px] lg:shrink-0"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Contents
            </p>
            <ul className="mt-3 space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-[13px] leading-snug text-ink-muted underline-offset-4 transition-colors hover:text-brand hover:underline"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ---- Document ---- */}
          <div className="min-w-0 max-w-[640px] flex-1">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-8 border-t border-border pt-8 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-10"
              >
                <h2 className="font-display text-[24px] leading-tight text-ink">
                  {section.heading}
                </h2>

                <div
                  className={[
                    "mt-4 space-y-4 text-[15px] leading-[1.75] text-ink-2",
                    "[&_a]:text-brand [&_a]:underline [&_a]:underline-offset-4",
                    "[&_strong]:font-semibold [&_strong]:text-ink",
                    "[&_ul]:space-y-2 [&_ul]:pl-5 [&_li]:list-disc [&_li]:marker:text-ink-faint",
                  ].join(" ")}
                >
                  {section.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
