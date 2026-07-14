"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { ToolTopBar } from "@/components/layout/tool-top-bar"
import { JobContextStrip } from "@/components/journey/job-context-strip"
import { Button, CreditCost } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState, ListSkeleton } from "@/components/ui/states"
import { useTargetJob } from "@/lib/hooks/use-target-job"
import { CREDIT_COSTS } from "@/lib/types/credits"
import { cn } from "@/lib/utils"

interface PastInterview {
  id: string
  sessionId: string
  title: string
  status: string
  jobTitle: string
  companyName: string
  createdAt: string
  overallScore?: number
}

const STATUS_LABEL: Record<string, string> = {
  completed: "Completed",
  in_progress: "Unfinished",
  scheduled: "Not started",
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export default function VideoInterviewHubPage() {
  const { job, progress } = useTargetJob()

  const [past, setPast] = useState<PastInterview[] | null>(null)

  useEffect(() => {
    fetch("/api/video-interview/list?limit=10")
      .then((r) => r.json())
      .then((b) => setPast(b.success ? (b.data.videoInterviews ?? []) : []))
      .catch(() => setPast([]))
  }, [])

  return (
    <>
      <ToolTopBar title="Voice interview" />
      <JobContextStrip job={job} progress={progress} current="voice" />

      <div className="mx-auto w-full max-w-[900px] px-8 py-8">
        {/* ---- Start ---- */}
        <Card className="overflow-hidden bg-brand-deep p-8 text-paper">
          <h1 className="max-w-[520px] font-display text-[32px] leading-tight">
            Say it out loud, before it counts.
          </h1>
          <p className="mt-3 max-w-[480px] text-[15px] leading-relaxed text-paper/75">
            A spoken interview for {job?.role ?? "the job you're chasing"}
            {job?.company ? ` at ${job.company}` : ""} — you answer with your voice, and get
            told what actually landed.
          </p>

          <Button asChild variant="onDark" size="lg" className="mt-6">
            <Link href="/dashboard/video-interview/enhanced">
              Start an interview
              <CreditCost
                credits={CREDIT_COSTS.VIDEO_INTERVIEW}
                className="bg-brand-deep/10 text-brand-deep"
              />
            </Link>
          </Button>

          <p className="mt-3 font-mono text-[10px] tracking-[0.06em] text-paper/50">
            About ten minutes. We check your microphone before charging you.
          </p>
        </Card>

        {/* ---- History ---- */}
        <div className="mt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            Past sessions
          </p>

          <div className="mt-3">
            {past === null ? (
              <ListSkeleton rows={3} />
            ) : past.length === 0 ? (
              <EmptyState
                code="VI"
                tone="brand"
                title="No interviews yet"
                description="The first one is the worst one. Better it happens here than in front of the person deciding."
              />
            ) : (
              <Card className="overflow-hidden p-0">
                <ul className="divide-y divide-border">
                  {past.map((interview) => (
                    <li
                      key={interview.id}
                      className="flex flex-wrap items-center gap-4 px-5 py-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-ink">
                          {interview.jobTitle}
                          <span className="font-normal text-ink-muted">
                            {" "}
                            · {interview.companyName}
                          </span>
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                          {STATUS_LABEL[interview.status] ?? interview.status} ·{" "}
                          {formatDate(interview.createdAt)}
                        </p>
                      </div>

                      {typeof interview.overallScore === "number" && (
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] tracking-[0.06em]",
                            interview.overallScore >= 70
                              ? "bg-brand-tint text-brand"
                              : "bg-clay-tint text-clay"
                          )}
                        >
                          {Math.round(interview.overallScore)}/100
                        </span>
                      )}

                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/video-interview/${interview.sessionId}`}>
                          Feedback
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
