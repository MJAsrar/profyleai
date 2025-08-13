import { generateMetadata as generateSEOMetadata } from '@/lib/seo-config'

export const metadata = generateSEOMetadata('faq')

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
