import type { Metadata } from "next"
import Link from "next/link"
import { DocumentPage, type DocSection } from "@/components/layout/document-page"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms you agree to when you use ProfyleAI.",
}

/**
 * These are the clauses that were already in force — agreement, licence, accounts,
 * prohibited uses, changes to the service, limitation of liability, contact. Nothing has
 * been quietly widened. The document has been rewritten to be readable, and the credits
 * section now states in the terms what the product already does in code.
 */

const SECTIONS: DocSection[] = [
  {
    id: "agreement",
    heading: "Agreeing to these terms",
    body: (
      <p>
        By using ProfyleAI, you agree to these terms. If you don&apos;t agree to them,
        don&apos;t use the service. That&apos;s the whole of it — the rest is detail.
      </p>
    ),
  },
  {
    id: "what-you-may-do",
    heading: "What you may do",
    body: (
      <>
        <p>You may use ProfyleAI to:</p>
        <ul>
          <li>Build, tailor and download your own résumés and cover letters.</li>
          <li>Practise interviews and read your feedback.</li>
          <li>Send the documents you make here to anyone you like, employers included.</li>
        </ul>
        <p>
          <strong>What you make here is yours.</strong> We claim no ownership of your
          résumés, your letters, or your interview answers.
        </p>
      </>
    ),
  },
  {
    id: "what-you-may-not-do",
    heading: "What you may not do",
    body: (
      <>
        <p>You may not:</p>
        <ul>
          <li>Copy, resell or redistribute the service itself, or reverse engineer it.</li>
          <li>Remove copyright or proprietary notices.</li>
          <li>Use it for anything unlawful, or to harass, impersonate or abuse anyone.</li>
          <li>Transmit malicious code, or try to get around our security or rate limits.</li>
          <li>Interfere with the service running for everyone else.</li>
        </ul>
      </>
    ),
  },
  {
    id: "accounts",
    heading: "Your account",
    body: (
      <p>
        One account per person, and you must be at least 16 years old. Give us accurate
        information, keep your login to yourself, and tell us if you think someone else has
        got into your account.
      </p>
    ),
  },
  {
    id: "credits",
    heading: "Credits and payment",
    body: (
      <>
        <p>
          ProfyleAI runs on credits, not a subscription. You buy them when you want them, and{" "}
          <strong>they don&apos;t expire</strong>.
        </p>
        <p>
          A credit is spent when work is actually done for you. If a generation fails, the
          credit is returned automatically — you are not charged for something you
          didn&apos;t get. Credits have no cash value, aren&apos;t refundable for money once
          purchased, and unspent credits are not refunded if you delete your account.
        </p>
        <p>
          Payments are handled by Stripe. If you think you&apos;ve been charged in error,{" "}
          <Link href="/contact">tell us</Link> and we&apos;ll look at it.
        </p>
      </>
    ),
  },
  {
    id: "ai",
    heading: "What the AI writes",
    body: (
      <>
        <p>
          ProfyleAI generates text with AI models. It can be wrong, and it can be clumsy.{" "}
          <strong>Read what it writes before you send it to an employer.</strong> You are the
          one applying for the job, and the words go out under your name.
        </p>
        <p>
          We don&apos;t guarantee interviews, offers, or that any application will succeed.
          Nobody honestly can.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    heading: "Changes to the service",
    body: (
      <p>
        We may change or discontinue parts of ProfyleAI. If we make a significant change,
        we&apos;ll make a reasonable effort to tell users first and to give you a way to take
        your work with you. You can export everything you&apos;ve written at any time,
        without asking us.
      </p>
    ),
  },
  {
    id: "liability",
    heading: "Limitation of liability",
    body: (
      <>
        <p>
          To the extent the law allows, ProfyleAI is not liable for damages arising from your
          use of, or inability to use, the service — including lost data, lost profit, or
          business interruption — even if we had been told such damage was possible.
        </p>
        <p>
          Some jurisdictions don&apos;t allow limits on implied warranties or on liability for
          incidental damages, so these limits may not apply to you.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    heading: "Questions",
    body: (
      <p>
        If anything here is unclear, ask. Write to us at{" "}
        <a href="mailto:junaidasrar04@gmail.com">junaidasrar04@gmail.com</a>, or through{" "}
        <Link href="/contact">the contact page</Link>.
      </p>
    ),
  },
]

export default function TermsPage() {
  return (
    <DocumentPage
      title="Terms of Service"
      summary="What you agree to when you use ProfyleAI, written to be read rather than skipped."
      updated="July 2026"
      sections={SECTIONS}
    />
  )
}
