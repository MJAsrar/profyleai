import { z } from "zod"

// Template CSS data validation schema
export const templateCssSchema = z.object({
  layout: z.object({
    pageSize: z.enum(["letter", "a4", "legal"]).optional(),
    margins: z.string().optional(),
    columns: z.enum(["single", "two-column", "asymmetric", "split", "magazine"]).optional(),
    spacing: z.string().optional(),
    columnGap: z.string().optional()
  }).optional(),
  
  typography: z.object({
    primaryFont: z.string().optional(),
    secondaryFont: z.string().optional(),
    baseFontSize: z.string().optional(),
    lineHeight: z.string().optional()
  }).optional(),
  
  colors: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
    text: z.string().optional(),
    muted: z.string().optional(),
    background: z.string().optional(),
    highlight: z.string().optional(),
    gradientStart: z.string().optional(),
    gradientEnd: z.string().optional(),
    codeBackground: z.string().optional()
  }).optional(),
  
  sections: z.record(z.any()).optional(),
  elements: z.record(z.any()).optional()
})

/**
 * Validate template CSS data structure
 */
export function validateTemplateCss(cssData: any): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    templateCssSchema.parse(cssData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => `CSS validation error: ${e.message} at ${e.path.join('.')}`))
    }
  }

  // Additional validation checks
  if (cssData) {
    // Check color format
    if (cssData.colors) {
      Object.entries(cssData.colors).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
          if (!isValidColor(value as string)) {
            warnings.push(`Color "${key}" may have invalid format: ${value}`)
          }
        }
      })
    }

    // Check font declarations
    if (cssData.typography) {
      if (cssData.typography.primaryFont && !isValidFontDeclaration(cssData.typography.primaryFont)) {
        warnings.push(`Primary font declaration may be invalid: ${cssData.typography.primaryFont}`)
      }
      if (cssData.typography.secondaryFont && !isValidFontDeclaration(cssData.typography.secondaryFont)) {
        warnings.push(`Secondary font declaration may be invalid: ${cssData.typography.secondaryFont}`)
      }
    }

    // Check required sections for template functionality
    const requiredSections = ['header', 'section', 'sectionTitle']
    const availableSections = cssData.sections ? Object.keys(cssData.sections) : []
    
    requiredSections.forEach(section => {
      if (!availableSections.includes(section)) {
        warnings.push(`Missing recommended section styling: ${section}`)
      }
    })

    // Check essential elements
    const requiredElements = ['name', 'contact']
    const availableElements = cssData.elements ? Object.keys(cssData.elements) : []
    
    requiredElements.forEach(element => {
      if (!availableElements.includes(element)) {
        warnings.push(`Missing recommended element styling: ${element}`)
      }
    })
  } else {
    errors.push("No CSS data provided")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Check if template is compatible with resume data
 */
export function checkTemplateCompatibility(templateCssData: any, resumeData: any): {
  compatible: boolean
  issues: string[]
  recommendations: string[]
} {
  const issues: string[] = []
  const recommendations: string[] = []

  if (!templateCssData) {
    issues.push("Template has no CSS data")
    return { compatible: false, issues, recommendations }
  }

  // Check if template supports multi-column layout for extensive content
  const hasExtensiveContent = (
    (resumeData.experience?.length || 0) > 3 ||
    (resumeData.projects?.length || 0) > 2 ||
    (resumeData.skills?.length || 0) > 4
  )

  if (hasExtensiveContent && templateCssData.layout?.columns === "single") {
    recommendations.push("Consider a multi-column template for extensive content")
  }

  // Check if creative template is appropriate for content
  const isCreativeTemplate = templateCssData.colors?.gradientStart || 
                           templateCssData.sections?.header?.background?.includes("gradient")

  const isConservativeRole = resumeData.experience?.some((exp: any) => 
    exp.company?.toLowerCase().includes("bank") ||
    exp.company?.toLowerCase().includes("government") ||
    exp.company?.toLowerCase().includes("law") ||
    exp.position?.toLowerCase().includes("attorney") ||
    exp.position?.toLowerCase().includes("accountant")
  )

  if (isCreativeTemplate && isConservativeRole) {
    recommendations.push("Consider a more conservative template for traditional industries")
  }

  // Check if technical template is appropriate
  const isTechnicalTemplate = templateCssData.typography?.primaryFont?.includes("mono")
  const isTechnicalRole = resumeData.skills?.some((skillGroup: any) =>
    skillGroup.skills?.some((skill: any) => 
      ["JavaScript", "Python", "Java", "React", "Node.js"].includes(skill.name)
    )
  )

  if (isTechnicalTemplate && !isTechnicalRole) {
    recommendations.push("Technical template works best for software development roles")
  } else if (!isTechnicalTemplate && isTechnicalRole) {
    recommendations.push("Consider a technical template for software development experience")
  }

  // Check ATS compatibility
  const hasComplexLayout = templateCssData.layout?.columns !== "single"
  if (hasComplexLayout) {
    recommendations.push("Single-column templates are more ATS-friendly")
  }

  return {
    compatible: issues.length === 0,
    issues,
    recommendations
  }
}

/**
 * Get template performance score
 */
export function getTemplatePerformanceScore(templateCssData: any): {
  score: number
  breakdown: {
    cssComplexity: number
    atsCompatibility: number
    printOptimization: number
    visualAppeal: number
  }
  feedback: string[]
} {
  const feedback: string[] = []
  let cssComplexity = 5
  let atsCompatibility = 5
  let printOptimization = 5
  let visualAppeal = 5

  if (!templateCssData) {
    return {
      score: 0,
      breakdown: { cssComplexity: 0, atsCompatibility: 0, printOptimization: 0, visualAppeal: 0 },
      feedback: ["No CSS data available"]
    }
  }

  // CSS Complexity (lower complexity = higher score)
  const complexFeatures = [
    templateCssData.sections?.sidebar,
    templateCssData.colors?.gradientStart,
    templateCssData.layout?.columns !== "single",
    templateCssData.elements?.progressBar
  ].filter(Boolean).length

  cssComplexity = Math.max(1, 5 - complexFeatures)
  if (complexFeatures > 2) {
    feedback.push("Template has complex features that may affect rendering performance")
  }

  // ATS Compatibility
  if (templateCssData.layout?.columns === "single") {
    atsCompatibility = 10
    feedback.push("Single-column layout is ATS-friendly")
  } else if (templateCssData.layout?.columns === "two-column") {
    atsCompatibility = 7
    feedback.push("Two-column layout has moderate ATS compatibility")
  } else {
    atsCompatibility = 4
    feedback.push("Complex layout may have poor ATS compatibility")
  }

  // Print Optimization
  if (templateCssData.layout?.pageSize === "letter" || templateCssData.layout?.pageSize === "a4") {
    printOptimization = 10
  } else {
    printOptimization = 6
    feedback.push("Consider using standard page sizes for better print compatibility")
  }

  if (templateCssData.colors?.background === "#ffffff") {
    printOptimization = Math.min(10, printOptimization + 2)
  } else {
    printOptimization = Math.max(1, printOptimization - 2)
    feedback.push("White background is recommended for print optimization")
  }

  // Visual Appeal
  const hasColors = templateCssData.colors && Object.keys(templateCssData.colors).length > 3
  const hasTypography = templateCssData.typography?.primaryFont
  const hasStyling = templateCssData.sections && Object.keys(templateCssData.sections).length > 2

  if (hasColors) visualAppeal += 2
  if (hasTypography) visualAppeal += 2
  if (hasStyling) visualAppeal += 1

  visualAppeal = Math.min(10, visualAppeal)

  const breakdown = { cssComplexity, atsCompatibility, printOptimization, visualAppeal }
  const score = Math.round((cssComplexity + atsCompatibility + printOptimization + visualAppeal) / 4)

  return { score, breakdown, feedback }
}

/**
 * Helper functions
 */
function isValidColor(color: string): boolean {
  // Basic color validation (hex, rgb, rgba, named colors, gradients)
  const colorPatterns = [
    /^#[0-9A-Fa-f]{3,8}$/, // hex
    /^rgb\(/,              // rgb
    /^rgba\(/,             // rgba
    /^hsl\(/,              // hsl
    /^hsla\(/,             // hsla
    /^linear-gradient\(/,  // linear gradient
    /^radial-gradient\(/,  // radial gradient
    /^(transparent|inherit|initial|unset)$/i // keywords
  ]
  
  return colorPatterns.some(pattern => pattern.test(color.trim()))
}

function isValidFontDeclaration(font: string): boolean {
  // Basic font declaration validation
  return font.includes(',') || font.includes('"') || font.includes("'") || 
         ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy'].some(generic => font.includes(generic))
}

/**
 * Template feature detection
 */
export function detectTemplateFeatures(templateCssData: any): {
  hasGradients: boolean
  hasCustomFonts: boolean
  isMultiColumn: boolean
  hasAdvancedLayout: boolean
  isMinimalist: boolean
  isTechnical: boolean
  isCreative: boolean
} {
  if (!templateCssData) {
    return {
      hasGradients: false,
      hasCustomFonts: false,
      isMultiColumn: false,
      hasAdvancedLayout: false,
      isMinimalist: false,
      isTechnical: false,
      isCreative: false
    }
  }

  return {
    hasGradients: !!(templateCssData.colors?.gradientStart || 
                    JSON.stringify(templateCssData).includes('gradient')),
    hasCustomFonts: !!(templateCssData.typography?.primaryFont?.includes('"') ||
                      templateCssData.typography?.primaryFont?.includes("'")),
    isMultiColumn: templateCssData.layout?.columns !== "single",
    hasAdvancedLayout: !!(templateCssData.sections?.sidebar || 
                         templateCssData.sections?.leftColumn ||
                         templateCssData.layout?.columns === "asymmetric"),
    isMinimalist: !templateCssData.colors?.gradientStart && 
                  !templateCssData.sections?.sidebar &&
                  Object.keys(templateCssData.colors || {}).length <= 4,
    isTechnical: !!(templateCssData.typography?.primaryFont?.includes('mono') ||
                   templateCssData.colors?.codeBackground),
    isCreative: !!(templateCssData.colors?.gradientStart ||
                  templateCssData.sections?.header?.clipPath ||
                  Object.keys(templateCssData.colors || {}).length > 6)
  }
}