"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Monogram, TOOL_MONOGRAMS } from "@/components/ui/monogram"
import { Skeleton } from "@/components/ui/skeleton"
import { ContinueJourney } from "@/components/dashboard/continue-journey"
import { useTargetJob } from "@/lib/hooks/use-target-job"
import { useCredits } from "@/lib/hooks/use-credits"
import { isJourneyComplete } from "@/lib/journey"
import { CREDIT_COSTS } from "@/lib/types/credits"
import { cn } from "@/lib/utils"

/**
 * The dashboard, to the design.
 *
 * Two things the design shows that this app cannot honestly show, and therefore doesn't:
 *
 *  - A search field in the top bar. There is no search endpoint; a box that searches
 *    nothing is worse than no box.
 *  - "FREE" under the résumé builder. POST /api/resumes charges CREDIT_COSTS.RESUME_BUILDER,
 *    so the card quotes that instead. Every cost below is read from CREDIT_COSTS, which is
 *    the same constant the billing code prices against.
 */

const costLabel = (n: number) => (n === 0 ? "FREE" : `${n} CREDITS`)

const TOOLS = [
  {
    ...TOOL_MONOGRAMS.resumeBuilder,
    href: "/dashboard/resume-builder",
    blurb: "Edit your draft or start a new one.",
    cost: costLabel(CREDIT_COSTS.RESUME_BUILDER),
  },
  {
    ...TOOL_MONOGRAMS.tailor,
    href: "/dashboard/resume-tailoring",
    blurb: "Match a résumé to a new posting.",
    cost: costLabel(CREDIT_COSTS.RESUME_TAILORING),
  },
  {
    ...TOOL_MONOGRAMS.coverLetter,
    href: "/dashboard/cover-letter",
    blurb: "Draft one for the job you're chasing.",
    cost: costLabel(CREDIT_COSTS.COVER_LETTER),
  },
  {
    ...TOOL_MONOGRAMS.interviewPrep,
    href: "/dashboard/interview",
    blurb: "Practise questions with STAR scoring.",
    cost: costLabel(CREDIT_COSTS.TEXT_INTERVIEW),
  },
  {
    ...TOOL_MONOGRAMS.voice,
    href: "/dashboard/video-interview",
    blurb: "Live spoken mock with an AI interviewer.",
    cost: costLabel(CREDIT_COSTS.VIDEO_INTERVIEW),
  },
  {
    ...TOOL_MONOGRAMS.myResumes,
    href: "/dashboard/view-resumes",
    blurb: "Open, preview, download.",
    cost: "FREE",
  },
]

interface Transaction {
  id: string
  amount: number
  description: string | null
  type: string
  createdAt: string
}

function greeting(date = new Date()) {
  const h = date.getHours()
  if (h < 12) return "Good morning"
  if (h < 18) return "Good afternoon"
  return "Good evening"
}

