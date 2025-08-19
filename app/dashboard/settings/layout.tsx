import { generateMetadata } from "@/lib/seo-config"

export const metadata = generateMetadata('settings')

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
