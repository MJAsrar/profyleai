"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ToolTopBar } from "@/components/layout/tool-top-bar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState, ErrorState, ListSkeleton } from "@/components/ui/states"
import { Monogram } from "@/components/ui/monogram"
import { cn } from "@/lib/utils"

interface BaseResume {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  template: { id: string; name: string; category: string } | null
}

interface TailoredResume {
  id: string
  title: string
  jobTitle: string
  companyName: string
  matchScore: number | null
  createdAt: string
  baseResume: { id: string; title: string } | null
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export default function ViewResumesPage() {
  const router = useRouter()

  const [resumes, setResumes] = useState<BaseResume[]>([])
  const [tailored, setTailored] = useState<TailoredResume[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [a, b] = await Promise.all([
        fetch("/api/resumes"),
        fetch("/api/tailored-resumes"),
      ])
      if (!a.ok || !b.ok) throw new Error()

      const [ra, rb] = await Promise.all([a.json(), b.json()])
      setResumes(ra.data ?? ra.resumes ?? [])
      setTailored(rb.data ?? rb.tailoredResumes ?? [])
    } catch {
      setError("We couldn't load your résumés.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function download(id: string, title: string, isTailored: boolean) {
    setBusyId(id)
    try {
      const res = await fetch(
        isTailored ? `/api/tailored-resumes/${id}/download` : `/api/resumes/${id}/download`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      )
      if (!res.ok) throw new Error()

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_") || "resume"}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast.error("The download failed. Try again in a moment.")
    } finally {
      setBusyId(null)
    }
  }

  async function remove(id: string, isTailored: boolean) {
    setBusyId(id)
    try {
      const res = await fetch(
        isTailored ? `/api/tailored-resumes/${id}` : `/api/resumes/${id}`,
        { method: "DELETE" }
      )
      if (!res.ok) throw new Error()

      // Drop it locally rather than refetching — the list is already correct.
      if (isTailored) setTailored((t) => t.filter((r) => r.id !== id))
      else setResumes((r) => r.filter((x) => x.id !== id))

      setConfirmingId(null)
      toast.success("Deleted.")
    } catch {
      toast.error("Couldn't delete that. It's still here.")
    } finally {
      setBusyId(null)
    }
  }

  /** Tailored versions belong to the résumé they were cut from — show them there. */
  const versionsOf = (baseId: string) => tailored.filter((t) => t.baseResume?.id === baseId)
  const orphaned = tailored.filter(
    (t) => !t.baseResume || !resumes.some((r) => r.id === t.baseResume!.id)
  )

  return (
    <>
      <ToolTopBar
        title="My résumés"
        actions={
          <Button asChild size="sm">
            <Link href="/dashboard/resume-builder">New résumé</Link>
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-[1000px] px-8 py-8">
        {isLoading ? (
          <ListSkeleton rows={4} />
        ) : error ? (
          <ErrorState title="Couldn't load your résumés" description={error} onRetry={load} />
        ) : resumes.length === 0 && tailored.length === 0 ? (
          <EmptyState
            code="RB"
            title="Nothing here yet"
            description="Build one résumé. Every other tool — tailoring, cover letters, interview prep — works from it."
            action={
              <Button asChild>
                <Link href="/dashboard/resume-builder">Build my résumé</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-5">
            {resumes.map((resume) => {
              const versions = versionsOf(resume.id)

              return (
                <Card key={resume.id} className="overflow-hidden p-0">
                  {/* ---- The base résumé ---- */}
                  <div className="flex flex-wrap items-start gap-4 p-5">
                    <Monogram tone="brand">RB</Monogram>

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-[16px] font-bold text-ink">
                        {resume.title || "Untitled résumé"}
                      </h2>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                        {resume.template?.name ?? "No template"} · edited{" "}
                        {formatDate(resume.updatedAt || resume.createdAt)}
                      </p>
                    </div>

                    <RowActions
                      busy={busyId === resume.id}
                      confirming={confirmingId === resume.id}
                      onEdit={() =>
                        router.push(`/dashboard/resume-builder?resumeId=${resume.id}`)
                      }
                      onDownload={() => download(resume.id, resume.title, false)}
                      onAskDelete={() => setConfirmingId(resume.id)}
                      onCancelDelete={() => setConfirmingId(null)}
                      onConfirmDelete={() => remove(resume.id, false)}
                      deleteWarning={
                        versions.length > 0
                          ? `This also deletes ${versions.length} tailored version${versions.length === 1 ? "" : "s"}.`
                          : undefined
                      }
                    />
                  </div>

                  {/* ---- Its tailored versions ---- */}
                  {versions.length > 0 && (
                    <ul className="divide-y divide-border border-t border-border bg-section-tint">
                      {versions.map((v) => (
                        <li
                          key={v.id}
                          className="flex flex-wrap items-center gap-4 px-5 py-3.5"
                        >
                          <span
                            aria-hidden="true"
                            className="font-mono text-[11px] text-ink-faint"
                          >
                            ↳
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-semibold text-ink-2">
                              {v.jobTitle}
                              <span className="font-normal text-ink-muted">
                                {" "}
                                · {v.companyName}
                              </span>
                            </p>
                            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                              Tailored {formatDate(v.createdAt)}
                            </p>
                          </div>

                          {typeof v.matchScore === "number" && (
                            <MatchChip score={v.matchScore} />
                          )}

                          <RowActions
                            compact
                            busy={busyId === v.id}
                            confirming={confirmingId === v.id}
                            onEdit={() =>
                              router.push(
                                `/dashboard/resume-builder?tailoredResumeId=${v.id}`
                              )
                            }
                            onDownload={() => download(v.id, v.title || v.jobTitle, true)}
                            onAskDelete={() => setConfirmingId(v.id)}
                            onCancelDelete={() => setConfirmingId(null)}
                            onConfirmDelete={() => remove(v.id, true)}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              )
            })}

            <Link
              href="/dashboard/resume-builder"
              className="flex items-center justify-center gap-2.5 rounded-card border-[1.5px] border-dashed border-[rgba(33,31,28,.2)] px-5 py-6 text-[15px] font-semibold text-[#6f685f] transition-colors hover:border-brand hover:text-brand"
            >
              <span aria-hidden="true" className="text-[18px]">
                +
              </span>
              Create a new résumé
            </Link>

            {/* Tailored résumés whose base has been deleted — still downloadable. */}
            {orphaned.length > 0 && (
              <Card className="p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                  Tailored versions whose original is gone
                </p>

                <ul className="mt-3 divide-y divide-border">
                  {orphaned.map((v) => (
                    <li key={v.id} className="flex flex-wrap items-center gap-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-ink-2">
                          {v.jobTitle}
                          <span className="font-normal text-ink-muted"> · {v.companyName}</span>
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                          Tailored {formatDate(v.createdAt)}
                        </p>
                      </div>

                      {typeof v.matchScore === "number" && <MatchChip score={v.matchScore} />}

                      <RowActions
                        compact
                        busy={busyId === v.id}
                        confirming={confirmingId === v.id}
                        onEdit={() =>
                          router.push(`/dashboard/resume-builder?tailoredResumeId=${v.id}`)
                        }
                        onDownload={() => download(v.id, v.title || v.jobTitle, true)}
                        onAskDelete={() => setConfirmingId(v.id)}
                        onCancelDelete={() => setConfirmingId(null)}
                        onConfirmDelete={() => remove(v.id, true)}
                      />
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  )
}

function MatchChip({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  const strong = clamped >= 80

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] tracking-[0.06em]",
        strong ? "bg-brand-tint text-brand" : "bg-clay-tint text-clay"
      )}
      title="How closely this version matched the posting"
    >
      {clamped}% match
    </span>
  )
}

/**
 * Row actions, with delete confirmed inline.
 *
 * `window.confirm` used to guard this — a browser dialog that can't say what else is
 * about to disappear. Deleting a base résumé takes its tailored versions with it, and
 * that's worth saying out loud before it happens.
 */
function RowActions({
  compact = false,
  busy,
  confirming,
  onEdit,
  onPreview,
  onDownload,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
  deleteWarning,
}: {
  compact?: boolean
  busy: boolean
  confirming: boolean
  onEdit: () => void
  onPreview?: () => void
  onDownload: () => void
  onAskDelete: () => void
  onCancelDelete: () => void
  onConfirmDelete: () => void
  deleteWarning?: string
}) {
  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] text-ink-2">
          Delete this?
          {deleteWarning && (
            <span className="ml-1 font-semibold text-clay">{deleteWarning}</span>
          )}
        </span>
        <Button size="sm" variant="destructive" onClick={onConfirmDelete} disabled={busy}>
          {busy ? "Deleting…" : "Delete"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancelDelete} disabled={busy}>
          Keep
        </Button>
      </div>
    )
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <Button size="sm" variant={compact ? "ghost" : "outline"} onClick={onEdit}>
        Open
      </Button>
      {onPreview && (
        <Button size="sm" variant="ghost" onClick={onPreview}>
          Preview
        </Button>
      )}
      <Button size="sm" variant="ghost" onClick={onDownload} disabled={busy}>
        {busy ? "…" : "Download"}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onAskDelete}
        className="text-ink-faint hover:text-danger"
      >
        Delete
      </Button>
    </div>
  )
}
