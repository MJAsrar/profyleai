"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"

import { ToolTopBar } from "@/components/layout/tool-top-bar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ErrorState, ListSkeleton } from "@/components/ui/states"
import { cn } from "@/lib/utils"

interface Response {
  id: string
  questionText: string
  questionOrder: number
  responseText: string | null
  contentScore: number | null
  deliveryScore: number | null
  starScore: number | null
  feedback: unknown
}

interface Session {
  sessionId: string
  jobTitle: string
  companyName: string
  status: string
  createdAt: string
  totalTime: number | null
  overallScore: number | null
  feedback: { summary?: string; strengths?: string[]; improvements?: string[] } | null
  transcriptionData: {
    segments?: Array<{ text: string; speaker: "user" | "ai"; timestamp: number }>
  } | null
}

function formatDuration(seconds: number | null): string | null {
  if (!seconds || seconds <= 0) return null
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s.toString().padStart(2, "0")}s`
}

export default function VoiceInterviewResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = use(params)

  const [session, setSession] = useState<Session | null>(null)
  const [responses, setResponses] = useState<Response[]>([])
  const [state, setState] = useState<"loading" | "ready" | "error">("loading")

  useEffect(() => {
    fetch(`/api/video-interview/${sessionId}`)
      .then((r) => r.json())
      .then((b) => {
        if (!b.success) throw new Error()
        setSession(b.data.session)
        setResponses(b.data.responses ?? [])
        setState("ready")
      })
      .catch(() => setState("error"))
  }, [sessionId])

  if (state === "loading") {
    return (
      <>
        <ToolTopBar title="Interview feedback" backHref="/dashboard/video-interview" />
        <div className="mx-auto w-full max-w-[860px] px-8 py-8">
          <ListSkeleton rows={5} />
        </div>
      </>
    )
  }

  if (state === "error" || !session) {
    return (
      <>
        <ToolTopBar title="Interview feedback" backHref="/dashboard/video-interview" />
        <div className="mx-auto w-full max-w-[860px] px-8 py-8">
          <ErrorState
            title="We couldn't find that interview"
            description="It may have been deleted, or it belongs to another account."
          />
        </div>
      </>
    )
  }

  const duration = formatDuration(session.totalTime)
  const answered = responses.filter((r) => r.responseText?.trim()).length
  const segments = session.transcriptionData?.segments ?? []

  return (
    <>
      <ToolTopBar title="Interview feedback" backHref="/dashboard/video-interview" />

      <div className="mx-auto w-full max-w-[860px] px-8 py-8">
        {/* ---- Header ---- */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-[28px] leading-tight text-ink">
              {session.jobTitle}
            </h1>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              {session.companyName}
              {duration && ` · ${duration}`}
              {answered > 0 && ` · ${answered} answered`}
            </p>
          </div>

          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/video-interview/enhanced">Interview again</Link>
          </Button>
        </div>

        {/* ---- The score, or an honest absence of one ---- */}
        <Card className="mt-6 p-6">
          {typeof session.overallScore === "number" ? (
            <div className="flex items-baseline justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                  Overall
                </p>
                <p
                  className={cn(
                    "mt-1 text-[15px] font-bold",
                    session.overallScore >= 70 ? "text-brand" : "text-clay"
                  )}
                >
                  {session.overallScore >= 70
                    ? "You'd hold up in this room."
                    : "There's work to do here."}
                </p>
              </div>

              <p className="font-display text-[34px] leading-none text-ink">
                {Math.round(session.overallScore)}
                <span className="ml-0.5 text-[16px] text-ink-faint">/100</span>
              </p>
            </div>
          ) : (
            /* No invented number. The old results screen showed confidence, engagement and
               delivery scores that nothing in the codebase ever computed. */
            <>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                Not scored
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
                This session doesn&apos;t have a score — it ended early, or scoring
                didn&apos;t finish. Your transcript is below, and it&apos;s the honest record
                of what you said.
              </p>
            </>
          )}

          {session.feedback?.summary && (
            <p className="mt-5 border-t border-border pt-5 text-[15px] leading-relaxed text-ink-2">
              {session.feedback.summary}
            </p>
          )}
        </Card>

        {/* ---- Strengths / improvements, only if the model actually produced them ---- */}
        {(session.feedback?.strengths?.length || session.feedback?.improvements?.length) && (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {session.feedback.strengths?.length ? (
              <Card className="p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                  What landed
                </p>
                <ul className="mt-3 space-y-2">
                  {session.feedback.strengths.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[14px] leading-relaxed text-ink-2"
                    >
                      <span aria-hidden="true" className="mt-0.5 text-[11px] text-brand">
                        ✓
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}

            {session.feedback.improvements?.length ? (
              <Card className="bg-clay-tint p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-clay">
                  Do this next time
                </p>
                <ul className="mt-3 space-y-2">
                  {session.feedback.improvements.map((s, i) => (
                    <li key={i} className="text-[14px] leading-relaxed text-ink-2">
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}
          </div>
        )}

        {/* ---- Per-question ---- */}
        {responses.length > 0 && (
          <div className="mt-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Question by question
            </p>

            <div className="mt-3 space-y-3">
              {responses.map((r) => (
                <Card key={r.id} className="p-5">
                  <p className="text-[15px] font-semibold text-ink">{r.questionText}</p>

                  {r.responseText?.trim() ? (
                    <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
                      &ldquo;{r.responseText}&rdquo;
                    </p>
                  ) : (
                    <p className="mt-2 text-[14px] italic text-ink-faint">
                      You didn&apos;t get to this one.
                    </p>
                  )}

                  {typeof r.starScore === "number" && (
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                      STAR structure: {r.starScore}/100
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ---- Transcript ---- */}
        {segments.length > 0 && (
          <details className="mt-8 rounded-card border border-border bg-card p-5">
            <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              Full transcript
            </summary>

            <ul className="mt-4 space-y-3">
              {segments.map((seg, i) => (
                <li key={i}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                    {seg.speaker === "ai" ? "Sarah" : "You"}
                  </p>
                  <p className="mt-0.5 text-[14px] leading-relaxed text-ink-2">{seg.text}</p>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </>
  )
}
