import { generateMetadata as generateSEOMetadata } from '@/lib/seo-config'

export const metadata = generateSEOMetadata('help')

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
