import type { Metadata } from "next"
import Link from "next/link"
import { PublicNav } from "@/components/layout/public-nav"
import { CREDIT_COSTS } from "@/lib/types/credits"

export const metadata: Metadata = {
  title: "Docs",
  description:
    "How ProfyleAI turns one job description into a résumé, a cover letter, and an interview you're ready for.",
}

/**
 * The docs, on the prototype's three-column shell: grouped nav, the article, and an
 * on-this-page rail.
 *
 * Two things in the prototype aren't here, because nothing sits behind them: the "Search
 * docs" field (there is no docs search) and the screenshot placeholders (there is no
 * imagery to show, and a striped grey box is not a screenshot).
 *
 * Costs are read from CREDIT_COSTS. The prototype's line "Building and exporting to PDF is
 * always free" is not true of this app — POST /api/resumes charges for a new résumé — so
 * the copy says what it actually costs.
 */

interface Section {
  id: string
  nav: string
  heading: string
  body: React.ReactNode
}

interface Group {
  label: string
  sections: Section[]
}

const cost = (n: number) => (n === 0 ? "free" : `${n} credits`)

const GROUPS: Group[] = [
  {
    label: "GETTING STARTED",
    sections: [
      {
        id: "quick-start",
        nav: "Quick start",
        heading: "1. Create your profile",
        body: (
          <>
            <p>
              Sign up and you get <strong>10 free credits</strong>. Add your name and contact
              details once — every tool reuses them, so you never re-type them.
            </p>
            <p>
              From there the whole path is about ten minutes: build a résumé, point it at a
              job, and rehearse the interview that job would actually give you.
            </p>
          </>
        ),
      },
      {
        id: "credits",
        nav: "Understanding credits",
        heading: "2. Understand credits",
        body: (
          <>
            <p>
              There is no subscription. You buy credits and spend them only when the app does
              real work for you. If a generation fails,{" "}
              <strong>the credit comes straight back</strong> — you are never charged for
              something you didn&apos;t receive.
            </p>
            <ul>
              <li>
                A new résumé — <strong>{cost(CREDIT_COSTS.RESUME_BUILDER)}</strong>, charged
                when you first save it. Editing and downloading it afterwards is free.
              </li>
              <li>
                Tailoring it to a job — <strong>{cost(CREDIT_COSTS.RESUME_TAILORING)}</strong>.
              </li>
              <li>
                A cover letter — <strong>{cost(CREDIT_COSTS.COVER_LETTER)}</strong>.
              </li>
              <li>
                Practice questions with STAR scoring —{" "}
                <strong>{cost(CREDIT_COSTS.TEXT_INTERVIEW)}</strong>.
              </li>
              <li>
                A live voice interview — <strong>{cost(CREDIT_COSTS.VIDEO_INTERVIEW)}</strong>.
              </li>
            </ul>
            <p>
              Credits never expire. Every spend, refund and top-up is itemised in{" "}
              <Link href="/dashboard/settings">Settings</Link>.
            </p>
          </>
        ),
      },
    ],
  },
  {
    label: "BUILDING",
    sections: [
      {
        id: "template",
        nav: "Choosing a template",
        heading: "3. Choose a template",
        body: (
          <>
            <p>
              Every template is built to be machine-parseable: no multi-column layouts that
              scramble, no text trapped in images. If you&apos;re applying through a big
              company&apos;s portal, the ATS-tagged one is the safest choice.
            </p>
            <p>
              You can switch template at any time — it restyles the same content, so nothing
              you&apos;ve written is lost. Browse them on{" "}
              <Link href="/templates">the templates page</Link>.
            </p>
          </>
        ),
      },
      {
        id: "sections",
        nav: "Filling in sections",
        heading: "4. Fill in the sections",
        body: (
          <>
            <p>
              The builder has a rail of sections on the left and a live preview on the right.
              Sections can be filled in any order — nobody remembers their career in a
              straight line — and the preview is the actual document, updating as you type.
            </p>
            <Tip>
              Lead every bullet with a verb and end it with a result. &ldquo;Cut invoice
              processing time by a third&rdquo; beats &ldquo;responsible for invoice
              processing&rdquo; every time.
            </Tip>
          </>
        ),
      },
      {
        id: "styling",
        nav: "Styling & export",
        heading: "5. Style it and export",
        body: (
          <>
            <p>
              The controls under the preview change text size and spacing, and they write to
              the same config the PDF export reads — what you see is what comes out.
            </p>
            <p>
              Exporting an existing résumé to PDF costs nothing. You&apos;re only charged the{" "}
              {cost(CREDIT_COSTS.RESUME_BUILDER)} once, when a new résumé is first saved.
            </p>
          </>
        ),
      },
    ],
  },
  {
    label: "AI TOOLS",
    sections: [
      {
        id: "tailoring",
        nav: "Tailoring to a job",
        heading: "6. Point it at a job",
        body: (
          <>
            <p>
              Paste the job description <strong>once</strong>. Tailoring (
              {cost(CREDIT_COSTS.RESUME_TAILORING)}) rewrites your résumé against that posting
              and gives you a match score with a list of what changed and why.
            </p>
            <p>
              This is also where the job gets captured. Every tool after it — the cover
              letter, the questions, the voice interview — reads that same job, so you never
              paste it again.
            </p>
            <Tip>
              Paste the whole posting, not a summary of it. The more of the real text we have,
              the better the match.
            </Tip>
          </>
        ),
      },
      {
        id: "cover-letters",
        nav: "Cover letters",
        heading: "7. Write the cover letter",
        body: (
          <p>
            The letter ({cost(CREDIT_COSTS.COVER_LETTER)}) is written from the job you already
            gave us and the history already on your résumé, so it cites real things you have
            done rather than swapping a company name into a template. Pick a tone, and read it
            before you send it.
          </p>
        ),
      },
      {
        id: "interview",
        nav: "Interview practice",
        heading: "8. Practise the questions",
        body: (
          <p>
            Interview prep ({cost(CREDIT_COSTS.TEXT_INTERVIEW)}) writes the questions this role
            is likely to actually ask. Answer them in writing and each answer is scored against
            STAR — situation, task, action, result — with the specific thing that&apos;s
            missing named out loud.
          </p>
        ),
      },
      {
        id: "voice",
        nav: "Voice interview",
        heading: "9. Say it out loud",
        body: (
          <>
            <p>
              The voice interview ({cost(CREDIT_COSTS.VIDEO_INTERVIEW)}) is the one that
              resembles the real thing: an interviewer speaks, you answer with your voice, and
              it follows up on what you actually said.
            </p>
            <p>
              If you already generated practice questions for this job, the voice interview
              reuses them — you aren&apos;t charged twice for the same questions. Your
              microphone is tested before anything is spent.
            </p>
          </>
        ),
      },
    ],
  },
]

