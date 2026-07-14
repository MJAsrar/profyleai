"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Input, FieldLabel } from "@/components/ui/input"

const TOPICS = [
  "General questions",
  "Billing & credits",
  "Technical support",
  "Privacy",
] as const

/** The address used everywhere else in the app (terms, privacy). */
export const CONTACT_EMAIL = "junaidasrar04@gmail.com"

/**
 * The contact form, to the design.
 *
 * There is no contact endpoint in this app, so the form hands the message to the user's own
 * mail client rather than pretending it was delivered to a support queue that doesn't exist.
 * The button says so.
 */
export function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [topic, setTopic] = useState<string>(TOPICS[0])
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const next: Record<string, string> = {}
    if (name.trim().length < 2) next.name = "Tell us your name."
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "We need a valid email to reply to."
    if (message.trim().length < 10) next.message = "A little more detail, please."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const subject = encodeURIComponent(`[${topic}] from ${name}`)
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`)
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
    toast.success("Opening your email app…")
  }

  const fieldError = (key: string) =>
    errors[key] ? (
      <p className="mt-1.5 text-[12px] text-[#b4472f]">{errors[key]}</p>
    ) : null

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-[18px] border border-[rgba(33,31,28,.09)] bg-[#fffdf8] p-8"
      style={{ boxShadow: "0 24px 60px -36px rgba(30,25,20,.28)" }}
    >
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="c-name">Name</FieldLabel>
          <Input
            id="c-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={validate}
            aria-invalid={!!errors.name}
            placeholder="Alex Rivera"
          />
          {fieldError("name")}
        </div>

        <div>
          <FieldLabel htmlFor="c-email">Email</FieldLabel>
          <Input
            id="c-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validate}
            aria-invalid={!!errors.email}
            placeholder="you@email.com"
          />
          {fieldError("email")}
        </div>
      </div>

      <div className="mb-4">
        <FieldLabel htmlFor="c-topic">What&apos;s this about?</FieldLabel>
        <select
          id="c-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full rounded-[10px] border border-[rgba(33,31,28,.16)] bg-white px-[14px] py-3 text-[15px] text-[#211f1c] focus-visible:border-[#2e6a4a] focus-visible:shadow-[0_0_0_3px_rgba(46,106,74,.12)] focus-visible:outline-none"
        >
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <FieldLabel htmlFor="c-message">Message</FieldLabel>
        <textarea
          id="c-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onBlur={validate}
          aria-invalid={!!errors.message}
          placeholder="Tell us what's going on…"
          className="w-full resize-y rounded-[10px] border border-[rgba(33,31,28,.16)] bg-white px-[14px] py-3 text-[15px] text-[#211f1c] placeholder:text-[#a79f93] focus-visible:border-[#2e6a4a] focus-visible:shadow-[0_0_0_3px_rgba(46,106,74,.12)] focus-visible:outline-none"
        />
        {fieldError("message")}
      </div>

      <button
        type="submit"
        className="w-full cursor-pointer rounded-[11px] border-0 bg-[#2e6a4a] p-[14px] text-[16px] font-bold text-[#f4efe6] hover:bg-[#26583d]"
      >
        Write this email
      </button>

      <p className="mt-3 text-center font-mono text-[11px] leading-relaxed tracking-[0.04em] text-[#8a837a]">
        This opens your own email app — we don&apos;t have a support inbox that receives
        forms.
      </p>
    </form>
  )
}
