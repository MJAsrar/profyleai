import { generateMetadata as generateSEOMetadata } from '@/lib/seo-config'

export const metadata = generateSEOMetadata('contact')

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
