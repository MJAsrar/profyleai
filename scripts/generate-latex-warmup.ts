import { mkdirSync, readdirSync, rmSync, writeFileSync } from "fs"
import path from "path"

import { LATEX_TEMPLATES, DEFAULT_LATEX_STYLE } from "../lib/latex/resume-template"
import type { ResumeData } from "../lib/resume-store"

/**
 * Regenerates `services/latex-compiler/warmup/*.tex` — one document per LaTeX template.
 *
 * Why this exists: the compile service runs Tectonic with `--only-cached`, so it never touches
 * the network at runtime. Everything a template needs (packages, fonts, the class's size*.clo)
 * must therefore be pulled into the image's Tectonic cache at BUILD time, which the Docker
 * build does by compiling these files.
 *
 * Generating them from the registry means they cannot drift from the templates. A hand-written
 * warmup already bit us once: it used `\documentclass[11pt]` while the template emitted
 * `\documentclass`, so `size10.clo` was never cached and the first real compile failed.
 *
 * Run after ANY template preamble change, then rebuild + redeploy the service:
 *   npm run latex:warmup
 */

const OUT_DIR = path.join(process.cwd(), "services", "latex-compiler", "warmup")

/** Deliberately exercises every section and every awkward character we escape. */
const SAMPLE: ResumeData = {
  title: "Warmup Resume",
  templateId: "",
  personalInfo: {
    fullName: "Alex Rivera",
    professionalTitle: "Product Analyst & Data Lead",
    email: "alex@example.com",
    phone: "(555) 018-2245",
    location: "Boston, MA",
    website: "https://alexrivera.dev",
    linkedin: "https://linkedin.com/in/alexrivera",
    github: "https://github.com/arivera",
    portfolio: "https://portfolio.example.com",
  },
  summary:
    "Analyst who turns messy data into decisions.\n\nCut reporting time by 50% & shipped A/B tests worth $2M.",
  experience: [
    {
      company: "Brightline & Co.",
      position: "Senior Analyst",
      location: "Boston, MA",
      startDate: "2023-06",
      endDate: "",
      isCurrent: true,
      description: "Owned the growth analytics stack (100% coverage).",
      achievements: ["Cut weekly reporting time by ~50% using SQL_dashboards", "Ran A/B tests; shipped winners"],
      technologies: ["SQL", "Python", "dbt"],
    },
    {
      company: "Acme",
      position: "Analyst",
      location: "NYC",
      startDate: "2021-01",
      endDate: "2023-05",
      isCurrent: false,
      description: "",
      achievements: ["Built C# tooling"],
      technologies: [],
    },
  ],
  education: [
    {
      institution: "Boston University",
      degree: "B.S.",
      field: "Statistics",
      location: "Boston, MA",
      startDate: "2017-09",
      endDate: "2021-05",
      gpa: "3.8",
      honors: ["Cum Laude"],
      relevantCourses: ["Econometrics", "Machine Learning"],
    },
  ],
  skills: [
    { category: "Languages", skills: [{ name: "SQL" }, { name: "Python" }, { name: "C#" }] },
    { category: "Tools", skills: [{ name: "Tableau" }, { name: "dbt" }] },
  ],
  projects: [
    {
      name: "Churn Model 2.0",
      description: "Predicts churn ~2 weeks out.",
      technologies: ["Python", "scikit-learn"],
      startDate: "2024-01",
      endDate: "2024-06",
      liveUrl: "https://demo.example.com",
      githubUrl: "https://github.com/arivera/churn",
      imageUrl: "",
      highlights: ["Lifted retention 12%"],
    },
  ],
  certifications: [
    {
      name: "AWS Solutions Architect",
      issuedBy: "Amazon",
      issueDate: "2023-04",
      expiryDate: "",
      isLifetime: false,
      credentialId: "ABC_123",
      verificationUrl: "",
      description: "",
    },
  ],
  isPublic: false,
}

const BANNER = [
  "% GENERATED FILE - DO NOT EDIT BY HAND.",
  "% Produced by scripts/generate-latex-warmup.ts from lib/latex/templates.",
  "% Rebuild + redeploy the compile service after regenerating (npm run latex:warmup).",
  "",
].join("\n")

mkdirSync(OUT_DIR, { recursive: true })

// Drop stale files so a removed template doesn't linger and get compiled forever.
for (const existing of readdirSync(OUT_DIR).filter((f) => f.endsWith(".tex"))) {
  rmSync(path.join(OUT_DIR, existing))
}

for (const template of LATEX_TEMPLATES) {
  const tex = BANNER + template.render(SAMPLE, DEFAULT_LATEX_STYLE)
  const file = path.join(OUT_DIR, `${template.key}.tex`)
  writeFileSync(file, tex, "utf8")
  console.log(`wrote warmup/${template.key}.tex  (${template.label})`)
}

console.log(`\n${LATEX_TEMPLATES.length} warmup document(s) generated.`)
