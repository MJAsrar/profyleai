"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

import { Button, CreditCost } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FieldLabel } from "@/components/ui/input"
import { EmptyState, ListSkeleton } from "@/components/ui/states"
import { notifyCreditsChanged } from "@/lib/hooks/use-credits"
import { CREDIT_COSTS } from "@/lib/types/credits"
import { cn } from "@/lib/utils"
import type { InterviewJobData, PracticeQuestion } from "@/lib/services/interview-service"
import type { TargetJobSummary } from "@/lib/journey"

interface ResumeOption {
  id: string
  title: string
  [key: string]: unknown
}

type MicState = "idle" | "asking" | "granted" | "denied"

export interface VoiceSetupResult {
  jobData: InterviewJobData
  selectedResume: any
  questions: PracticeQuestion[]
}

/**
 * Setup for the live voice interview.
 *
 * Three things it deliberately does NOT do:
 *  - Ask for the job again. It comes from the journey.
 *  - Pay twice for questions. If interview prep already wrote them for this job, they're
 *    reused; the old setup regenerated them every time, charging for text questions on top
 *    of the voice session.
 *  - Take your credits before checking your microphone works. A voice interview you can't
 *    speak in is a wasted charge.
 */
export function VoiceSetup({
  job,
  onReady,
  isStarting,
}: {
  job: TargetJobSummary
  onReady: (result: VoiceSetupResult) => void
  isStarting: boolean
}) {
  const [resumes, setResumes] = useState<ResumeOption[] | null>(null)
  const [resumeId, setResumeId] = useState("")

  const [questions, setQuestions] = useState<PracticeQuestion[] | null>(null)
  const [questionsAreReused, setQuestionsAreReused] = useState(false)
  const [isPreparing, setIsPreparing] = useState(false)

  const [mic, setMic] = useState<MicState>("idle")
  const [level, setLevel] = useState(0)

  const streamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number | null>(null)

  // ---- résumés ----
  useEffect(() => {
    fetch("/api/resumes")
      .then((r) => r.json())
      .then((b) => {
        const list: ResumeOption[] = b.data ?? b.resumes ?? []
        setResumes(list)
        if (list.length) setResumeId(list[0].id)
      })
      .catch(() => setResumes([]))
  }, [])

  // ---- questions: reuse what interview prep already wrote, if anything ----
  useEffect(() => {
    if (!job.interviewPrepId) return

    fetch(`/api/interview/${job.interviewPrepId}`)
      .then((r) => r.json())
      .then((b) => {
        const list: PracticeQuestion[] = b?.data?.questions ?? []
        if (list.length) {
          setQuestions(list)
          setQuestionsAreReused(true)
        }
      })
      .catch(() => {
        /* fall through to generating them */
      })
  }, [job.interviewPrepId])

  // ---- microphone ----
  const stopMic = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    audioCtxRef.current?.close().catch(() => {})
    rafRef.current = null
    streamRef.current = null
    audioCtxRef.current = null
  }, [])

  useEffect(() => stopMic, [stopMic])

  async function testMic() {
    setMic("asking")

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const ctx = new AudioContext()
      audioCtxRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)

      const buf = new Uint8Array(analyser.frequencyBinCount)

      const tick = () => {
        analyser.getByteTimeDomainData(buf)
        // RMS around the 128 midpoint — a real level, not a random bar.
        let sum = 0
        for (const v of buf) sum += (v - 128) ** 2
        setLevel(Math.min(1, Math.sqrt(sum / buf.length) / 40))
        rafRef.current = requestAnimationFrame(tick)
      }
      tick()

      setMic("granted")
    } catch {
      setMic("denied")
    }
  }

  // ---- start ----
  async function start() {
    if (!resumeId) return

    const resume = resumes?.find((r) => r.id === resumeId)
    if (!resume) return

    const jobData: InterviewJobData = {
      companyName: job.company,
      jobTitle: job.role,
      jobDescription: job.description ?? "",
    }

    let list = questions

    if (!list?.length) {
      setIsPreparing(true)
      try {
        const res = await fetch("/api/interview/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...jobData, questionCount: 6 }),
        })
        const body = await res.json()

        if (res.status === 402) {
          toast.error("Not enough credits to write your questions.")
          return
        }
        if (!res.ok || !body.success) {
          toast.error(body.error ?? "Couldn't prepare your questions. You haven't been charged.")
          return
        }

        list = body.data.questions ?? []
        setQuestions(list)
        notifyCreditsChanged()
      } catch {
        toast.error("Couldn't prepare your questions. You haven't been charged.")
        return
      } finally {
        setIsPreparing(false)
      }
    }

    if (!list?.length) return

    stopMic()
    onReady({ jobData, selectedResume: resume, questions: list })
  }

  if (resumes === null) return <ListSkeleton rows={3} />

  if (resumes.length === 0) {
    return (
      <EmptyState
        code="RB"
        title="You need a résumé first"
        description="The interviewer asks about your actual history — so there has to be one on file."
        action={
          <Button asChild>
            <Link href="/dashboard/resume-builder">Build a résumé</Link>
          </Button>
        }
      />
    )
  }

  const ready = mic === "granted" && Boolean(resumeId)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* ---- Left: what we'll ask about ---- */}
      <Card className="p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          Interviewing for
        </p>
        <h2 className="mt-1.5 font-display text-[26px] leading-tight text-ink">{job.role}</h2>
        <p className="text-[15px] text-ink-muted">{job.company}</p>

        <div className="mt-6">
          <FieldLabel htmlFor="resume">Answer as</FieldLabel>
          <select
            id="resume"
            value={resumeId}
            onChange={(e) => setResumeId(e.target.value)}
            className="h-11 w-full rounded-input border border-border bg-[var(--card-plain)] px-3.5 text-[15px] text-ink focus-visible:border-brand focus-visible:shadow-focus focus-visible:outline-none"
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
          <p className="mt-1.5 font-mono text-[10px] tracking-[0.06em] text-ink-faint">
            The interviewer reads this before it starts, and asks about what&apos;s on it.
          </p>
        </div>

        {questions && (
          <div className="mt-6 rounded-[10px] bg-section-tint p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              {questions.length} questions ready
              {questionsAreReused && " · reused from your interview prep, no extra charge"}
            </p>
            <ul className="mt-2.5 space-y-1.5">
              {questions.slice(0, 3).map((q) => (
                <li key={q.id} className="text-[13px] leading-relaxed text-ink-2">
                  {q.question}
                </li>
              ))}
            </ul>
            {questions.length > 3 && (
              <p className="mt-2 font-mono text-[10px] text-ink-faint">
                and {questions.length - 3} more — you won&apos;t see them in advance.
              </p>
            )}
          </div>
        )}
      </Card>

      {/* ---- Right: mic check + start ---- */}
      <Card className="h-fit p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          Check your microphone
        </p>

        <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
          This is a spoken interview. Test your mic before you spend anything — headphones
          help, or the interviewer hears itself.
        </p>

        {mic === "granted" ? (
          <div className="mt-5">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />
              <span className="text-[13px] font-semibold text-brand">
                Mic on — say something
              </span>
            </div>

            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-section-tint"
              role="meter"
              aria-label="Microphone level"
              aria-valuenow={Math.round(level * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-75"
                style={{ width: `${Math.round(level * 100)}%` }}
              />
            </div>

            <p className="mt-2 font-mono text-[10px] tracking-[0.06em] text-ink-faint">
              {level > 0.08 ? "We can hear you." : "Speak up — the bar should move."}
            </p>
          </div>
        ) : mic === "denied" ? (
          <div className="mt-5 rounded-[10px] bg-clay-tint p-4">
            <p className="text-[13px] font-semibold text-clay">Microphone blocked</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
              Your browser is refusing access. Allow the mic for this site in the address
              bar, then test again.
            </p>
            <Button size="sm" variant="outline" className="mt-3" onClick={testMic}>
              Test again
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="mt-5 w-full"
            onClick={testMic}
            disabled={mic === "asking"}
          >
            {mic === "asking" ? "Waiting for permission…" : "Test my microphone"}
          </Button>
        )}

        <div className="mt-6 border-t border-border pt-5">
          <Button
            size="lg"
            className="w-full"
            onClick={start}
            disabled={!ready || isStarting || isPreparing}
          >
            {isPreparing ? (
              "Writing your questions…"
            ) : isStarting ? (
              "Starting…"
            ) : (
              <>
                Start the interview
                <CreditCost credits={CREDIT_COSTS.VIDEO_INTERVIEW} />
              </>
            )}
          </Button>

          <p
            className={cn(
              "mt-3 font-mono text-[10px] leading-relaxed tracking-[0.06em]",
              ready ? "text-ink-faint" : "text-clay"
            )}
          >
            {ready
              ? "Charged when the interview starts. About 10 minutes."
              : "Test your microphone first — we won't charge you until it works."}
          </p>
        </div>
      </Card>
    </div>
  )
}
