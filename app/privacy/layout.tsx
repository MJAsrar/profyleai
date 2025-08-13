import { generateMetadata as generateSEOMetadata } from '@/lib/seo-config'

export const metadata = generateSEOMetadata('privacy')

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
