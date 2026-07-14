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

/**
 * A field's error message, in a slot that holds its height whether or not there's an error.
 *
 * This is not cosmetic. These fields validate on blur, so the error line used to appear or
 * vanish exactly as the pointer left the field — which is to say, between the mousedown and
 * the mouseup of the very next click. Everything below shifted by a line, so the browser saw
 * press and release on two different elements and fired the click on their common ancestor
 * (the <form>) instead. The terms checkbox sits directly below these fields: it could be
 * ticked with the keyboard but not with a mouse, which quietly wedged the whole signup form.
 * Reserving the space means nothing moves, so the click lands where it was aimed.
 */
function FieldError({ message }: { message?: string }) {
  return (
    <p className="mt-1.5 min-h-[16px] text-[12px] leading-4 text-danger" aria-live="polite">
      {message}
    </p>
  )
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
    <div className="w-full">
      {/* ---- Tabs ---- */}
      <div className="mb-[30px] flex gap-7 border-b border-[rgba(33,31,28,.12)]">
        {(["signup", "login"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            aria-pressed={mode === m}
            className="relative cursor-pointer border-0 bg-none p-0 pb-[14px] text-[16px] font-semibold text-[#211f1c]"
          >
            {m === "signup" ? "Create account" : "Log in"}
            {mode === m && (
              <span className="absolute inset-x-0 -bottom-px h-[2px] bg-[#2e6a4a]" />
            )}
          </button>
        ))}
      </div>

      {/* ---- Google ---- */}
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        className="mb-5 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[11px] border border-[rgba(33,31,28,.16)] bg-white p-[13px] text-[15px] font-semibold text-[#211f1c] hover:border-[rgba(33,31,28,.3)]"
      >
        <span
          aria-hidden="true"
          className="h-[18px] w-[18px] rounded-full"
          style={{
            background:
              "conic-gradient(#ea4335 0 25%,#fbbc05 0 50%,#34a853 0 75%,#4285f4 0 100%)",
          }}
        />
        Continue with Google
      </button>

      <div className="mb-[22px] flex items-center gap-[14px]">
        <span className="h-px flex-1 bg-[rgba(33,31,28,.12)]" />
        <span className="font-mono text-[11px] tracking-[0.1em] text-[#9a9186]">OR</span>
        <span className="h-px flex-1 bg-[rgba(33,31,28,.12)]" />
      </div>

      {/* ---- Form ---- */}
      <form onSubmit={handleSubmit} noValidate>
        {isSignup && (
          <div className="mb-4">
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={validate}
              aria-invalid={!!fieldErrors.name}
              autoComplete="name"
              placeholder="Alex Rivera"
            />
            <FieldError message={fieldErrors.name} />
          </div>
        )}

        <div className="mb-4">
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validate}
            aria-invalid={!!fieldErrors.email}
            autoComplete="email"
            placeholder="you@school.edu"
          />
          <FieldError message={fieldErrors.email} />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            {!isSignup && (
              <Link
                href="/contact"
                className="mb-[7px] text-[12px] font-semibold text-[#2e6a4a]"
              >
                Forgot?
              </Link>
            )}
          </div>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={validate}
              aria-invalid={!!fieldErrors.password}
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder="At least 8 characters"
              className="pr-[62px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer border-0 bg-none px-1.5 py-1 font-mono text-[11px] tracking-[0.06em] text-[#8a837a] hover:text-[#2e6a4a]"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {isSignup && password && (
            <div className="mt-2.5 flex items-center gap-3">
              <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-[rgba(33,31,28,.1)]">
                <div
                  className="h-full rounded-full transition-[width] duration-250"
                  style={{
                    width: `${(strength.score / 4) * 100}%`,
                    background: strength.color,
                  }}
                />
              </div>
              <span
                aria-live="polite"
                className="min-w-[44px] font-mono text-[11px] text-[#8a837a]"
              >
                {strength.label}
              </span>
            </div>
          )}

          <FieldError message={fieldErrors.password} />
        </div>

        {isSignup && (
          <>
            <div className="mb-[18px]">
              <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
              <Input
                id="confirm"
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={validate}
                aria-invalid={!!fieldErrors.confirm}
                autoComplete="new-password"
                placeholder="Re-enter password"
              />
              <FieldError message={fieldErrors.confirm} />
            </div>

            {/* A real checkbox, visually replaced by the design's square. Keeping the input
                keeps it reachable by keyboard and announced by screen readers. */}
            <label className="mb-[22px] flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] border-[#2e6a4a] bg-white text-[12px] text-[#f4efe6] peer-checked:bg-[#2e6a4a] peer-focus-visible:shadow-[0_0_0_3px_rgba(46,106,74,.25)]"
              >
                {agreed ? "✓" : ""}
              </span>
              <span className="text-[13px] leading-[1.5] text-[#5c564d]">
                I agree to the{" "}
                <Link href="/terms" className="font-semibold text-[#2e6a4a]">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-semibold text-[#2e6a4a]">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </>
        )}

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="w-full cursor-pointer rounded-[11px] border-0 bg-[#2e6a4a] p-[15px] text-[16px] font-bold text-[#f4efe6] hover:bg-[#26583d] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isSubmitting
            ? isSignup
              ? "Creating your account…"
              : "Logging in…"
            : isSignup
              ? "Create account — get 10 free credits"
              : "Log in"}
        </button>
      </form>

      <p className="mt-[18px] text-center font-mono text-[13px] tracking-[0.02em] text-[#8a837a]">
        Free forever plan · 10 credits on sign-up
      </p>
    </div>
  )
}
