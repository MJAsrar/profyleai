import { generateMetadata as generateSEOMetadata } from '@/lib/seo-config'

export const metadata = generateSEOMetadata('login')

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
