import { generateMetadata as generateSEOMetadata } from '@/lib/seo-config'

export const metadata = generateSEOMetadata('cookies')

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
