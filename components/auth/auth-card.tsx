"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input, FieldLabel } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

/**
 * Auth (design 1d).
 *
 * Replaces a bare card that had an empty <CardHeader />, no inline validation (errors
 * only appeared as a post-submit toast), no password reveal, no strength meter and no
 * terms gate — despite react-hook-form and zod both being installed and unused.
 */

type Mode = "signup" | "login"

/** Live password strength: length, mixed case, digit, symbol. */
function scorePassword(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" }

  let score = 0
  if (pw.length >= 8) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  const levels = [
    { label: "Weak", color: "#b4472f" },
    { label: "Weak", color: "#b4472f" },
    { label: "Fair", color: "#b07a2f" },
    { label: "Good", color: "#4a7a3f" },
    { label: "Strong", color: "#2e6a4a" },
  ]

  return { score, ...levels[score] }
}

export function AuthCard({ initialMode = "login" }: { initialMode?: Mode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"

  const [mode, setMode] = useState<Mode>(initialMode)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const isSignup = mode === "signup"
  const strength = useMemo(() => scorePassword(password), [password])

  const canSubmit =
    email.trim() !== "" &&
    password !== "" &&
    (!isSignup || (name.trim() !== "" && confirm !== "" && agreed))

  /** Inline validation — shown on the field, not buried in a toast. */
  function validate(): boolean {
    const errors: Record<string, string> = {}

    if (isSignup && name.trim().length < 2) errors.name = "Tell us your name."
    if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "That doesn't look like an email."
    if (password.length < 6) errors.password = "At least 6 characters."
    if (isSignup && confirm !== password) errors.confirm = "Passwords don't match."

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      if (isSignup) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        })
        const body = await res.json()

        if (!res.ok) {
          setFieldErrors({ email: body.error ?? "Could not create your account." })
          return
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setFieldErrors({ password: "Email or password is incorrect." })
        return
      }

      // Hold the button in its submitting state through the actual navigation,
      // rather than firing a setTimeout and hoping.
      router.push(callbackUrl)
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function switchMode(next: Mode) {
    setMode(next)
    setFieldErrors({})
  }

  return (
    <div className="w-full max-w-[420px]">
      {/* Tabs */}
      <div className="flex gap-6 border-b border-border">
        {(["signup", "login"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={cn(
              "relative -mb-px pb-3 text-[14px] font-semibold transition-colors",
              mode === m
                ? "text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-brand"
                : "text-ink-faint hover:text-ink-muted"
            )}
            aria-pressed={mode === m}
          >
            {m === "signup" ? "Create account" : "Log in"}
          </button>
        ))}
      </div>

      {/* Google */}
      <Button
        type="button"
        variant="outline"
        className="mt-7 w-full"
        onClick={() => signIn("google", { callbackUrl })}
      >
        <span
          aria-hidden="true"
          className="mr-1 inline-block h-4 w-4 rounded-full"
          style={{
            background:
              "conic-gradient(#ea4335 0turn .25turn, #fbbc05 .25turn .5turn, #34a853 .5turn .75turn, #4285f4 .75turn 1turn)",
          }}
        />
        Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          or
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          {isSignup && (
            <div>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={validate}
                aria-invalid={!!fieldErrors.name}
                autoComplete="name"
              />
              {fieldErrors.name && (
                <p className="mt-1.5 text-[12px] text-danger">{fieldErrors.name}</p>
              )}
            </div>
          )}

          <div>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={validate}
              aria-invalid={!!fieldErrors.email}
              autoComplete="email"
            />
            {fieldErrors.email && (
              <p className="mt-1.5 text-[12px] text-danger">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint transition-colors hover:text-brand"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={validate}
              aria-invalid={!!fieldErrors.password}
              autoComplete={isSignup ? "new-password" : "current-password"}
            />

            {fieldErrors.password && (
              <p className="mt-1.5 text-[12px] text-danger">{fieldErrors.password}</p>
            )}

            {/* Live strength meter */}
            {isSignup && password && (
              <div className="mt-2.5">
                <div className="h-1 overflow-hidden rounded-full bg-section-tint">
                  <div
                    className="h-full rounded-full transition-[width,background-color] duration-250"
                    style={{
                      width: `${(strength.score / 4) * 100}%`,
                      backgroundColor: strength.color,
                    }}
                  />
                </div>
                <p
                  className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em]"
                  style={{ color: strength.color }}
                  aria-live="polite"
                >
                  {strength.label}
                </p>
              </div>
            )}
          </div>

          {isSignup && (
            <div>
              <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
              <Input
                id="confirm"
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={validate}
                aria-invalid={!!fieldErrors.confirm}
                autoComplete="new-password"
              />
              {fieldErrors.confirm && (
                <p className="mt-1.5 text-[12px] text-danger">{fieldErrors.confirm}</p>
              )}
            </div>
          )}
        </div>

        {isSignup ? (
          <label className="mt-5 flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]"
            />
            <span className="text-[13px] leading-relaxed text-ink-muted">
              I agree to the{" "}
              <Link href="/terms" className="text-brand underline-offset-2 hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-brand underline-offset-2 hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        ) : (
          <div className="mt-4 text-right">
            <Link
              href="/contact"
              className="text-[13px] text-ink-muted underline-offset-2 hover:text-brand hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="mt-6 w-full"
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting
            ? isSignup
              ? "Creating your account…"
              : "Signing you in…"
            : isSignup
              ? "Create account — 10 free credits"
              : "Log in"}
        </Button>
      </form>
    </div>
  )
}
