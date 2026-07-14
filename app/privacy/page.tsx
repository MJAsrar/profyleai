import type { Metadata } from "next"
import Link from "next/link"
import { DocumentPage, type DocSection } from "@/components/layout/document-page"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What ProfyleAI collects, what it does with it, and what it never does.",
}

/**
 * Every disclosure from the previous policy is preserved — extension permissions, what we
 * collect from the web app, sharing, your rights, contact.
 *
 * One disclosure has been added, because it was missing and it matters: the résumé text and
 * job descriptions you give us are sent to third-party AI providers to do the actual work.
 * The old policy only gestured at "service providers". A user deciding whether to paste
 * their employment history in here deserves to be told plainly where it goes.
 */

const SECTIONS: DocSection[] = [
  {
    id: "collect-web",
    heading: "What we collect",
    body: (
      <>
        <p>
          <strong>Your account.</strong> Your name, email address, and — if you didn&apos;t
          sign in with Google — a password, which is hashed before it&apos;s stored.
        </p>
        <p>
          <strong>What you write.</strong> The résumés, cover letters, job descriptions and
          interview answers you create here.
        </p>
        <p>
          <strong>Basic usage data.</strong> Which pages get visited, so we can tell what&apos;s
          working and what isn&apos;t.
        </p>
      </>
    ),
  },
  {
    id: "collect-extension",
    heading: "What the Chrome extension collects",
    body: (
      <>
        <p>
          <strong>The job posting you&apos;re looking at.</strong> When you click the
          extension on a job posting, it reads the text of that posting so it can tailor a
          résumé to it.
        </p>
        <p>
          <strong>Your preferences,</strong> stored locally in your browser, and — if you log
          in through the extension — your tailored résumés, synced to your account.
        </p>
        <p>We do not:</p>
        <ul>
          <li>Track your browsing history.</li>
          <li>Collect data from unrelated websites.</li>
          <li>Sell or share the job postings you look at.</li>
        </ul>
      </>
    ),
  },
  {
    id: "ai-providers",
    heading: "Where your résumé actually goes",
    body: (
      <>
        <p>
          This is the part most policies bury, so here it is plainly:{" "}
          <strong>
            to tailor a résumé, write a cover letter, or run an interview, your text is sent
            to a third-party AI provider
          </strong>{" "}
          — Google, OpenAI, or ElevenLabs for the voice interview. The work happens on their
          servers, not ours. There is no way to rewrite your résumé without a model reading
          it.
        </p>
        <p>
          We send only what the task needs. We don&apos;t send your data to them for
          advertising, and we don&apos;t sell it to anyone.
        </p>
      </>
    ),
  },
  {
    id: "use",
    heading: "What we use it for",
    body: (
      <>
        <p>
          To tailor résumés and cover letters to the job you&apos;re chasing, to save your
          documents to your account, to answer you when you ask for help, and to make the
          product better.
        </p>
        <p>We do not:</p>
        <ul>
          <li>Sell or transfer your data to third parties.</li>
          <li>Use your data for advertising.</li>
          <li>Use it to judge creditworthiness, or for lending decisions of any kind.</li>
        </ul>
      </>
    ),
  },
  {
    id: "extension-permissions",
    heading: "The extension's permissions, and why",
    body: (
      <>
        <ul>
          <li>
            <strong>activeTab</strong> — to read the job description on the page you&apos;re
            actually looking at, when you activate the extension.
          </li>
          <li>
            <strong>storage</strong> — to keep your preferences and session.
          </li>
          <li>
            <strong>scripting</strong> — to show the extension&apos;s interface and pull the
            job description off the page.
          </li>
          <li>
            <strong>downloads</strong> — so you can download the tailored résumé.
          </li>
          <li>
            <strong>host permissions</strong> — to read postings on the job boards we support,
            like LinkedIn and Indeed.
          </li>
        </ul>
        <p>
          These permissions are used for that and nothing else. They are never used to collect
          unrelated data.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    heading: "Who else sees it",
    body: (
      <>
        <p>Your data is shared only:</p>
        <ul>
          <li>
            With the providers that make the product run — the AI providers named above,
            Stripe for payments, and our database and hosting providers.
          </li>
          <li>Where the law requires it, or to defend our legal rights.</li>
        </ul>
        <p>
          <strong>We never sell user data.</strong>
        </p>
      </>
    ),
  },
  {
    id: "security",
    heading: "How it's protected",
    body: (
      <p>
        Traffic between you and us is encrypted in transit, passwords are hashed, and card
        details never touch our servers. We&apos;ve written up exactly what we do — and what
        we don&apos;t claim to do — on the <Link href="/security">security page</Link>.
      </p>
    ),
  },
  {
    id: "rights",
    heading: "Your rights",
    body: (
      <>
        <p>
          <strong>Take it with you.</strong> Download everything you&apos;ve written here as a
          single file, from <Link href="/dashboard/settings">Settings</Link>.
        </p>
        <p>
          <strong>Delete it.</strong> Delete your account from the same place, and it and its
          documents are gone. Or email us and we&apos;ll do it for you.
        </p>
        <p>
          <strong>Walk away.</strong> Uninstall the extension whenever you like.
        </p>
      </>
    ),
  },
  {
    id: "updates",
    heading: "Changes to this policy",
    body: (
      <p>
        We may update this policy. If a change is significant, we&apos;ll tell users through
        the app or the extension rather than quietly editing the page.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "Contact",
    body: (
      <p>
        For any question or privacy request, email{" "}
        <a href="mailto:junaidasrar04@gmail.com">junaidasrar04@gmail.com</a> or use{" "}
        <Link href="/contact">the contact page</Link>.
      </p>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <DocumentPage
      title="Privacy Policy"
      summary="What we collect, where it goes, and what we never do with it."
      updated="July 2026"
      sections={SECTIONS}
    />
  )
}
