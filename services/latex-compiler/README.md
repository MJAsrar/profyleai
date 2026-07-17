# LaTeX compile service (Tectonic on Cloud Run)

A tiny, stateless HTTP service that compiles a `.tex` document to a PDF with
[Tectonic](https://tectonic-typesetting.github.io/). The ProfyleAI résumé builder generates
LaTeX from the résumé JSON, POSTs it here, and shows/downloads the returned PDF.

Tectonic bundles a full TeX Live distribution, and the Docker build **bakes that bundle into
the image**, so runtime compiles need no network and cold starts are quick.

## Endpoints

- `POST /compile` — `Authorization: Bearer <COMPILE_SECRET>`. Body is either raw `text/x-tex`
  or JSON `{ "tex": "..." }`. Returns `application/pdf` on success, or `400 { error, log }`
  with the Tectonic log on a compile error.
- `GET /health` — `200 { ok: true }`. Used to warm the instance.

## Environment

- `COMPILE_SECRET` (required) — shared secret; must equal the app's `LATEX_COMPILER_SECRET`.
- `PORT` — defaults to `8080` (Cloud Run sets this).

## Deploy to Cloud Run

From this directory (`services/latex-compiler`), with `gcloud` authenticated and a project set:

```bash
# Pick a strong secret and reuse it as LATEX_COMPILER_SECRET in the app.
SECRET="$(openssl rand -hex 32)"

gcloud run deploy latex-compiler \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --min-instances 0 \
  --memory 1Gi \
  --cpu 1 \
  --timeout 30 \
  --set-env-vars "COMPILE_SECRET=$SECRET"
```

Notes:
- `--allow-unauthenticated` exposes the URL publicly, but `/compile` still requires the bearer
  secret, so only the app can compile. (If you prefer, drop this flag and put the service
  behind Cloud Run IAM + an ID token instead.)
- `--min-instances 0` keeps it free (scales to zero); cold starts take a few seconds. Set
  `--min-instances 1` later for always-warm at a small cost.
- The first build is slow (it downloads the Tectonic bundle). Subsequent builds are cached.

After deploy, `gcloud` prints a **Service URL**. Set these on the Vercel app (and local `.env`):

```
LATEX_COMPILER_URL=<the Cloud Run service URL>
LATEX_COMPILER_SECRET=<the same SECRET>
```

## Run locally

```bash
docker build -t latex-compiler .
docker run --rm -p 8080:8080 -e COMPILE_SECRET=dev-secret latex-compiler

# In another shell:
curl -sS -X POST http://localhost:8080/compile \
  -H "Authorization: Bearer dev-secret" \
  -H "Content-Type: application/json" \
  --data '{"tex":"\\documentclass{article}\\begin{document}Hello\\end{document}"}' \
  -o out.pdf && echo "wrote out.pdf"
```

## warmup.tex is generated — keep it that way

`warmup.tex` is real output from `resumeToLatex` (`lib/latex/resume-template.ts`), not a
hand-written sample. The build compiles it so every file the template needs (packages, fonts,
and the class's `size10.clo`) is cached into the image; runtime then uses `--only-cached` and
never touches the network.

**If you change the template's preamble** (documentclass, packages, font), regenerate
`warmup.tex` from the template's output and rebuild — otherwise the first real compile fails on
a file that was never cached (e.g. `LaTeX Error: File 'size10.clo' not found`).

Note on fonts: the template loads Latin Modern Sans **by filename** (`lmsans10-regular.otf`),
not by family name. Family-name lookup goes through system fontconfig, which knows nothing
about Tectonic's bundled fonts and fails in this image. Any font swap must use the filename
form and be present in the Tectonic bundle.
