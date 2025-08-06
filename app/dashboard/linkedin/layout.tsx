import { generateMetadata } from "@/lib/seo-config"

export const metadata = generateMetadata('linkedin')

export default function LinkedInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}