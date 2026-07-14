"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CardGridSkeleton, ErrorState } from "@/components/ui/states"
import { cn } from "@/lib/utils"

interface Template {
  id: string
  name: string
  category: "MODERN" | "CLASSIC" | "CREATIVE" | "ATS"
  previewUrl?: string | null
}

/**
 * The template gallery, to the design.
 *
 * The templates and their categories come from /api/templates — the design's five named
 * layouts (Modern, ATS-optimised, Tech, Minimalist, Traditional) are illustrative, and
 * inventing filter chips for categories the database doesn't have would produce chips that
 * filter to nothing. The chips below are built from the categories that actually exist.
 */

const FILTERS = [
  { value: "all", label: "All" },
  { value: "MODERN", label: "Modern" },
  { value: "ATS", label: "ATS-optimised" },
  { value: "CLASSIC", label: "Classic" },
  { value: "CREATIVE", label: "Creative" },
] as const

const CATEGORY_NOTE: Record<Template["category"], string> = {
  MODERN: "CLEAN · TWO-COLUMN",
  ATS: "PARSER-SAFE · SINGLE COLUMN",
  CLASSIC: "CLASSIC · SERIF HEADINGS",
  CREATIVE: "EXPRESSIVE · TYPE-LED",
}

/** The design's striped preview slot — there is no production imagery to show yet. */
function PreviewSlot({ isAts }: { isAts: boolean }) {
  return (
    <div
      className="relative flex aspect-[3/4] items-end p-[14px]"
      style={{
        background:
          "repeating-linear-gradient(135deg,#e7e1d5 0 11px,#efe9dd 11px 22px)",
      }}
    >
      {isAts && (
        <span className="absolute left-[14px] top-[14px] rounded-[6px] bg-[#2e6a4a] px-2 py-1 font-mono text-[10px] tracking-[0.06em] text-[#eaf3ec]">
          ATS ✓
        </span>
      )}

      <span className="rounded-[6px] bg-[rgba(255,253,248,.8)] px-2 py-1 font-mono text-[11px] text-[#8a7f70]">
        template preview
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

  // Only offer a filter that has something behind it.
  const chips = FILTERS.filter(
    (f) =>
      f.value === "all" ||
      !templates ||
      templates.some((t) => t.category === f.value)
  )

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2.5 px-6 pb-10 pt-2 sm:px-14">
        {chips.map((f) => {
          const active = filter === f.value

          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={active}
              className={cn(
                "rounded-full px-4 py-[9px] text-[14px] transition-colors",
                active
                  ? "bg-[#2e6a4a] font-semibold text-[#f4efe6]"
                  : "border border-[rgba(33,31,28,.12)] bg-[#fffdf8] text-[#4b463f] hover:border-[#2e6a4a] hover:text-[#2e6a4a]"
              )}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      <div className="px-6 pb-[76px] sm:px-14">
        {failed ? (
          <ErrorState
            title="Couldn't load templates"
            description="They're there — the request just didn't make it. Try again."
            onRetry={load}
          />
        ) : !templates ? (
          <CardGridSkeleton count={6} />
        ) : (
          <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((template) => (
              <div
                key={template.id}
                className="overflow-hidden rounded-[16px] border border-[rgba(33,31,28,.09)] bg-[#fffdf8] shadow-[0_20px_46px_-34px_rgba(30,25,20,.3)]"
              >
                <PreviewSlot isAts={template.category === "ATS"} />

                <div className="flex items-center justify-between gap-3 px-5 py-[18px]">
                  <div className="min-w-0">
                    <p className="truncate text-[16px] font-bold text-[#211f1c]">
                      {template.name}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-[#8a837a]">
                      {CATEGORY_NOTE[template.category] ?? template.category}
                    </p>
                  </div>

                  <Link
                    href="/dashboard/resume-builder"
                    className="shrink-0 text-[13px] font-semibold text-[#2e6a4a] hover:text-[#26583d]"
                  >
                    Use →
                  </Link>
                </div>
              </div>
            ))}

            {/* Start from blank */}
            <Link
              href="/dashboard/resume-builder"
              className="flex min-h-[240px] flex-col items-center justify-center gap-2.5 rounded-[16px] border-[1.5px] border-dashed border-[rgba(33,31,28,.2)] bg-transparent text-[#6f685f] transition-colors hover:border-[#2e6a4a] hover:text-[#2e6a4a]"
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#e7efe8] text-[24px] font-light text-[#2e6a4a]"
              >
                +
              </span>
              <span className="text-[15px] font-semibold">Start from blank</span>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
