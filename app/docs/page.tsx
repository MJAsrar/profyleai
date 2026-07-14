import type { Metadata } from "next"
import Link from "next/link"
import { DocumentPage, type DocSection } from "@/components/layout/document-page"
import { CREDIT_COSTS } from "@/lib/types/credits"

export const metadata: Metadata = {
  title: "How it works",
  description: "How ProfyleAI turns one job description into a résumé, a letter, and an interview.",
}

/**
 * The docs, rewritten as something a person can actually use.
 *
 * The previous page was a directory of article titles — "Quick Start Guide", "Smart
 * Recommendations", "ATS Compatibility" — each linking to an anchor that did not exist
 * anywhere on the page. Every link was dead. This one has no links to articles that
 * haven't been written; it just explains the product.
 *
 * Credit costs are read from CREDIT_COSTS, so this page cannot quote a price the billing
 * code doesn't charge.
 */

const SECTIONS: DocSection[] = [
  {
    id: "the-idea",
    heading: "The idea",
    body: (
      <>
        <p>
          Most résumé tools are five separate products in a trenchcoat: one builds a résumé,
          another writes a letter, a third quizzes you — and every one of them asks you to
          paste the same job description again.
        </p>
        <p>
          ProfyleAI asks once. <strong>You set a target job,</strong> and it carries through
          everything after it: the tailoring, the cover letter, the practice questions, and
          the voice interview. Each step is built on the one before it.
        </p>
      </>
    ),
  },
  {
    id: "credits",
    heading: "Credits",
    body: (
      <>
        <p>
          There&apos;s no subscription. You buy credits, and you spend them only when work is
          actually done for you. If a generation fails, the credit comes straight back.
        </p>
        <ul>
          <li>
            <strong>A new résumé — {CREDIT_COSTS.RESUME_BUILDER} credits,</strong> charged when
            you first save it. Editing it afterwards is free, and so is downloading it.
          </li>
          <li>
            <strong>Tailoring to a job — {CREDIT_COSTS.RESUME_TAILORING} credits.</strong>
          </li>
          <li>
            <strong>A cover letter — {CREDIT_COSTS.COVER_LETTER} credits.</strong>
          </li>
          <li>
            <strong>Practice questions — {CREDIT_COSTS.TEXT_INTERVIEW} credits.</strong>
          </li>
          <li>
            <strong>A live voice interview — {CREDIT_COSTS.VIDEO_INTERVIEW} credits.</strong>
          </li>
        </ul>
        <p>
          Credits don&apos;t expire. You can see every credit you&apos;ve spent, earned or had
          refunded in <Link href="/dashboard/settings">Settings</Link>.
        </p>
      </>
    ),
  },
  {
    id: "resume",
    heading: "1 — Build the résumé",
    body: (
      <>
        <p>
          Start in the <Link href="/dashboard/resume-builder">résumé builder</Link>. Sections
          are on the left and you can jump between them in any order — nobody remembers their
          career in a straight line. The preview on the right is the actual document, and it
          updates as you type.
        </p>
        <p>
          Write the experience section like a person, not a job ad.{" "}
          <strong>Say what changed because you were there,</strong> and put a number on it
          where you can. &ldquo;Cut invoice processing time by a third&rdquo; beats
          &ldquo;responsible for invoice processing&rdquo; every time.
        </p>
      </>
    ),
  },
  {
    id: "tailor",
    heading: "2 — Tailor it to a job",
    body: (
      <>
        <p>
          Paste the posting into{" "}
          <Link href="/dashboard/resume-tailoring">tailoring</Link>. Paste the whole thing —
          the more of the posting we have, the better the match. This is where the job is
          set, and it&apos;s the last time you type it.
        </p>
        <p>
          You get back a rewritten résumé, a match score against the posting, and a list of
          what changed and why.
        </p>
      </>
    ),
  },
  {
    id: "letter",
    heading: "3 — Write the cover letter",
    body: (
      <p>
        The <Link href="/dashboard/cover-letter">cover letter</Link> is written from the job
        you already gave us and the history already on your résumé, so it names real things
        you&apos;ve done rather than swapping a company name into a template. Pick a tone,
        and read it before you send it.
      </p>
    ),
  },
  {
    id: "interview",
    heading: "4 — Practise the questions",
    body: (
      <p>
        <Link href="/dashboard/interview">Interview prep</Link> writes the questions this
        role is likely to actually ask. Answer them in writing, and each answer is scored
        against STAR — situation, task, action, result — with the specific thing that&apos;s
        missing named out loud.
      </p>
    ),
  },
  {
    id: "voice",
    heading: "5 — Say it out loud",
    body: (
      <>
        <p>
          The <Link href="/dashboard/video-interview">voice interview</Link> is the one that
          actually resembles the real thing: an interviewer speaks, you answer with your
          voice, and it follows up on what you said.
        </p>
        <p>
          If you already generated practice questions for this job, the voice interview reuses
          them — you aren&apos;t charged twice for the same questions. We check your
          microphone works before spending anything.
        </p>
      </>
    ),
  },
  {
    id: "stuck",
    heading: "If something goes wrong",
    body: (
      <p>
        Nothing you write here is lost when a generation fails, and you aren&apos;t charged
        for it. If something looks wrong — a credit that didn&apos;t come back, a document
        that won&apos;t open — <Link href="/contact">tell us</Link> and we&apos;ll fix it. The{" "}
        <Link href="/help">help page</Link> covers the things that come up most.
      </p>
    ),
  },
]

export default function DocsPage() {
  return (
    <DocumentPage
      title="How it works"
      summary="One job description, five tools, in the order you'd actually use them."
      updated="July 2026"
      sections={SECTIONS}
    />
  )
}
