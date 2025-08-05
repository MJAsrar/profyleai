import { SignupForm } from "@/components/auth/signup-form"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import { MotionWrapper } from "@/components/ui/motion-wrapper"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background container-padding">
      <MotionWrapper animation="scale-in">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <MotionWrapper animation="bounce-in" delay={200}>
              <Link href="/" className="inline-flex items-center space-x-2 mb-6 hover-lift">
                <img src="/logo.png" alt="Profyle" className="h-8 w-8" />
                <span className="text-2xl font-bold">Profyle</span>
              </Link>
            </MotionWrapper>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Create your account</h2>
              <p className="text-muted-foreground">
                Start building your perfect resume today
              </p>
            </div>
          </div>
          <MotionWrapper animation="fade-in-up" delay={400}>
            <SignupForm />
          </MotionWrapper>
        </div>
      </MotionWrapper>
    </div>
  )
}
