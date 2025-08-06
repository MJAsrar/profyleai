import { generateMetadata } from "@/lib/seo-config"

export const metadata = generateMetadata('coverLetter')

export default function CoverLetterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}