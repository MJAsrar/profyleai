"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ToolTopBar } from "@/components/layout/tool-top-bar"
import { JobContextStrip } from "@/components/journey/job-context-strip"
import { Button, CreditCost } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/states"
import { StarFeedback } from "@/components/interview/star-feedback"
import { useTargetJob } from "@/lib/hooks/use-target-job"
import { notifyCreditsChanged } from "@/lib/hooks/use-credits"
import { CREDIT_COSTS } from "@/lib/types/credits"
import { cn } from "@/lib/utils"
import type { AnswerFeedback, PracticeQuestion } from "@/lib/services/interview-service"

const CATEGORY_LABEL: Record<PracticeQuestion["category"], string> = {
  behavioral: "Behavioural",
  "job-specific": "Role-specific",
  "field-related": "Field",
}

export default function InterviewPrepPage() {
  const { job, progress, linkArtifact } = useTargetJob()

  const [questions, setQuestions] = useState<PracticeQuestion[] | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [scores, setScores] = useState<Record<string, AnswerFeedback>>({})

  const [isGenerating, setIsGenerating] = useState(false)
  const [isScoring, setIsScoring] = useState(false)

  const hasJob = Boolean(job?.role && job?.company && job?.description)
  const active = questions?.find((q) => q.id === activeId) ?? null
  const activeAnswer = active ? (answers[active.id] ?? "") : ""
  const activeScore = active ? scores[active.id] : undefined

  async function generateQuestions() {
    if (!job) return
    setIsGenerating(true)

    try {
      const res = await fetch("/api/interview/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: job.company,
          jobTitle: job.role,
          jobDescription: job.description,
          questionCount: 8,
        }),
      })

      const body = await res.json()

      if (res.status === 402) {
        toast.error("Not enough credits to generate questions.")
        return
      }
      if (!res.ok || !body.success) {
        toast.error(body.error ?? "Couldn't generate questions. You haven't been charged.")
        return
      }

      const list: PracticeQuestion[] = body.data.questions ?? []
      setQuestions(list)
      setActiveId(list[0]?.id ?? null)
      notifyCreditsChanged()

      if (body.data.interviewPrepId) {
        await linkArtifact({ interviewPrepId: body.data.interviewPrepId })
      }
      toast.success(`${list.length} questions, drawn from this role.`)
    } catch {
      toast.error("Generation failed. You haven't been charged.")
    } finally {
      setIsGenerating(false)
    }
  }

  async function scoreAnswer() {
    if (!active || !job || activeAnswer.trim().length < 20) return
    setIsScoring(true)

    try {
      const res = await fetch("/api/interview/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: active,
          answer: activeAnswer,
          jobContext: {
            companyName: job.company,
            jobTitle: job.role,
            jobDescription: job.description,
          },
        }),
      })

      const body = await res.json()

      if (!res.ok || !body.success) {
        toast.error(body.error ?? "Couldn't score that answer.")
        return
      }

      setScores((prev) => ({ ...prev, [active.id]: body.data as AnswerFeedback }))
    } catch {
      toast.error("Scoring failed.")
    } finally {
      setIsScoring(false)
    }
  }

  return (
    <>
      <ToolTopBar title="Interview prep" />
      <JobContextStrip job={job} progress={progress} current="interviewPrep" />

      <div className="mx-auto w-full max-w-[1300px] px-8 py-8">
        {!hasJob ? (
          <EmptyState
            code="TL"
            tone="olive"
            title="Set the job first"
            description="Your practice questions are drawn from the actual posting — a generic question list won't prepare you for this interview."
            action={
              <Button asChild>
                <Link href="/dashboard/resume-tailoring">Set your target job</Link>
              </Button>
            }
          />
        ) : !questions ? (
          <EmptyState
            code="IP"
            tone="indigo"
            title={`Questions for ${job!.role}`}
            description={`We'll write the questions ${job!.company} is likely to ask for this role, then score your answers against STAR.`}
            action={
              <Button size="lg" onClick={generateQuestions} disabled={isGenerating}>
                {isGenerating ? (
                  "Writing your questions…"
                ) : (
                  <>
                    Generate questions
                    <CreditCost credits={CREDIT_COSTS.TEXT_INTERVIEW} />
                  </>
                )}
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[290px_1fr_350px]">
            {/* ---- Question list ---- */}
            <Card className="h-fit overflow-hidden p-0">
              <p className="border-b border-border px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                {questions.length} questions
              </p>

              <ul className="divide-y divide-border">
                {questions.map((q, i) => {
                  const score = scores[q.id]
                  const isActive = q.id === activeId

                  return (
                    <li key={q.id}>
                      <button
                        type="button"
                        onClick={() => setActiveId(q.id)}
                        aria-current={isActive ? "true" : undefined}
                        className={cn(
                          "w-full px-4 py-3 text-left transition-colors",
                          isActive ? "bg-brand-tint" : "hover:bg-section-tint"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                            {CATEGORY_LABEL[q.category]}
                          </span>

                          {score && (
                            <span className="shrink-0 rounded-full bg-brand-tint px-1.5 py-0.5 font-mono text-[10px] text-brand">
                              ● {(score.score / 10).toFixed(1)}
                            </span>
                          )}
                        </div>

                        <p
                          className={cn(
                            "mt-1 line-clamp-2 text-[13px] leading-snug",
                            isActive ? "font-semibold text-brand-deep" : "text-ink-2"
                          )}
                        >
                          {i + 1}. {q.question}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </Card>

            {/* ---- Answer ---- */}
            <div>
              {active && (
                <Card className="p-6">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand">
                    {CATEGORY_LABEL[active.category]} · {active.difficulty}
                  </span>

                  <h2 className="mt-3 font-display text-[26px] leading-tight text-ink">
                    {active.question}
                  </h2>

                  <textarea
                    rows={12}
                    value={activeAnswer}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [active.id]: e.target.value }))
                    }
                    placeholder="Answer as you would out loud. Situation, task, action, result — and put a number on the result if you can."
                    className="mt-5 w-full rounded-input border border-border bg-[var(--card-plain)] px-3.5 py-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-faint focus-visible:border-brand focus-visible:shadow-focus focus-visible:outline-none"
                  />

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="font-mono text-[10px] tracking-[0.06em] text-ink-faint">
                      {activeAnswer.trim().split(/\s+/).filter(Boolean).length} words
                    </p>

                    <Button
                      onClick={scoreAnswer}
                      disabled={isScoring || activeAnswer.trim().length < 20}
                    >
                      {isScoring ? "Scoring…" : "Score against STAR"}
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* ---- STAR feedback ---- */}
            <div>
              {activeScore ? (
                <StarFeedback feedback={activeScore} />
              ) : (
                <Card className="p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                    Feedback
                  </p>
                  <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
                    Write an answer and score it. You&apos;ll get a STAR breakdown — what
                    landed, and specifically what to add.
                  </p>
                </Card>
              )}

              <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                <Link href="/dashboard/video-interview">
                  Next: say it out loud
                  <CreditCost
                    credits={CREDIT_COSTS.VIDEO_INTERVIEW}
                    className="bg-brand-tint text-brand"
                  />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
