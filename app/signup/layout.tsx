import { generateMetadata as generateSEOMetadata } from '@/lib/seo-config'

export const metadata = generateSEOMetadata('signup')

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
