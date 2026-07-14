import type { Metadata, Viewport } from 'next'
import { Newsreader, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SessionProviderWrapper } from '@/components/providers/session-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { defaultMetadata, organizationSchema } from '@/lib/seo-config'
import './globals.css'

/**
 * Three families, per the design system:
 *  - Newsreader (serif)      → display/headings, the brand voice
 *  - Hanken Grotesk (sans)   → all UI text and body
 *  - JetBrains Mono          → labels, kickers, credit counts, metadata
 *
 * Loaded via next/font so they are self-hosted and preloaded — no render-blocking
 * request to fonts.googleapis.com, and no layout shift.
 */
const display = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const sans = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = defaultMetadata

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <link rel="preload" href="/logo.png" as="image" type="image/png" />
        <link rel="dns-prefetch" href="//vercel.live" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body>
        {/*
          Light only, and forced.

          The design has one palette. Following the OS into dark mode flipped the token
          colours (--paper went to #16211b, a near-black evergreen) while the chrome that is
          pinned to the design's literal hexes — the sidebar, the tool bars — stayed cream.
          The result was a dark green content area framed by light chrome, with text colours
          from two different palettes sitting next to each other.

          `forcedTheme` also overrides a "dark" already sitting in someone's localStorage
          from before, which `defaultTheme` alone would not.
        */}
        <ThemeProvider
          attribute="class"
          forcedTheme="light"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SessionProviderWrapper>
            {children}
            <Toaster />
            {/* Sonner is what almost every page actually calls. Without this it was
                mounting nothing and the toasts went nowhere. */}
            <SonnerToaster />
          </SessionProviderWrapper>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
