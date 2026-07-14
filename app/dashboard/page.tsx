import { DashboardHome } from "@/components/dashboard/dashboard-home"
import { generateMetadata } from "@/lib/seo-config"

export const metadata = generateMetadata('dashboard')

export default function DashboardPage() {
  return <DashboardHome />
}
