/**
 * Font configuration system for dynamic font size management
 * Used by both web renderers and PDF generation
 */

export interface FontSizeConfig {
  // Main elements
  name: number              // Person's name (largest)
  sectionHeaders: number    // Section titles (Experience, Education, etc.)
  
  // Headers group: All titles, names, dates, and verification URLs
  jobTitle: number          // Job titles, project names, certification names, all dates, verification URLs
  company: number           // Company names, universities, certification issuers
  dates: number             // Date ranges (synced with jobTitle)
  
  // Main Body Text group: All descriptions and skills content
  content: number           // Descriptions: summary, experience, projects, certifications + all skills
  contact: number           // Contact information
  summary: number           // Professional summary (synced with content)
  
  // Skills and lists (synced with content)
  skillCategory: number     // Skill category labels
  skillItems: number        // Individual skills
  bulletPoints: number      // Bullet point content
  
  // Synced elements (controlled by main groups above)
  certificationName: number // Certification titles (synced with jobTitle)
  certificationDetails: number // Certification descriptions (synced with content)
  
  // Projects (mixed sync)
  projectTitle: number // Project names (synced with jobTitle)
  projectDescription: number // Project descriptions (synced with content)
  projectLink: number // Project URLs/verification links (synced with jobTitle)
  
  // Additional detailed elements
  certificationIssuer: number // Certification issuers (synced with company)
  certificationDate: number // Certification dates (synced with jobTitle)
}

// Default font sizes with logical groupings
export const DEFAULT_FONT_SIZES: FontSizeConfig = {
  name: 28,                 // 28pt - Large and prominent
  sectionHeaders: 14,       // 14pt - Clear section separation
  
  // Headers group (controlled by "Headers" slider)
  jobTitle: 10,             // 10pt - Controls all titles, names, dates, verification URLs
  company: 9,               // 9pt - Controls company names, universities, certification issuers
  dates: 10,                // 10pt - Date ranges (synced with jobTitle)
  
  // Main Body Text group (controlled by "Main Body Text" slider)
  content: 8,               // 8pt - Controls all descriptions and skills content
  contact: 8,               // 8pt - Contact info
  summary: 8,               // 8pt - Summary text (synced with content)
  
  skillCategory: 8,         // 8pt - Skill labels (synced with content)
  skillItems: 8,            // 8pt - Individual skills (synced with content)
  bulletPoints: 8,          // 8pt - Bullet content (synced with content)
  
  // Auto-synced elements (no direct user control)
  certificationName: 10,    // 10pt - Cert names (synced with jobTitle/Headers)
  certificationDetails: 8,  // 8pt - Cert descriptions (synced with content)
  
  projectTitle: 10,         // 10pt - Project names (synced with jobTitle/Headers)
  projectDescription: 8,    // 8pt - Project descriptions (synced with content)
  projectLink: 10,          // 10pt - Project URLs (synced with jobTitle/Headers)
  
  certificationIssuer: 9,   // 9pt - Cert issuers (synced with company/Organizations)
  certificationDate: 10,    // 10pt - Cert dates (synced with jobTitle/Headers)
}

// Font size ranges for validation and UI controls
export const FONT_SIZE_RANGES = {
  min: 6,     // Minimum readable size
  max: 36,    // Maximum practical size
  step: 0.5,  // Increment step
}

// Font size presets for quick selection
export const FONT_SIZE_PRESETS = {
  compact: {
    name: 24,
    sectionHeaders: 12,
    jobTitle: 9,
    company: 8,
    dates: 7,
    content: 7,
    contact: 7,
    summary: 7,              // Same as content
    skillCategory: 7,        // Same as content
    skillItems: 7,           // Same as content
    bulletPoints: 7,         // Same as content
    certificationName: 7,    // Same as content
    certificationDetails: 7, // Same as content
  },
  
  normal: DEFAULT_FONT_SIZES,
  
  large: {
    name: 32,
    sectionHeaders: 16,
    jobTitle: 12,
    company: 11,
    dates: 10,
    content: 10,
    contact: 10,
    summary: 10,             // Same as content
    skillCategory: 10,       // Same as content
    skillItems: 10,          // Same as content
    bulletPoints: 10,        // Same as content
    certificationName: 10,   // Same as content
    certificationDetails: 10, // Same as content
  }
} as const

// Helper functions for font size management
export function validateFontSize(size: number): number {
  return Math.max(FONT_SIZE_RANGES.min, Math.min(FONT_SIZE_RANGES.max, size))
}

export function fontSizeToCSS(size: number): string {
  return `${validateFontSize(size)}pt`
}

export function fontSizeToPDF(size: number): number {
  return validateFontSize(size)
}

// Create a font config with validation
export function createFontConfig(partial: Partial<FontSizeConfig> = {}): FontSizeConfig {
  const config = { ...DEFAULT_FONT_SIZES, ...partial }
  
  // Validate all sizes
  Object.keys(config).forEach(key => {
    config[key as keyof FontSizeConfig] = validateFontSize(config[key as keyof FontSizeConfig])
  })
  
  return config
}

// Calculate relative sizes based on base size
export function createRelativeFontConfig(baseSize: number = 8): FontSizeConfig {
  return {
    name: baseSize * 3.5,           // 3.5x base
    sectionHeaders: baseSize * 1.75, // 1.75x base
    
    jobTitle: baseSize * 1.25,      // 1.25x base
    company: baseSize * 1.125,      // 1.125x base
    dates: baseSize,                // 1x base
    
    content: baseSize,              // 1x base
    contact: baseSize,              // 1x base
    summary: baseSize,              // 1x base
    
    skillCategory: baseSize,        // 1x base
    skillItems: baseSize,           // 1x base
    bulletPoints: baseSize,         // 1x base
    
    certificationName: baseSize,    // 1x base
    certificationDetails: baseSize * 0.875, // 0.875x base
  }
}