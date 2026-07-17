import { describe, it, expect } from "vitest"
import {
  LATEX_TEMPLATES,
  DEFAULT_LATEX_STYLE,
  resolveTemplate,
  resumeToLatex,
} from "@/lib/latex/resume-template"
import type { ResumeData } from "@/lib/resume-store"

/** The template names seeded in prisma/seed.ts. Each must map to its own design — otherwise the
 *  builder's template picker changes nothing, which is the bug this registry exists to prevent. */
const SEEDED_NAMES = [
  "Modern Professional",
  "Tech Stack",
  "Clean Minimalist",
  "Traditional Professional",
  "ATS Friendly",
] as const

function sampleResume(overrides: Partial<ResumeData> = {}): ResumeData {
  return {
    title: "Sample",
    templateId: "",
    personalInfo: {
      fullName: "Alex Rivera",
      professionalTitle: "Analyst & Lead",
      email: "alex@example.com",
      phone: "(555) 018-2245",
      location: "Boston, MA",
      website: "",
      linkedin: "https://linkedin.com/in/alexrivera",
      github: "",
      portfolio: "",
    },
    summary: "Cut costs by 50%.",
    experience: [
      {
        company: "Brightline & Co.",
        position: "Senior Analyst",
        location: "Boston, MA",
        startDate: "2023-06",
        endDate: "",
        isCurrent: true,
        description: "Owned the stack.",
        achievements: ["Cut reporting time by ~50% via SQL_dashboards"],
        technologies: ["SQL", "C#"],
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
        relevantCourses: ["Econometrics"],
      },
    ],
    skills: [{ category: "Languages", skills: [{ name: "SQL" }, { name: "C#" }] }],
    projects: [
      {
        name: "Churn Model",
        description: "Predicts churn.",
        technologies: ["Python"],
        startDate: "2024-01",
        endDate: "2024-06",
        liveUrl: "https://demo.example.com",
        githubUrl: "",
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
    ...overrides,
  }
}

function emptyResume(): ResumeData {
  return {
    title: "Untitled",
    templateId: "",
    personalInfo: { fullName: "", professionalTitle: "", email: "", phone: "", location: "" },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    isPublic: false,
  }
}

describe("resolveTemplate", () => {
  it("maps every seeded template name to a distinct design", () => {
    const keys = SEEDED_NAMES.map((name) => resolveTemplate(name).key)
    expect(new Set(keys).size).toBe(SEEDED_NAMES.length)
  })

  it("matches seeded names case-insensitively", () => {
    expect(resolveTemplate("tech stack").key).toBe("tech")
    expect(resolveTemplate("  ATS FRIENDLY  ").key).toBe("ats")
  })

  it("falls back to Modern for missing or unknown names", () => {
    expect(resolveTemplate(undefined).key).toBe("modern")
    expect(resolveTemplate(null).key).toBe("modern")
    expect(resolveTemplate("").key).toBe("modern")
    expect(resolveTemplate("Something Nobody Seeded").key).toBe("modern")
  })

  it("tolerates a renamed seed row", () => {
    expect(resolveTemplate("Tech Stack v2").key).toBe("tech")
  })
})

describe.each(LATEX_TEMPLATES.map((t) => [t.key, t] as const))("template: %s", (key, template) => {
  const tex = template.render(sampleResume(), DEFAULT_LATEX_STYLE)

  it("emits a complete document", () => {
    expect(tex).toContain("\\documentclass")
    expect(tex).toContain("\\begin{document}")
    expect(tex).toContain("\\end{document}")
  })

  it("balances its braces", () => {
    const open = (tex.match(/(?<!\\)\{/g) || []).length
    const close = (tex.match(/(?<!\\)\}/g) || []).length
    expect(open).toBe(close)
  })

  it("escapes user-supplied specials", () => {
    expect(tex).toContain("Brightline \\& Co.")
    expect(tex).toContain("50\\%")
    expect(tex).toContain("C\\#")
    expect(tex).toContain("SQL\\_dashboards")
    // NB: no blanket "no bare &" scan here — `tech` uses & as a tabular* column separator, so a
    // document-wide check can't tell template syntax from an unescaped user special. The
    // assertions above cover the thing that actually matters: user content is escaped.
  })

  it("renders an empty résumé without emitting empty sections", () => {
    const bare = template.render(emptyResume(), DEFAULT_LATEX_STYLE)
    expect(bare).toContain("\\begin{document}")
    expect(bare).not.toMatch(/EXPERIENCE|Experience/)
    expect(bare).not.toMatch(/Certifications|CERTIFICATIONS/)
  })

  it("honours all three style knobs", () => {
    const a = template.render(sampleResume(), { fontSize: 9.5, density: "compact", accent: "1D4ED8" })
    const b = template.render(sampleResume(), { fontSize: 11.5, density: "relaxed", accent: "BE123C" })
    expect(a).toContain("1D4ED8")
    expect(b).toContain("BE123C")
    expect(a).toContain("9.5pt")
    expect(b).toContain("11.5pt")
    expect(a).not.toBe(b)
  })

  it("marks the current role as Present", () => {
    expect(tex).toContain("Present")
  })

  void key
})

describe("resumeToLatex", () => {
  it("routes to the design named by templateName", () => {
    const tech = resumeToLatex(sampleResume(), DEFAULT_LATEX_STYLE, "Tech Stack")
    const classic = resumeToLatex(sampleResume(), DEFAULT_LATEX_STYLE, "Traditional Professional")
    expect(tech).not.toBe(classic)
    // Each design pins its own face.
    expect(tech).toContain("texgyreheros")
    expect(classic).toContain("texgyretermes")
  })
})
