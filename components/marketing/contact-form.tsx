"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input, FieldLabel } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const TOPICS = ["Support", "Billing", "Privacy", "Something else"]

export function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [topic, setTopic] = useState(TOPICS[0])
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)

  function validate() {
    const next: Record<string, string> = {}
    if (name.trim().length < 2) next.name = "Tell us your name."
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "We need a valid email to reply to."
    if (message.trim().length < 10) next.message = "A little more detail, please."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSending(true)
    try {
      // No contact endpoint exists yet — hand off to the user's mail client rather
      // than pretending the message was delivered.
      const subject = encodeURIComponent(`[${topic}] from ${name}`)
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`)
      window.location.href = `mailto:support@profyleai.com?subject=${subject}&body=${body}`
      toast.success("Opening your email app…")
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="h-fit p-7">
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="c-name">Name</FieldLabel>
            <Input
              id="c-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={validate}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="mt-1.5 text-[12px] text-danger">{errors.name}</p>}
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
            />
            {errors.email && <p className="mt-1.5 text-[12px] text-danger">{errors.email}</p>}
          </div>
        </div>

        <div className="mt-4">
          <FieldLabel>What&apos;s this about?</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(t)}
                aria-pressed={topic === t}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[13px] transition-colors",
                  topic === t
                    ? "bg-brand-tint font-semibold text-brand"
                    : "border border-border text-ink-muted hover:border-brand hover:text-brand"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <FieldLabel htmlFor="c-message">Message</FieldLabel>
          <textarea
            id="c-message"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onBlur={validate}
            aria-invalid={!!errors.message}
            className="w-full rounded-input border border-border bg-[var(--card-plain)] px-3.5 py-3 text-[15px] text-ink placeholder:text-ink-faint transition-colors focus-visible:border-brand focus-visible:shadow-focus focus-visible:outline-none"
            placeholder="What happened, and what were you trying to do?"
          />
          {errors.message && <p className="mt-1.5 text-[12px] text-danger">{errors.message}</p>}
        </div>

        <Button type="submit" size="lg" className="mt-6 w-full" disabled={sending}>
          {sending ? "Opening…" : "Send message"}
        </Button>
      </form>
    </Card>
  )
}
