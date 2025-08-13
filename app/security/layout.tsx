import { generateMetadata as generateSEOMetadata } from '@/lib/seo-config'

export const metadata = generateSEOMetadata('security')

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
