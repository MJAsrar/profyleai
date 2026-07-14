import Link from "next/link"
import { PublicNav } from "@/components/layout/public-nav"
import { SiteFooter } from "@/components/layout/site-footer"
import { PathRail } from "@/components/marketing/path-rail"
import { generateMetadata, softwareApplicationSchema } from "@/lib/seo-config"

export const metadata = generateMetadata("home")

/**
 * The landing page, built to the supplied design.
 *
 * Sizes, colours and copy are taken from it literally. The one liberty: the design is a
 * fixed 1440px canvas, which would force a horizontal scrollbar on any narrower screen, so
 * the shell is `max-w-[1440px]` instead. At 1440 and above it is pixel-identical; below it,
 * the sections wrap rather than overflow.
 */

const CLAIMS = [
  "Résumé auto-matched to the role's keywords",
  "Cover letter written in your chosen tone",
  "Interview questions drawn from the real posting",
]

const REQUIREMENTS = ["SQL", "A/B testing", "Stakeholder comms"]

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />

      <div className="min-h-screen bg-[#f6f3ec]">
        <div className="mx-auto w-full max-w-[1440px] overflow-hidden bg-[#f6f3ec]">
          <PublicNav announcement />

          <main>
            {/* ---- Hero ---- */}
            <section className="max-w-[800px] px-6 pb-[30px] pt-20 sm:px-14">
              <p className="mb-[22px] font-mono text-[13px] tracking-[0.16em] text-[#2e6a4a]">
                FOR YOUR FIRST REAL JOB
              </p>

              <h1 className="mb-6 font-display text-[40px] font-medium leading-[1.03] tracking-[-0.015em] text-[#211f1c] sm:text-[60px]">
                Turn one job post into a résumé, cover letter, and interview you&apos;re{" "}
                <span className="italic text-[#2e6a4a]">ready</span> for.
              </h1>

              <p className="mb-8 max-w-[640px] text-[20px] leading-[1.6] text-[#5c564d]">
                ProfyleAI walks early-career job seekers through the entire hunt — build the
                résumé, tailor it to the role, write the cover letter, and rehearse the
                interview. One story, carried the whole way through.
              </p>

              <div className="mb-4 flex flex-wrap items-center gap-[14px]">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-[9px] rounded-[12px] bg-[#2e6a4a] px-6 py-[15px] text-[16px] font-semibold text-[#f4efe6] hover:bg-[#26583d]"
                >
                  Start free — 10 credits
                </Link>

                <Link
                  href="/docs"
                  className="inline-flex items-center gap-[9px] rounded-[12px] border border-[rgba(33,31,28,.18)] bg-transparent px-[22px] py-[15px] text-[16px] font-semibold text-[#211f1c] hover:border-[#2e6a4a] hover:text-[#2e6a4a]"
                >
                  See how it works →
                </Link>
              </div>

              <p className="font-mono text-[12px] tracking-[0.02em] text-[#8a837a]">
                No card required · Your first résumé is free
              </p>
            </section>

            {/* ---- Your path ---- */}
            <section className="px-6 pb-[76px] pt-[34px] sm:px-14">
              <PathRail />
            </section>

            {/* ---- Enter it once ---- */}
            <section
              id="product"
              className="scroll-mt-8 border-y border-[rgba(33,31,28,.07)] bg-[#eef2ea] px-6 py-[76px] sm:px-14"
            >
              <div className="grid items-center gap-16 lg:grid-cols-2">
                <div>
                  <p className="mb-[18px] font-mono text-[13px] tracking-[0.14em] text-[#2e6a4a]">
                    ENTER IT ONCE
                  </p>

                  <h2 className="mb-[18px] font-display text-[32px] font-medium leading-[1.12] text-[#211f1c] sm:text-[38px]">
                    One job description. Every step uses it.
                  </h2>

                  <p className="mb-[22px] text-[17px] leading-[1.62] text-[#5c564d]">
                    The old way meant re-typing the same role into five different tools. In
                    ProfyleAI you capture the job once — and your résumé, tailoring, cover
                    letter, and interview prep all draw from it automatically.
                  </p>

                  <ul className="flex flex-col gap-3">
                    {CLAIMS.map((claim) => (
                      <li
                        key={claim}
                        className="flex items-center gap-[11px] text-[15px] text-[#3a352e]"
                      >
                        <span
                          aria-hidden="true"
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] bg-[#2e6a4a] text-[12px] text-[#f4efe6]"
                        >
                          ✓
                        </span>
                        {claim}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* The job profile, as a tangible object. */}
                <div
                  className="rounded-[18px] border border-[rgba(33,31,28,.09)] bg-[#fffdf8] p-7"
                  style={{ boxShadow: "0 24px 60px -34px rgba(30,25,20,.26)" }}
                >
                  <p className="mb-4 font-mono text-[11px] tracking-[0.12em] text-[#8a837a]">
                    JOB PROFILE · CAPTURED ONCE
                  </p>

                  <div className="flex flex-col gap-[14px]">
                    <div>
                      <p className="mb-[3px] font-mono text-[11px] text-[#9a9186]">ROLE</p>
                      <p className="text-[16px] font-semibold text-[#211f1c]">
                        Product Analyst, New Grad
                      </p>
                    </div>

                    <div>
                      <p className="mb-[3px] font-mono text-[11px] text-[#9a9186]">COMPANY</p>
                      <p className="text-[16px] font-semibold text-[#211f1c]">
                        Northwind Labs
                      </p>
                    </div>

                    <div>
                      <p className="mb-1.5 font-mono text-[11px] text-[#9a9186]">
                        KEY REQUIREMENTS
                      </p>
                      <div className="flex flex-wrap gap-[7px]">
                        {REQUIREMENTS.map((req) => (
                          <span
                            key={req}
                            className="rounded-full bg-[#e7efe8] px-2.5 py-[5px] text-[13px] font-medium text-[#2e6a4a]"
                          >
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="mt-5 flex items-center gap-2 border-t border-[rgba(33,31,28,.08)] pt-4 text-[13px] text-[#5c564d]">
                    <span className="text-[#2e6a4a]">→</span>
                    Pulled into every tool automatically
                  </p>
                </div>
              </div>
            </section>

            {/* ---- CTA band ---- */}
            <section className="bg-[#22322a] px-6 py-[82px] text-center sm:px-14">
              <h2 className="mb-[14px] font-display text-[34px] font-medium text-[#f4efe6] sm:text-[44px]">
                Your next application, start to finish.
              </h2>

              <p className="mb-[30px] text-[17px] text-[#a9b7ad]">
                Ten free credits when you sign up. Enough for a résumé, a tailor, and a cover
                letter.
              </p>

              <Link
                href="/signup"
                className="inline-flex items-center gap-[9px] rounded-[12px] bg-[#f4efe6] px-[26px] py-[15px] text-[16px] font-bold text-[#22322a] hover:bg-white"
              >
                Start free — 10 credits
              </Link>
            </section>
          </main>

          <SiteFooter />
        </div>
      </div>
    </>
  )
}
