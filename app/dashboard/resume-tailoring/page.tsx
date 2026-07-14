"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ToolTopBar } from "@/components/layout/tool-top-bar"
import { JobContextStrip } from "@/components/journey/job-context-strip"
import { MatchRing } from "@/components/resume-tailoring/match-ring"
import { Button, CreditCost } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input, FieldLabel } from "@/components/ui/input"
import { EmptyState, ListSkeleton } from "@/components/ui/states"
import { useTargetJob } from "@/lib/hooks/use-target-job"
import { notifyCreditsChanged } from "@/lib/hooks/use-credits"
import { CREDIT_COSTS } from "@/lib/types/credits"
import { cn } from "@/lib/utils"

interface Resume {
  id: string
  title: string
}

interface Change {
  type: "added" | "reworded" | "reordered" | "missing"
  text: string
}

const CHANGE_STYLE: Record<Change["type"], { glyph: string; className: string; label: string }> = {
  added: { glyph: "+", className: "text-brand", label: "Added" },
  reworded: { glyph: "~", className: "text-ink-muted", label: "Reworded" },
  reordered: { glyph: "↑", className: "text-ink-muted", label: "Reordered" },
  missing: { glyph: "!", className: "text-clay", label: "Still missing" },
}

export default function ResumeTailoringPage() {
  const { job, progress, setTargetJob, linkArtifact } = useTargetJob()

  const [resumes, setResumes] = useState<Resume[] | null>(null)
  const [baseResumeId, setBaseResumeId] = useState("")
  const [role, setRole] = useState("")
  const [company, setCompany] = useState("")
  const [description, setDescription] = useState("")

  const [isTailoring, setIsTailoring] = useState(false)
  const [result, setResult] = useState<{
    id: string
    matchScore: number
    changes: Change[]
  } | null>(null)

  useEffect(() => {
    fetch("/api/resumes")
      .then((r) => r.json())
      .then((b) => {
        const list: Resume[] = b.resumes ?? b.data ?? []
        setResumes(list)
        if (list.length && !baseResumeId) setBaseResumeId(list[0].id)
      })
      .catch(() => setResumes([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pre-fill from the job the user is already chasing — the whole point of the journey.
  useEffect(() => {
    if (job) {
      setRole((r) => r || job.role)
      setCompany((c) => c || job.company)
      setDescription((d) => d || job.description || "")
    }
  }, [job])

  const canTailor = baseResumeId && role.trim() && company.trim() && description.trim().length > 40

  async function handleTailor() {
    if (!canTailor) return
    setIsTailoring(true)
    setResult(null)

    try {
      // Capture the job first, so it carries into the cover letter and interview prep
      // even if the user stops here.
      await setTargetJob({ role, company, description })

      const res = await fetch("/api/resume-tailoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseResumeId,
          jobTitle: role,
          companyName: company,
          jobDescription: description,
        }),
      })

      const body = await res.json()

      if (res.status === 402) {
        toast.error("Not enough credits to tailor this résumé.")
        return
      }
      if (!res.ok || !body.success) {
        toast.error(body.error ?? "Tailoring didn't complete. You haven't been charged.")
        return
      }

      const tailored = body.tailoredResume
      const meta = tailored.tailoringMetadata ?? {}
      const detailed = meta.detailedChanges ?? {}

      const changes: Change[] = [
        ...(detailed.skills?.keywordsAdded ?? []).map((t: string) => ({
          type: "added" as const,
          text: `Added “${t}” — it's in the posting and in your history.`,
        })),
        ...(meta.tailoringNotes ? [{ type: "reworded" as const, text: meta.tailoringNotes }] : []),
      ]

      setResult({
        id: tailored.id,
        matchScore: tailored.matchScore ?? meta.matchScore ?? 0,
        changes,
      })

      // Advance the journey.
      await linkArtifact({ baseResumeId, tailoredResumeId: tailored.id })
      notifyCreditsChanged()
      toast.success("Résumé tailored to this job.")
    } catch {
      toast.error("Tailoring failed. You haven't been charged.")
    } finally {
      setIsTailoring(false)
    }
  }

  return (
    <>
      <ToolTopBar title="Tailor to a job" />
      <JobContextStrip job={job} progress={progress} current="tailored" />

      <div className="mx-auto w-full max-w-[1100px] px-8 py-8">
        {resumes === null ? (
          <ListSkeleton rows={3} />
        ) : resumes.length === 0 ? (
          <EmptyState
            code="RB"
            title="You need a résumé first"
            description="Tailoring rewrites an existing résumé for a specific job — so there has to be one to rewrite."
            action={
              <Button asChild>
                <Link href="/dashboard/resume-builder">Build a résumé</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* ---- Input ---- */}
            <Card className="h-fit p-6">
              <div>
                <FieldLabel htmlFor="base">Base résumé</FieldLabel>
                <select
                  id="base"
                  value={baseResumeId}
                  onChange={(e) => setBaseResumeId(e.target.value)}
                  className="h-11 w-full rounded-input border border-border bg-[var(--card-plain)] px-3.5 text-[15px] text-ink focus-visible:border-brand focus-visible:shadow-focus focus-visible:outline-none"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="role">Role</FieldLabel>
                  <Input
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Product Analyst"
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="company">Company</FieldLabel>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Northwind Labs"
                  />
                </div>
              </div>

              <div className="mt-4">
                <FieldLabel htmlFor="jd">Job description</FieldLabel>
                <textarea
                  id="jd"
                  rows={11}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Paste the posting here. The more of it, the better the match."
                  className="w-full rounded-input border border-border bg-[var(--card-plain)] px-3.5 py-3 text-[14px] leading-relaxed text-ink placeholder:text-ink-faint focus-visible:border-brand focus-visible:shadow-focus focus-visible:outline-none"
                />
                <p className="mt-1.5 font-mono text-[10px] tracking-[0.06em] text-ink-faint">
                  This job carries into your cover letter and interview prep.
                </p>
              </div>

              <Button
                size="lg"
                className="mt-6 w-full"
                onClick={handleTailor}
                disabled={!canTailor || isTailoring}
              >
                {isTailoring ? (
                  "Tailoring…"
                ) : (
                  <>
                    Tailor my résumé
                    <CreditCost credits={CREDIT_COSTS.RESUME_TAILORING} />
                  </>
                )}
              </Button>
            </Card>

            {/* ---- Result ---- */}
            <div>
              {isTailoring ? (
                <Card className="p-6">
                  <div className="h-[86px] w-[86px] animate-pulse rounded-full bg-section-tint" />
                  <p className="mt-5 text-[15px] text-ink-muted">
                    Reading the posting and rewriting your résumé against it…
                  </p>
                  <p className="mt-1.5 font-mono text-[11px] tracking-[0.06em] text-ink-faint">
                    Usually 10–30 seconds. You&apos;re only charged if it works.
                  </p>
                </Card>
              ) : result ? (
                <Card className="p-6">
                  <MatchRing score={result.matchScore} />

                  {result.changes.length > 0 && (
                    <div className="mt-7">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                        What changed
                      </p>

                      <ul className="mt-3 space-y-2.5">
                        {result.changes.map((change, i) => {
                          const style = CHANGE_STYLE[change.type]
                          return (
                            <li key={i} className="flex items-start gap-2.5">
                              <span
                                aria-hidden="true"
                                className={cn(
                                  "mt-0.5 font-mono text-[13px] font-bold",
                                  style.className
                                )}
                              >
                                {style.glyph}
                              </span>
                              <span className="text-[14px] leading-relaxed text-ink-2">
                                {change.text}
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}

                  <div className="mt-7 flex flex-wrap gap-2 border-t border-border pt-5">
                    <Button asChild size="sm">
                      <Link href="/dashboard/cover-letter">
                        Next: cover letter
                        <CreditCost credits={CREDIT_COSTS.COVER_LETTER} />
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/dashboard/view-resumes">View résumé</Link>
                    </Button>
                  </div>
                </Card>
              ) : (
                <EmptyState
                  code="TL"
                  tone="olive"
                  title="Your tailored résumé will appear here"
                  description="Paste the posting, and we'll rewrite your résumé against it — then show you exactly what changed."
                />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
