import { generateMetadata } from "@/lib/seo-config"

export const metadata = generateMetadata('resumeBuilder')

export default function ResumeBuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}