import { generateMetadata as generateSEOMetadata } from '@/lib/seo-config'

export const metadata = generateSEOMetadata('terms')

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
