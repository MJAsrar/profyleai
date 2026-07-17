/**
 * Server-side client for the Tectonic compile service (Cloud Run).
 *
 * The one place that knows how to turn a `.tex` string into PDF bytes: it holds the service URL
 * and shared secret and normalises every failure mode into a small result type. Every route that
 * produces a PDF — résumé download, tailored-résumé download, cover letter, and the builder's
 * live preview — goes through here, so there's a single seam to the compiler.
 */

const COMPILE_URL = process.env.LATEX_COMPILER_URL
const COMPILE_SECRET = process.env.LATEX_COMPILER_SECRET

export type CompileStatus = "ok" | "not_configured" | "unreachable" | "compile_failed" | "error"

export interface CompileResult {
  ok: boolean
  status: CompileStatus
  /** ArrayBuffer-backed so it's a valid NextResponse BodyInit without casting. */
  pdf?: Uint8Array<ArrayBuffer>
  /** Tectonic log, present when status === "compile_failed". */
  log?: string
  /** Upstream HTTP status, for non-compile errors. */
  httpStatus?: number
}

export function isCompilerConfigured(): boolean {
  return !!(COMPILE_URL && COMPILE_SECRET)
}

function base(): string {
  return (COMPILE_URL || "").replace(/\/$/, "")
}

/** Compile a full `.tex` document to PDF bytes. Never throws — inspect `status`. */
export async function compileLatexToPdf(tex: string, timeoutMs = 30_000): Promise<CompileResult> {
  if (!COMPILE_URL || !COMPILE_SECRET) return { ok: false, status: "not_configured" }

  let res: Response
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    res = await fetch(`${base()}/compile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COMPILE_SECRET}`,
      },
      body: JSON.stringify({ tex }),
      signal: controller.signal,
    })
    clearTimeout(timer)
  } catch (error) {
    console.error("❌ latex compile: service unreachable:", error)
    return { ok: false, status: "unreachable" }
  }

  if (res.ok) {
    const buf = await res.arrayBuffer()
    return { ok: true, status: "ok", pdf: new Uint8Array(buf) }
  }

  if (res.status === 400) {
    let log = ""
    try {
      const payload = await res.json()
      log = payload?.log || payload?.error || ""
    } catch {
      /* non-JSON error body */
    }
    return { ok: false, status: "compile_failed", log, httpStatus: 400 }
  }

  console.error(`❌ latex compile: service returned ${res.status}`)
  return { ok: false, status: "error", httpStatus: res.status }
}

/** Ping the compiler's health endpoint to spin up a cold instance. Best-effort. */
export async function warmCompiler(timeoutMs = 10_000): Promise<boolean> {
  if (!COMPILE_URL) return false
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(`${base()}/health`, { signal: controller.signal })
    clearTimeout(timer)
    return res.ok
  } catch {
    return false
  }
}
