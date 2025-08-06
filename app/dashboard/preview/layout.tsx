import { generateMetadata } from "@/lib/seo-config"

export const metadata = generateMetadata('preview')

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}