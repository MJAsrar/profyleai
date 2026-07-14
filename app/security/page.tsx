import type { Metadata } from "next"
import Link from "next/link"
import { DocumentPage, type DocSection } from "@/components/layout/document-page"

export const metadata: Metadata = {
  title: "Security",
  description: "How ProfyleAI handles your data, in plain terms.",
}

/**
 * What this page used to say, and why it no longer says it.
 *
 * The previous version advertised SOC 2 Type II certification, ISO 27001, a
 * zero-knowledge architecture, quarterly third-party penetration tests, 24/7 security
 * monitoring, employee background checks, and AWS infrastructure. None of that is true of
 * this application — it runs on Vercel, it has never been audited, and a zero-knowledge
 * architecture is flatly incompatible with a product whose entire job is reading your
 * résumé.
 *
 * Advertising a certification you do not hold isn't a styling problem, it's a false
 * statement to every visitor. So the claims are gone, and what replaces them describes what
 * the code actually does. If a certification is ever obtained, it can be stated here then.
 */

const SECTIONS: DocSection[] = [
  {
    id: "plainly",
    heading: "Plainly",
    body: (
      <>
        <p>
          We would rather tell you exactly what we do than dress it up. Everything below
          describes how the application is actually built — not an aspiration, and not a
          certification we don&apos;t hold.
        </p>
        <p>
          <strong>We hold no security certifications.</strong> We are not SOC 2 audited and
          not ISO 27001 certified. If that&apos;s a requirement for you, we&apos;re not the
          right tool yet, and you should know that now rather than later.
        </p>
      </>
    ),
  },
  {
    id: "in-transit",
    heading: "Your data in transit",
    body: (
      <p>
        Every request to ProfyleAI is served over HTTPS, so what travels between your browser
        and our servers is encrypted on the way. We also send strict transport security
        headers, which tell your browser never to talk to us over a plain connection again.
      </p>
    ),
  },
  {
    id: "at-rest",
    heading: "Your data at rest",
    body: (
      <>
        <p>
          Your résumés, cover letters and interview answers are stored in MongoDB Atlas,
          which encrypts its storage at rest.
        </p>
        <p>
          We can technically read your documents in that database. Anyone who offers to
          rewrite your résumé and also claims they <em>can&apos;t see it</em> is not being
          straight with you — the rewriting requires reading. We don&apos;t go looking, but
          we&apos;re not going to pretend it&apos;s impossible.
        </p>
      </>
    ),
  },
  {
    id: "passwords",
    heading: "Passwords",
    body: (
      <>
        <p>
          If you sign up with an email and password, that password is hashed with bcrypt
          before it&apos;s stored. We never keep it in a form we could read — which is why we
          can help you set a new one, but can never tell you what your old one was.
        </p>
        <p>If you sign in with Google, we never see a password at all.</p>
      </>
    ),
  },
  {
    id: "payments",
    heading: "Payments",
    body: (
      <p>
        Card details never touch our servers. Checkout is hosted by Stripe: you enter your
        card on Stripe&apos;s page, and we&apos;re told only that a payment succeeded. We
        store what you bought and when. We never store a card number.
      </p>
    ),
  },
  {
    id: "ai",
    heading: "What the AI providers see",
    body: (
      <>
        <p>
          To tailor a résumé, write a cover letter, or run an interview, the relevant text is
          sent to the provider doing the work — Google, OpenAI, or ElevenLabs for the voice
          interview. That means your résumé and the job description you paste leave our
          servers and reach theirs.
        </p>
        <p>
          We send what the task needs and nothing more. We don&apos;t sell your data, and we
          don&apos;t hand it to advertisers.
        </p>
      </>
    ),
  },
  {
    id: "your-control",
    heading: "Taking your data out — or deleting it",
    body: (
      <p>
        You can download everything you&apos;ve written here as a single JSON file, and you
        can delete your account outright, both from{" "}
        <Link href="/dashboard/settings">Settings</Link>. Deletion is real deletion — the
        account and its documents are removed and it cannot be undone, so export first if you
        want a copy.
      </p>
    ),
  },
  {
    id: "reporting",
    heading: "Found a problem?",
    body: (
      <p>
        If you find a security issue, tell us before you tell anyone else and we&apos;ll fix
        it. Write to us through <Link href="/contact">the contact page</Link> with enough
        detail to reproduce it. We won&apos;t pursue anyone who reports a vulnerability in
        good faith and gives us a fair chance to fix it.
      </p>
    ),
  },
]

export default function SecurityPage() {
  return (
    <DocumentPage
      title="Security"
      summary="What we actually do with your data — and what we don't claim to do."
      updated="July 2026"
      sections={SECTIONS}
    />
  )
}
