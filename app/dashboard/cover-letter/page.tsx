"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { ToolTopBar } from "@/components/layout/tool-top-bar"
import { JobContextStrip } from "@/components/journey/job-context-strip"
import { Button, CreditCost } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input, FieldLabel } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/states"
import { useTargetJob } from "@/lib/hooks/use-target-job"
import { notifyCreditsChanged } from "@/lib/hooks/use-credits"
import { CREDIT_COSTS } from "@/lib/types/credits"
import { cn } from "@/lib/utils"

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "warm", label: "Warm" },
  { value: "confident", label: "Confident" },
] as const

type Tone = (typeof TONES)[number]["value"]

interface CoverLetter {
  opening?: string
  body?: string | string[]
  closing?: string
}

/** Flatten whatever shape the model returned into readable paragraphs. */
function paragraphsOf(letter: CoverLetter): string[] {
  const body = Array.isArray(letter.body)
    ? letter.body
    : typeof letter.body === "string"
      ? letter.body.split(/\n{2,}/)
      : []

  return [letter.opening, ...body, letter.closing].filter(
    (p): p is string => typeof p === "string" && p.trim().length > 0
  )
}

export default function CoverLetterPage() {
  const { data: session } = useSession()
  const { job, progress, linkArtifact } = useTargetJob()

  const [tone, setTone] = useState<Tone>("professional")
  const [hiringManager, setHiringManager] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [letter, setLetter] = useState<CoverLetter | null>(null)

  // The job comes from the journey — the user does NOT re-enter it here.
  const hasJob = Boolean(job?.role && job?.company && job?.description)

  useEffect(() => {
    setLetter(null)
  }, [job?.id])

  async function generate() {
    if (!job || !hasJob) return

    setIsGenerating(true)
    try {
      const res = await fetch("/api/cover-letter-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: job.role,
          companyName: job.company,
          jobDescription: job.description,
          hiringManager: hiringManager || undefined,
          personalInfo: {
            fullName: session?.user?.name ?? "Your name",
            email: session?.user?.email ?? "you@example.com",
          },
          tone,
        }),
      })

      const body = await res.json()

      if (res.status === 402) {
        toast.error("Not enough credits to write this letter.")
        return
      }
      if (!res.ok || !body.success) {
        toast.error(body.error ?? "That didn't generate. You haven't been charged.")
        return
      }

      setLetter(body.data as CoverLetter)
      notifyCreditsChanged()

      // Advance the journey. The letter isn't persisted as its own record here, so the
      // job's own id stands in as the marker that this step produced something.
      await linkArtifact({ coverLetterId: job.id })
      toast.success("Cover letter written.")
    } catch {
      toast.error("Generation failed. You haven't been charged.")
    } finally {
      setIsGenerating(false)
    }
  }

  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <>
      <ToolTopBar title="Cover letter" />
      <JobContextStrip job={job} progress={progress} current="coverLetter" />

      <div className="mx-auto w-full max-w-[1200px] px-8 py-8">
        {!hasJob ? (
          <EmptyState
            code="TL"
            tone="olive"
            title="Set the job first"
            description="A cover letter is only worth anything if it's about a specific role. Tailor a résumé to a job and this letter gets written from it — you won't type the posting twice."
            action={
              <Button asChild>
                <Link href="/dashboard/resume-tailoring">Set your target job</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            {/* ---- Controls ---- */}
            <Card className="h-fit p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                Writing to
              </p>
              <p className="mt-1.5 text-[16px] font-bold text-ink">{job!.role}</p>
              <p className="text-[14px] text-ink-muted">{job!.company}</p>

              <div className="mt-6">
                <FieldLabel>Tone</FieldLabel>
                <div className="flex rounded-input border border-border p-1">
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTone(t.value)}
                      aria-pressed={tone === t.value}
                      className={cn(
                        "flex-1 rounded-[7px] px-3 py-2 text-[13px] font-medium transition-colors",
                        tone === t.value
                          ? "bg-brand-tint text-brand"
                          : "text-ink-muted hover:text-ink"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <FieldLabel htmlFor="hm">Hiring manager (optional)</FieldLabel>
                <Input
                  id="hm"
                  value={hiringManager}
                  onChange={(e) => setHiringManager(e.target.value)}
                  placeholder="Leave blank for “Hiring Team”"
                />
              </div>

              <Button
                size="lg"
                className="mt-6 w-full"
                onClick={generate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  "Writing…"
                ) : (
                  <>
                    {letter ? "Rewrite letter" : "Write my letter"}
                    <CreditCost credits={CREDIT_COSTS.COVER_LETTER} />
                  </>
                )}
              </Button>

              <p className="mt-3 font-mono text-[10px] leading-relaxed tracking-[0.06em] text-ink-faint">
                Written from the job you already gave us — no re-typing.
              </p>
            </Card>

            {/* ---- Letter preview ---- */}
            <div className="rounded-panel bg-section-tint p-8">
              {isGenerating ? (
                <div className="mx-auto max-w-[640px] space-y-3 rounded-[10px] bg-[var(--card-plain)] p-12 shadow-doc">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-3 animate-pulse rounded bg-section-tint"
                      style={{ width: `${70 + ((i * 13) % 30)}%` }}
                    />
                  ))}
                </div>
              ) : letter ? (
                <>
                  <article className="mx-auto max-w-[640px] rounded-[10px] bg-[var(--card-plain)] p-12 shadow-doc">
                    <p className="font-mono text-[11px] tracking-[0.06em] text-ink-faint">
                      {today}
                    </p>

                    <p className="mt-8 text-[15px] text-ink">
                      Dear {hiringManager || "Hiring Team"},
                    </p>

                    <div className="mt-5 space-y-4">
                      {paragraphsOf(letter).map((para, i) => (
                        <p key={i} className="text-[15px] leading-[1.7] text-ink-2">
                          {para}
                        </p>
                      ))}
                    </div>

                    <p className="mt-8 text-[15px] text-ink">
                      Sincerely,
                      <br />
                      <span className="font-semibold">{session?.user?.name ?? "Your name"}</span>
                    </p>
                  </article>

                  <div className="mx-auto mt-5 flex max-w-[640px] flex-wrap justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(paragraphsOf(letter).join("\n\n"))
                        toast.success("Letter copied.")
                      }}
                    >
                      Copy text
                    </Button>
                    <Button asChild size="sm">
                      <Link href="/dashboard/interview">
                        Next: interview prep
                        <CreditCost credits={CREDIT_COSTS.TEXT_INTERVIEW} />
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="mx-auto flex max-w-[640px] flex-col items-center justify-center rounded-[10px] border border-dashed border-border bg-[var(--card-plain)]/60 p-16 text-center">
                  <p className="font-display text-[20px] text-ink">
                    Your letter will appear here.
                  </p>
                  <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-ink-muted">
                    It will cite {job!.company} and the work you&apos;ve actually done — not a
                    template with the company name swapped in.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
