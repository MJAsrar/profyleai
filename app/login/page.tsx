import { AuthLayout } from "@/components/auth/auth-layout"
import { AuthCard } from "@/components/auth/auth-card"
import { generateMetadata } from "@/lib/seo-config"

export const metadata = generateMetadata('login')

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthCard initialMode="login" />
    </AuthLayout>
  )
}
