import { generateMetadata } from "@/lib/seo-config"

export const metadata = generateMetadata('viewResumes')

export default function ViewResumesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}