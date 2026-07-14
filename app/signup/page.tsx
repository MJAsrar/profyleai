import { AuthLayout } from "@/components/auth/auth-layout"
import { AuthCard } from "@/components/auth/auth-card"
import { generateMetadata } from "@/lib/seo-config"

export const metadata = generateMetadata('signup')

export default function SignupPage() {
  return (
    <AuthLayout>
      <AuthCard initialMode="signup" />
    </AuthLayout>
  )
}
