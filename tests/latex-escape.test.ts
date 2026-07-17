import { describe, it, expect } from "vitest"
import { escapeLatex, escapeLatexParagraphs } from "@/lib/latex/escape"
import { resumeToLatex, DEFAULT_LATEX_STYLE } from "@/lib/latex/resume-template"
import type { ResumeData } from "@/lib/resume-store"

describe("escapeLatex", () => {
  it("escapes each LaTeX special character", () => {
    expect(escapeLatex("100% & $5 #1 a_b")).toBe("100\\% \\& \\$5 \\#1 a\\_b")
    expect(escapeLatex("{braces}")).toBe("\\{braces\\}")
    expect(escapeLatex("~^")).toBe("\\textasciitilde{}\\textasciicircum{}")
  })

  it("escapes a backslash without re-escaping the ones it introduces", () => {
    expect(escapeLatex("a\\b")).toBe("a\\textbackslash{}b")
    // A lone backslash must not corrupt following specials.
    expect(escapeLatex("\\&")).toBe("\\textbackslash{}\\&")
  })

  it("handles empty / nullish input", () => {
    expect(escapeLatex("")).toBe("")
    expect(escapeLatex(undefined)).toBe("")
    expect(escapeLatex(null)).toBe("")
  })
})

describe("escapeLatexParagraphs", () => {
  it("turns blank lines into paragraph breaks and single newlines into spaces", () => {
    expect(escapeLatexParagraphs("one\ntwo\n\nthree")).toBe("one two\n\nthree")
  })

  it("still escapes specials inside paragraphs", () => {
    expect(escapeLatexParagraphs("50% off")).toBe("50\\% off")
  })
})

function emptyResume(overrides: Partial<ResumeData> = {}): ResumeData {
  return {
    title: "My Resume",
    templateId: "",
    personalInfo: {
      fullName: "",
      professionalTitle: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    isPublic: false,
    ...overrides,
  }
}

describe("resumeToLatex", () => {
  it("produces a compilable document skeleton for an empty résumé", () => {
    const tex = resumeToLatex(emptyResume(), DEFAULT_LATEX_STYLE)
    expect(tex).toContain("\\documentclass{article}")
    expect(tex).toContain("\\begin{document}")
    expect(tex).toContain("\\end{document}")
    // Balanced braces is a cheap proxy for "won't blow up the compiler".
    const open = (tex.match(/(?<!\\)\{/g) || []).length
    const close = (tex.match(/(?<!\\)\}/g) || []).length
    expect(open).toBe(close)
  })

  it("omits sections that have no content", () => {
    const tex = resumeToLatex(emptyResume(), DEFAULT_LATEX_STYLE)
    expect(tex).not.toContain("Experience")
    expect(tex).not.toContain("Skills")
  })

  it("renders content and escapes user-supplied specials", () => {
    const tex = resumeToLatex(
      emptyResume({
        personalInfo: { ...emptyResume().personalInfo, fullName: "A & B", professionalTitle: "Dev" },
        summary: "Cut costs by 50%",
        skills: [{ category: "Langs", skills: [{ name: "C#" }, { name: "F#" }] }],
        experience: [
          {
            company: "Acme",
            position: "Engineer",
            location: "NYC",
            startDate: "2024-01",
            endDate: "",
            isCurrent: true,
            description: "",
            achievements: ["Shipped X_Y"],
            technologies: ["Node"],
          },
        ],
      }),
      DEFAULT_LATEX_STYLE
    )
    expect(tex).toContain("A \\& B")
    expect(tex).toContain("Cut costs by 50\\%")
    expect(tex).toContain("C\\#")
    expect(tex).toContain("Shipped X\\_Y")
    expect(tex).toContain("Present")
    expect(tex).toContain("Experience")
  })
})
