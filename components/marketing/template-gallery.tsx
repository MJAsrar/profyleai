"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { CardGridSkeleton, ErrorState } from "@/components/ui/states"
import { cn } from "@/lib/utils"

interface Template {
  id: string
  name: string
  category: "MODERN" | "CLASSIC" | "CREATIVE" | "ATS"
  previewUrl?: string | null
}

const FILTERS = [
  { value: "all", label: "All" },
  { value: "MODERN", label: "Modern" },
  { value: "ATS", label: "ATS" },
  { value: "CLASSIC", label: "Classic" },
  { value: "CREATIVE", label: "Creative" },
] as const

/**
 * Template preview — a striped placeholder slot, per the design's asset notes
 * (no production imagery yet). Renders the template's name so the card still says
 * something rather than showing a broken image.
 */
function PreviewSlot({ name }: { name: string }) {
  return (
    <div
      className="relative flex aspect-[3/4] items-end overflow-hidden rounded-[10px] border border-border"
      style={{
        background:
          "repeating-linear-gradient(135deg, #eef2ea 0 10px, #f6f3ec 10px 20px)",
      }}
    >
      <span className="m-3 rounded-full bg-[var(--card-plain)]/85 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
        {name}
      </span>
    </div>
  )
}

export function TemplateGallery() {
  const [templates, setTemplates] = useState<Template[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [filter, setFilter] = useState<string>("all")

  const load = async () => {
    try {
      setFailed(false)
      const res = await fetch("/api/templates")
      const body = await res.json()
      setTemplates(body.templates ?? body.data ?? [])
    } catch {
      setFailed(true)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const visible = useMemo(() => {
    if (!templates) return []
    return filter === "all" ? templates : templates.filter((t) => t.category === filter)
  }, [templates, filter])

  return (
    <section className="px-6 pb-20">
      <div className="mx-auto max-w-[1100px]">
        {/* Filter chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.value
            const count =
              f.value === "all"
                ? templates?.length ?? 0
                : templates?.filter((t) => t.category === f.value).length ?? 0

            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                aria-pressed={active}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-brand-tint text-brand"
                    : "border border-border text-ink-muted hover:border-brand hover:text-brand"
                )}
              >
                {f.label}
                {templates && (
                  <span className="ml-1.5 font-mono text-[10px] text-ink-faint-2">{count}</span>
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-10">
          {failed ? (
            <ErrorState
              title="Couldn't load templates"
              description="They're there — the request just didn't make it. Try again."
              onRetry={load}
            />
          ) : !templates ? (
            <CardGridSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((template) => (
                <Link key={template.id} href="/signup" className="rounded-card">
                  <Card interactive className="h-full p-4">
                    <PreviewSlot name={template.name} />

                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate font-sans text-[15px] font-bold text-ink">
                          {template.name}
                        </h2>
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                          {template.category}
                        </p>
                      </div>

                      {template.category === "ATS" && (
                        <span className="shrink-0 rounded-full bg-brand-tint px-2 py-0.5 font-mono text-[10px] tracking-[0.06em] text-brand">
                          ATS ✓
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-[13px] font-semibold text-brand">Use this →</p>
                  </Card>
                </Link>
              ))}

              {/* Start from blank */}
              <Link href="/signup" className="rounded-card">
                <Card className="flex h-full flex-col items-center justify-center border-dashed bg-transparent p-8 text-center shadow-none transition-colors hover:border-brand">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 items-center justify-center rounded-[11px] border border-dashed border-border text-ink-faint"
                  >
                    +
                  </span>
                  <h2 className="mt-3.5 font-sans text-[15px] font-bold text-ink">
                    Start from blank
                  </h2>
                  <p className="mt-1 text-[13px] text-ink-muted">
                    Bring your own structure.
                  </p>
                </Card>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
