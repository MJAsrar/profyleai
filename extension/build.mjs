// Build the extension with esbuild. No framework magic: three bundled entry points
// (service worker as ESM, content script + popup as IIFE classic scripts), plus a
// deterministic copy of the static assets. Run `node build.mjs` or `--watch`.

import * as esbuild from "esbuild"
import { cp, mkdir, rm } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = dirname(fileURLToPath(import.meta.url))
const outdir = join(root, "dist")
const watch = process.argv.includes("--watch")

const shared = {
  bundle: true,
  target: "chrome110",
  logLevel: "info",
  sourcemap: watch ? "inline" : false,
  minify: !watch,
  define: { __DEV__: JSON.stringify(watch) },
}

/** The service worker runs as an ES module (manifest background.type = "module"). */
const workerConfig = {
  ...shared,
  entryPoints: { "service-worker": join(root, "src/background/service-worker.ts") },
  outdir,
  format: "esm",
}

/** The popup runs as a classic script — bundle to a self-contained IIFE. */
const classicConfig = {
  ...shared,
  entryPoints: { popup: join(root, "src/popup/popup.ts") },
  outdir,
  format: "iife",
}

async function copyStatic() {
  await cp(join(root, "manifest.json"), join(outdir, "manifest.json"))
  await cp(join(root, "src/popup/popup.html"), join(outdir, "popup.html"))
  await cp(join(root, "src/popup/popup.css"), join(outdir, "popup.css"))
  await cp(join(root, "public/icons"), join(outdir, "icons"), { recursive: true })
  await cp(join(root, "public/fonts"), join(outdir, "fonts"), { recursive: true })
}

await rm(outdir, { recursive: true, force: true })
await mkdir(outdir, { recursive: true })

if (watch) {
  const [wc, cc] = await Promise.all([
    esbuild.context(workerConfig),
    esbuild.context(classicConfig),
  ])
  await Promise.all([wc.watch(), cc.watch()])
  await copyStatic()
  // Re-copy static assets whenever they might change; esbuild watches only TS.
  console.log("watching… (restart to pick up manifest/html/css/asset changes)")
} else {
  await Promise.all([esbuild.build(workerConfig), esbuild.build(classicConfig)])
  await copyStatic()
  console.log("built → dist/")
}