/** The prototype's sage callout with its evergreen left rule. */
function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 max-w-[620px] rounded-r-[11px] border-l-[3px] border-[#2e6a4a] bg-[#eef2ea] px-5 py-4">
      <p className="mb-[5px] font-mono text-[11px] tracking-[0.08em] text-[#2e6a4a]">TIP</p>
      <p className="text-[14px] leading-[1.6] text-[#3a352e]">{children}</p>
    </div>
  )
}

const ALL_SECTIONS = GROUPS.flatMap((g) => g.sections)

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#f6f3ec]">
      <div className="mx-auto w-full max-w-[1440px] bg-[#f6f3ec]">
        <PublicNav />

        <div className="grid lg:grid-cols-[264px_1fr_220px]">
          {/* ---- Nav ---- */}
          <nav
            aria-label="Documentation"
            className="border-b border-[rgba(33,31,28,.08)] bg-[#fffdf8] px-[18px] py-6 lg:sticky lg:top-0 lg:h-screen lg:overflow-auto lg:border-b-0 lg:border-r"
          >
            {GROUPS.map((group, gi) => (
              <div key={group.label}>
                <p
                  className={`px-2.5 pb-1.5 font-mono text-[10px] tracking-[0.14em] text-[#a79f93] ${
                    gi === 0 ? "pt-1.5" : "pt-4"
                  }`}
                >
                  {group.label}
                </p>

                <ul>
                  {group.sections.map((section) => (
                    <li key={section.id} className="mb-0.5">
                      <a
                        href={`#${section.id}`}
                        className="block rounded-[8px] px-2.5 py-2 text-[13.5px] text-[#4b463f] transition-colors hover:bg-[#f1ede4] hover:text-[#22322a]"
                      >
                        {section.nav}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* ---- Article ---- */}
          <article className="min-w-0 bg-[#f6f3ec] px-6 py-10 sm:px-14">
            <p className="mb-3 font-mono text-[12px] text-[#8a837a]">
              Getting started <span className="text-[#c9c2b6]">/</span> Quick start
            </p>

            <h1 className="mb-4 font-display text-[34px] font-medium leading-[1.08] text-[#211f1c] sm:text-[42px]">
              Quick start
            </h1>

            <p className="mb-7 max-w-[620px] text-[16px] leading-[1.7] text-[#4b463f]">
              Go from an empty account to a job-ready résumé, cover letter, and interview plan
              in about ten minutes. Here&apos;s the whole path.
            </p>

            {ALL_SECTIONS.map((section) => (
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

            <div className="mt-10 flex max-w-[620px] items-center justify-between border-t border-[rgba(33,31,28,.1)] pt-5">
              <Link
                href="/help"
                className="text-[14px] text-[#8a837a] transition-colors hover:text-[#2e6a4a]"
              >
                ← Help
              </Link>
              <Link
                href="/pricing"
                className="text-[14px] font-semibold text-[#2e6a4a] transition-colors hover:text-[#26583d]"
              >
                What things cost →
              </Link>
            </div>
          </article>

          {/* ---- On this page ---- */}
          <aside className="hidden border-l border-[rgba(33,31,28,.06)] px-5 py-10 lg:sticky lg:top-0 lg:block lg:h-screen lg:overflow-auto">
            <p className="mb-3.5 font-mono text-[10px] tracking-[0.12em] text-[#a79f93]">
              ON THIS PAGE
            </p>

            <ul className="space-y-2.5">
              {ALL_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block text-[13px] leading-snug text-[#6f685f] transition-colors hover:text-[#2e6a4a]"
                  >
                    {section.nav}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  )
}
