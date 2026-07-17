// Tectonic LaTeX compile service.
//
// A tiny dependency-free HTTP server that turns a .tex document into a PDF by shelling out to
// Tectonic. Stateless: one temp dir per request, cleaned up after. Meant to sit behind the
// ProfyleAI Next.js app (which holds the shared secret) on Cloud Run.

import { createServer } from "node:http"
import { execFile } from "node:child_process"
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

const PORT = Number(process.env.PORT) || 8080
const SECRET = process.env.COMPILE_SECRET || ""
const COMPILE_TIMEOUT_MS = 15_000
const MAX_TEX_BYTES = 512 * 1024 // a résumé .tex is a few KB; this is a generous ceiling.

if (!SECRET) {
  console.warn("[latex-compiler] COMPILE_SECRET is not set — refusing all compile requests.")
}

/** Read a request body with a hard size cap. */
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on("data", (c) => {
      size += c.length
      if (size > limit) {
        reject(new Error("payload too large"))
        req.destroy()
        return
      }
      chunks.push(c)
    })
    req.on("end", () => resolve(Buffer.concat(chunks)))
    req.on("error", reject)
  })
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers)
  res.end(body)
}

function sendJson(res, status, obj) {
  send(res, status, JSON.stringify(obj), { "Content-Type": "application/json" })
}

/** Compile `tex` to a PDF buffer. Resolves { ok, pdf } or { ok:false, log }. */
async function compile(tex) {
  const dir = await mkdtemp(join(tmpdir(), "latex-"))
  const texPath = join(dir, "main.tex")
  const pdfPath = join(dir, "main.pdf")
  try {
    await writeFile(texPath, tex, "utf8")

    const log = await new Promise((resolve) => {
      // --only-cached: never touch the network at runtime (bundle is baked into the image).
      // Shell-escape stays disabled (Tectonic's default) — no \write18.
      execFile(
        "tectonic",
        ["--outdir", dir, "--only-cached", "--chatter", "minimal", texPath],
        { timeout: COMPILE_TIMEOUT_MS, maxBuffer: 8 * 1024 * 1024 },
        (err, _stdout, stderr) => {
          if (err) resolve({ failed: true, text: (stderr || "") + "\n" + (err.message || "") })
          else resolve({ failed: false, text: stderr || "" })
        }
      )
    })

    if (log.failed) return { ok: false, log: log.text.slice(-8000) }

    const pdf = await readFile(pdfPath)
    return { ok: true, pdf }
  } catch (err) {
    return { ok: false, log: String(err?.message || err) }
  } finally {
    rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url?.startsWith("/health")) {
      return sendJson(res, 200, { ok: true })
    }

    if (req.method === "POST" && req.url?.startsWith("/compile")) {
      if (!SECRET) return sendJson(res, 503, { error: "compiler not configured" })

      const auth = req.headers["authorization"] || ""
      if (auth !== `Bearer ${SECRET}`) {
        return sendJson(res, 401, { error: "unauthorized" })
      }

      let raw
      try {
        raw = await readBody(req, MAX_TEX_BYTES)
      } catch {
        return sendJson(res, 413, { error: "payload too large" })
      }

      // Accept either a raw .tex body or JSON { tex }.
      const contentType = String(req.headers["content-type"] || "")
      let tex
      if (contentType.includes("application/json")) {
        try {
          tex = JSON.parse(raw.toString("utf8")).tex
        } catch {
          return sendJson(res, 400, { error: "invalid JSON body" })
        }
      } else {
        tex = raw.toString("utf8")
      }

      if (typeof tex !== "string" || tex.trim() === "") {
        return sendJson(res, 400, { error: "missing tex" })
      }

      const result = await compile(tex)
      if (result.ok) {
        return send(res, 200, result.pdf, {
          "Content-Type": "application/pdf",
          "Content-Length": result.pdf.length,
        })
      }
      return sendJson(res, 400, { error: "compile failed", log: result.log })
    }

    return sendJson(res, 404, { error: "not found" })
  } catch (err) {
    console.error("[latex-compiler] unhandled error:", err)
    return sendJson(res, 500, { error: "internal error" })
  }
})

server.listen(PORT, () => {
  console.log(`[latex-compiler] listening on :${PORT}`)
})
