import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import { MotionWrapper } from "@/components/ui/motion-wrapper"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background container-padding">
      <MotionWrapper animation="scale-in">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <MotionWrapper animation="bounce-in" delay={200}>
              <Link href="/" className="inline-flex items-center mb-6 hover-lift">
                <img src="/logo.png" alt="ProfyleAI" className="h-16 w-auto max-w-[300px]" />
              </Link>
            </MotionWrapper>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Welcome back</h2>
              <p className="text-muted-foreground">
                Sign in to your account to continue building your resume
              </p>
            </div>
          </div>
          <MotionWrapper animation="fade-in-up" delay={400}>
            <LoginForm />
          </MotionWrapper>
        </div>
      </MotionWrapper>
    </div>
  )
}
