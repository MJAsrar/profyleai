"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Monogram, TOOL_MONOGRAMS } from "@/components/ui/monogram"
import { Skeleton } from "@/components/ui/skeleton"
import { ContinueJourney } from "@/components/dashboard/continue-journey"
import { CreditChip } from "@/components/layout/tool-top-bar"
import { useTargetJob } from "@/lib/hooks/use-target-job"
import { useCredits } from "@/lib/hooks/use-credits"
import { isJourneyComplete } from "@/lib/journey"

const TOOLS = [
  { ...TOOL_MONOGRAMS.resumeBuilder, href: "/dashboard/resume-builder", blurb: "Start or edit a résumé." },
  { ...TOOL_MONOGRAMS.tailor, href: "/dashboard/resume-tailoring", blurb: "Rewrite it for a specific job." },
  { ...TOOL_MONOGRAMS.coverLetter, href: "/dashboard/cover-letter", blurb: "A letter that cites your work." },
  { ...TOOL_MONOGRAMS.interviewPrep, href: "/dashboard/interview", blurb: "Practise the real questions." },
  { ...TOOL_MONOGRAMS.voice, href: "/dashboard/video-interview", blurb: "Speak it out loud with an AI." },
  { ...TOOL_MONOGRAMS.myResumes, href: "/dashboard/view-resumes", blurb: "Everything you've saved." },
]

function greeting(date = new Date()) {
  const h = date.getHours()
  if (h < 12) return "Good morning"
  if (h < 18) return "Good afternoon"
  return "Good evening"
}

/** A real number, read from real data — not a hardcoded stat. */
function Stat({ label, value, isLoading }: { label: string; value: number | string; isLoading?: boolean }) {
  return (
    <Card className="p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{label}</p>
      {isLoading ? (
        <Skeleton className="mt-2 h-8 w-14" />
      ) : (
        <p className="mt-1.5 font-display text-[34px] leading-none text-ink">{value}</p>
      )}
    </Card>
  )
}

export function DashboardHome() {
  const { data: session } = useSession()
  const { job, progress, nextStep, isLoading: jobLoading } = useTargetJob()
  const { balance, isLoading: creditsLoading } = useCredits()

  const [resumeCount, setResumeCount] = useState<number | null>(null)
  const [tailoredCount, setTailoredCount] = useState<number | null>(null)

  useEffect(() => {
    // Real counts, so the dashboard reflects the user's actual reality.
    Promise.all([
      fetch("/api/resumes").then((r) => r.json()).catch(() => null),
      fetch("/api/tailored-resumes").then((r) => r.json()).catch(() => null),
    ]).then(([resumes, tailored]) => {
      const list = resumes?.resumes ?? resumes?.data ?? []
      const tList = tailored?.tailoredResumes ?? tailored?.data ?? []
      setResumeCount(Array.isArray(list) ? list.length : 0)
      setTailoredCount(Array.isArray(tList) ? tList.length : 0)
    })
  }, [])

  const firstName = session?.user?.name?.split(" ")[0] ?? null

  return (
    <div className="mx-auto w-full max-w-[1100px] px-8 py-8">
      {/* Header — personalised, with the user's actual name. */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="mt-1.5 font-display text-[30px] leading-tight text-ink">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}.
          </h1>
        </div>

        <CreditChip />
      </div>

      {/* The journey — the thing that actually matters. */}
      <div className="mt-7">
        {jobLoading ? (
          <Skeleton className="h-[220px] w-full rounded-panel" />
        ) : (
          <ContinueJourney
            job={job}
            progress={progress}
            nextStep={nextStep}
            isComplete={isJourneyComplete(job)}
          />
        )}
      </div>

      {/* Real stats. */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Credits" value={balance ?? 0} isLoading={creditsLoading} />
        <Stat label="Résumés" value={resumeCount ?? 0} isLoading={resumeCount === null} />
        <Stat label="Tailored" value={tailoredCount ?? 0} isLoading={tailoredCount === null} />
      </div>

      {/* Tools — each visually distinct, not six identical grey cards. */}
      <section className="mt-10">
        <h2 className="font-sans text-[13px] font-bold uppercase tracking-[0.12em] text-ink-faint">
          Jump back in
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link key={tool.href} href={tool.href} className="rounded-card">
              <Card interactive className="h-full p-5">
                <Monogram tone={tool.tone}>{tool.code}</Monogram>
                <h3 className="mt-3.5 font-sans text-[15px] font-bold text-ink">
                  {tool.label}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                  {tool.blurb}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
