/**
 * Spacing Configuration System
 * Provides granular control over spacing and gaps in resumes
 * Similar to font-config.ts but for spacing/margins
 */

export interface SpacingConfig {
  // Header spacing (in points for PDF, converted to rem for web)
  nameToTitle: number        // Gap between name and professional title (0-5pt)
  titleToContact: number     // Gap between title and contact info (0-8pt)
  headerToContent: number    // Gap between header and first section (4-20pt)
  
  // Section spacing
  sectionGaps: number        // Gap between major sections (8-30pt)
  sectionTitleGaps: number   // Gap between section title and content (2-12pt)
  
  // Content spacing
  itemSpacing: number        // Gap between items (job entries, education) (2-12pt)
  bulletSpacing: number      // Gap between bullet points (1-6pt)
  lineHeight: number         // Line height multiplier (1.0-1.8)
}

// Default spacing configuration - balanced for most resumes
export const DEFAULT_SPACING: SpacingConfig = {
  nameToTitle: 0,          // No gap (as per recent fix)
  titleToContact: 2,       // Minimal gap
  headerToContent: 8,      // Small gap after header
  sectionGaps: 12,         // Standard section spacing
  sectionTitleGaps: 4,     // Small gap after section titles
  itemSpacing: 6,          // Moderate item spacing
  bulletSpacing: 2,        // Minimal bullet spacing
  lineHeight: 1.3          // Standard line height
}

// Spacing ranges for sliders
export const SPACING_RANGES = {
  nameToTitle: { min: 0, max: 5, step: 1 },
  titleToContact: { min: 0, max: 8, step: 1 },
  headerToContent: { min: 4, max: 20, step: 2 },
  sectionGaps: { min: 8, max: 30, step: 2 },
  sectionTitleGaps: { min: 2, max: 12, step: 1 },
  itemSpacing: { min: 2, max: 12, step: 1 },
  bulletSpacing: { min: 1, max: 6, step: 0.5 },
  lineHeight: { min: 1.0, max: 1.8, step: 0.1 }
}

// Spacing presets for different resume styles
export const SPACING_PRESETS = {
  'ultra-compact': {
    nameToTitle: 0,
    titleToContact: 0,
    headerToContent: 4,
    sectionGaps: 8,
    sectionTitleGaps: 2,
    itemSpacing: 2,
    bulletSpacing: 1,
    lineHeight: 1.0
  },
  'compact': {
    nameToTitle: 0,
    titleToContact: 1,
    headerToContent: 6,
    sectionGaps: 10,
    sectionTitleGaps: 3,
    itemSpacing: 4,
    bulletSpacing: 1.5,
    lineHeight: 1.2
  },
  'normal': DEFAULT_SPACING,
  'spacious': {
    nameToTitle: 2,
    titleToContact: 4,
    headerToContent: 12,
    sectionGaps: 18,
    sectionTitleGaps: 6,
    itemSpacing: 8,
    bulletSpacing: 3,
    lineHeight: 1.5
  },
  'ultra-spacious': {
    nameToTitle: 3,
    titleToContact: 6,
    headerToContent: 16,
    sectionGaps: 24,
    sectionTitleGaps: 8,
    itemSpacing: 10,
    bulletSpacing: 4,
    lineHeight: 1.6
  }
} as const

export type SpacingPresetName = keyof typeof SPACING_PRESETS

// Create a spacing config with validation
export function createSpacingConfig(config: Partial<SpacingConfig>): SpacingConfig {
  return {
    nameToTitle: validateSpacing(config.nameToTitle ?? DEFAULT_SPACING.nameToTitle, 'nameToTitle'),
    titleToContact: validateSpacing(config.titleToContact ?? DEFAULT_SPACING.titleToContact, 'titleToContact'),
    headerToContent: validateSpacing(config.headerToContent ?? DEFAULT_SPACING.headerToContent, 'headerToContent'),
    sectionGaps: validateSpacing(config.sectionGaps ?? DEFAULT_SPACING.sectionGaps, 'sectionGaps'),
    sectionTitleGaps: validateSpacing(config.sectionTitleGaps ?? DEFAULT_SPACING.sectionTitleGaps, 'sectionTitleGaps'),
    itemSpacing: validateSpacing(config.itemSpacing ?? DEFAULT_SPACING.itemSpacing, 'itemSpacing'),
    bulletSpacing: validateSpacing(config.bulletSpacing ?? DEFAULT_SPACING.bulletSpacing, 'bulletSpacing'),
    lineHeight: validateSpacing(config.lineHeight ?? DEFAULT_SPACING.lineHeight, 'lineHeight')
  }
}

// Validate spacing value against ranges
export function validateSpacing(value: number, key: keyof SpacingConfig): number {
  const range = SPACING_RANGES[key]
  const clampedValue = Math.max(range.min, Math.min(range.max, value))
  
  // Round to nearest step
  const steppedValue = Math.round(clampedValue / range.step) * range.step
  
  return Math.round(steppedValue * 10) / 10 // Round to 1 decimal place
}

// Convert points to rem for CSS (assuming 16px = 1rem, 12pt = 1rem)
export function spacingToCSS(points: number): string {
  return `${(points / 12).toFixed(3)}rem`
}

// Convert points to PDF units (points are native to PDF)
export function spacingToPDF(points: number): number {
  return points
}

// Get preset name for current configuration (for UI display)
export function getSpacingPresetName(config: SpacingConfig): SpacingPresetName | 'custom' {
  for (const [name, preset] of Object.entries(SPACING_PRESETS)) {
    if (isSpacingConfigEqual(config, preset)) {
      return name as SpacingPresetName
    }
  }
  return 'custom'
}

// Compare two spacing configurations for equality
function isSpacingConfigEqual(a: SpacingConfig, b: SpacingConfig): boolean {
  const keys = Object.keys(a) as Array<keyof SpacingConfig>
  return keys.every(key => Math.abs(a[key] - b[key]) < 0.01) // Allow for floating point precision
}

// Descriptions for UI
export const SPACING_DESCRIPTIONS = {
  nameToTitle: 'Space between your name and professional title',
  titleToContact: 'Space between title and contact information',
  headerToContent: 'Space between header and first content section',
  sectionGaps: 'Space between major sections (Experience, Education, etc.)',
  sectionTitleGaps: 'Space between section headers and their content',
  itemSpacing: 'Space between individual items (jobs, degrees, etc.)',
  bulletSpacing: 'Space between bullet points in lists',
  lineHeight: 'Line height for paragraph text (affects readability)'
} as const
