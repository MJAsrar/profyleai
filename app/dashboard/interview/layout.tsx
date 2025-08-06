import { generateMetadata } from "@/lib/seo-config"

export const metadata = generateMetadata('interview')

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}