import { generateMetadata as generateSEOMetadata } from '@/lib/seo-config'

export const metadata = generateSEOMetadata('docs')

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