/** "2h ago" / "Yesterday" — the design's relative stamp. */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ""

  const mins = Math.round((Date.now() - then) / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`

  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  if (hours < 48) return "Yesterday"

  return `${Math.round(hours / 24)}d ago`
}

function Stat({
  label,
  value,
  isLoading,
  action,
}: {
  label: string
  value: number | string
  isLoading?: boolean
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between rounded-[14px] border border-[rgba(33,31,28,.08)] bg-[#fffdf8] px-[22px] py-5">
      <div>
        <p className="mb-2 font-mono text-[11px] tracking-[0.08em] text-[#8a837a]">
          {label}
        </p>
        {isLoading ? (
          <Skeleton className="h-9 w-12" />
        ) : (
          <p className="font-display text-[38px] leading-none text-[#211f1c]">{value}</p>
        )}
      </div>
      {action}
    </div>
  )
}

export function DashboardHome() {
  const { data: session } = useSession()
  const { job, progress, nextStep, isLoading: jobLoading } = useTargetJob()
  const { balance, isLoading: creditsLoading } = useCredits()

  const [resumeCount, setResumeCount] = useState<number | null>(null)
  const [activity, setActivity] = useState<Transaction[] | null>(null)

  useEffect(() => {
    fetch("/api/resumes")
      .then((r) => r.json())
      .then((b) => {
        const list = b?.resumes ?? b?.data ?? []
        setResumeCount(Array.isArray(list) ? list.length : 0)
      })
      .catch(() => setResumeCount(0))

    fetch("/api/credits/transactions?limit=3")
      .then((r) => r.json())
      .then((b) => setActivity(b?.data?.transactions ?? []))
      .catch(() => setActivity([]))
  }, [])

  const firstName = session?.user?.name?.split(" ")[0] ?? null

  return (
    <>
      {/* ---- Top bar ---- */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(33,31,28,.08)] bg-[#fffdf8] px-[34px] py-[22px]">
        <div>
          <p className="mb-[3px] font-mono text-[11px] uppercase tracking-[0.1em] text-[#a79f93]">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="font-display text-[26px] text-[#211f1c]">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-[14px]">
          <span className="flex items-center gap-[7px] rounded-[10px] bg-[#e7efe8] px-[13px] py-[9px] font-mono text-[13px] font-medium text-[#2e6a4a]">
            ◇ {creditsLoading ? "—" : (balance ?? 0)}
          </span>

          <Link
            href="/dashboard/resume-builder"
            className="inline-flex items-center gap-2 rounded-[10px] bg-[#2e6a4a] px-4 py-2.5 text-[14px] font-semibold text-[#f4efe6] hover:bg-[#26583d]"
          >
            + New résumé
          </Link>
        </div>
      </header>

      {/* ---- Content ---- */}
      <div className="flex-1 overflow-auto px-[34px] py-[30px]">
        <div className="mb-[26px]">
          {jobLoading ? (
            <Skeleton className="h-[200px] w-full rounded-[18px]" />
          ) : (
            <ContinueJourney
              job={job}
              progress={progress}
              nextStep={nextStep}
              isComplete={isJourneyComplete(job)}
            />
          )}
        </div>

        {/* Stats — real numbers, from real data. */}
        <div className="mb-[26px] grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat
            label="CREDITS LEFT"
            value={balance ?? 0}
            isLoading={creditsLoading}
            action={
              <Link
                href="/pricing"
                className="text-[13px] font-semibold text-[#2e6a4a] hover:text-[#26583d]"
              >
                Buy more →
              </Link>
            }
          />
          <Stat
            label="RÉSUMÉS"
            value={resumeCount ?? 0}
            isLoading={resumeCount === null}
          />
          <Stat
            label="APPLICATIONS IN PROGRESS"
            value={job ? 1 : 0}
            isLoading={jobLoading}
          />
        </div>

        {/* Tools */}
        <div className="mb-[14px] flex items-baseline justify-between">
          <h2 className="text-[17px] font-bold text-[#211f1c]">Jump back in</h2>
          <Link href="/pricing" className="text-[13px] text-[#8a837a] hover:text-[#2e6a4a]">
            What things cost →
          </Link>
        </div>

        <div className="mb-[26px] grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="block rounded-[14px] border border-[rgba(33,31,28,.08)] bg-[#fffdf8] p-5 transition-colors hover:border-[#2e6a4a] hover:shadow-[0_16px_40px_-30px_rgba(30,25,20,.4)]"
            >
              <Monogram tone={tool.tone}>{tool.code}</Monogram>

              <p className="mb-[5px] mt-[14px] text-[16px] font-bold text-[#211f1c]">
                {tool.label}
              </p>
              <p className="mb-[14px] text-[13px] leading-[1.5] text-[#6f685f]">
                {tool.blurb}
              </p>
              <p className="font-mono text-[11px] tracking-[0.05em] text-[#8a837a]">
                {tool.cost}
              </p>
            </Link>
          ))}
        </div>

        {/* Recent activity — the real credit ledger, not invented rows. */}
        <h2 className="mb-[14px] text-[17px] font-bold text-[#211f1c]">Recent activity</h2>

        <div className="overflow-hidden rounded-[14px] border border-[rgba(33,31,28,.08)] bg-[#fffdf8]">
          {activity === null ? (
            <div className="space-y-3 p-5">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <p className="px-5 py-[15px] text-[14px] text-[#6f685f]">
              Nothing yet. Credits you spend, earn and get refunded will show up here.
            </p>
          ) : (
            <ul>
              {activity.map((tx, i) => (
                <li
                  key={tx.id}
                  className={cn(
                    "flex items-center gap-[14px] px-5 py-[15px]",
                    i < activity.length - 1 && "border-b border-[rgba(33,31,28,.06)]"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-[9px] w-[9px] shrink-0 rounded-full",
                      tx.amount > 0 ? "bg-[#2e6a4a]" : "bg-[#c9c2b6]"
                    )}
                  />

                  <span className="flex-1 text-[14px] text-[#3a352e]">
                    {tx.description ?? tx.type.replace(/_/g, " ").toLowerCase()}
                    {tx.amount !== 0 && (
                      <>
                        {" · "}
                        <span className="font-semibold">
                          {tx.amount > 0 ? `+${tx.amount}` : `${Math.abs(tx.amount)}`}{" "}
                          credit{Math.abs(tx.amount) === 1 ? "" : "s"}
                        </span>
                      </>
                    )}
                  </span>

                  <span className="shrink-0 font-mono text-[12px] text-[#a79f93]">
                    {relativeTime(tx.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
