import type { Metadata } from "next"
import Link from "next/link"
import { DocumentPage, type DocSection } from "@/components/layout/document-page"

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "What ProfyleAI stores in your browser, and what it doesn't.",
}

/**
 * What this page used to say, and why it doesn't say it any more.
 *
 * The previous version described four categories of cookie — essential, analytics,
 * functional and marketing — with a preference panel implying you could switch the tracking
 * ones off.
 *
 * This app sets no analytics cookies and no marketing cookies. The only cookies it sets are
 * NextAuth's session cookies (lib/auth.ts). There is no gtag, no PostHog, no pixel. So the
 * page says that, and the preference panel is gone: a toggle that disables tracking which
 * never existed is theatre, and it teaches people to trust a control that does nothing.
 */

const SECTIONS: DocSection[] = [
  {
    id: "short",
    heading: "The short version",
    body: (
      <>
        <p>
          <strong>We don&apos;t track you.</strong> ProfyleAI sets no analytics cookies, no
          advertising cookies, and no third-party pixels. There is no tracker to opt out of,
          which is why you won&apos;t find a cookie banner here.
        </p>
        <p>
          The only cookies we set are the ones that keep you signed in. If that ever changes,
          this page changes first.
        </p>
      </>
    ),
  },
  {
    id: "essential",
    heading: "The cookies we do set",
    body: (
      <>
        <p>
          <strong>Session cookies.</strong> When you log in we store a signed session token in
          your browser, so the next page you open knows it&apos;s still you. Without it
          you&apos;d be asked to log in on every click.
        </p>
        <p>
          These are strictly necessary — the site cannot work without them, and they
          can&apos;t be switched off while you&apos;re logged in. Logging out clears them.
        </p>
      </>
    ),
  },
  {
    id: "not-cookies",
    heading: "What isn't a cookie",
    body: (
      <p>
        Some preferences — your theme, and your résumé&apos;s font and spacing settings — are
        kept in your browser&apos;s local storage rather than in a cookie. They never leave
        your device and are never sent to us. Clearing your browser data resets them.
      </p>
    ),
  },
  {
    id: "control",
    heading: "Clearing them",
    body: (
      <p>
        You can clear this site&apos;s cookies from your browser settings at any time —
        you&apos;ll simply be logged out. To remove what we hold server-side as well, delete
        your account from <Link href="/dashboard/settings">Settings</Link>. That is a real
        deletion, and it can&apos;t be undone.
      </p>
    ),
  },
  {
    id: "related",
    heading: "Related",
    body: (
      <p>
        What we collect and where it goes is covered in the{" "}
        <Link href="/privacy">privacy policy</Link>; how it&apos;s protected is on the{" "}
        <Link href="/security">security page</Link>.
      </p>
    ),
  },
]

export default function CookiesPage() {
  return (
    <DocumentPage
      title="Cookie Policy"
      summary="We set the cookies that keep you signed in, and nothing else."
      updated="July 2026"
      sections={SECTIONS}
    />
  )
}
