// CSS Engine for dynamic template rendering
import { CSSProperties } from 'react'
import { FontSizeConfig, DEFAULT_FONT_SIZES, fontSizeToCSS } from './font-config'
import { SpacingConfig, DEFAULT_SPACING, spacingToCSS } from './spacing-config'

export interface TemplateCSSData {
  layout: {
    type: 'single-column' | 'two-column' | 'modern-split'
    pageSize: 'letter' | 'a4'
    margins: string
    spacing: string
  }
  typography: {
    primaryFont: string
    secondaryFont?: string
    baseFontSize: string
    headingScale: number
    lineHeight: number
  }
  colors: {
    primary: string
    secondary: string
    accent: string
    text: string
    background: string
    border?: string
  }
  sections: {
    header: CSSProperties
    section: CSSProperties
    sectionTitle: CSSProperties
  }
  elements: {
    name: CSSProperties
    title?: CSSProperties
    contact: CSSProperties
    jobTitle: CSSProperties
    company: CSSProperties
    dates: CSSProperties
    bulletPoints: CSSProperties
    [key: string]: CSSProperties | undefined
  }
}

export class CSSEngine {
  private _cssData: TemplateCSSData
  private _fontConfig: FontSizeConfig
  private _spacingConfig: SpacingConfig

  constructor(cssData: TemplateCSSData, fontConfig?: FontSizeConfig, spacingConfig?: SpacingConfig) {
    this._cssData = cssData
    this._fontConfig = fontConfig || DEFAULT_FONT_SIZES
    this._spacingConfig = spacingConfig || DEFAULT_SPACING
  }

  // Expose cssData for layout decisions
  get cssData(): TemplateCSSData {
    return this._cssData
  }

  // Get current font configuration
  get fontConfig(): FontSizeConfig {
    return this._fontConfig
  }

  // Update font configuration
  updateFontConfig(fontConfig: FontSizeConfig): void {
    this._fontConfig = fontConfig
  }

  // Get font size for specific element types
  private getFontSizeForElement(elementKey: string): string | undefined {
    const fontSizeMap: Record<string, keyof FontSizeConfig> = {
      'name': 'name',
      'contact': 'contact',
      
      // Headers group: All titles, names, dates, and verification URLs
      'jobTitle': 'jobTitle',
      'dates': 'jobTitle',               // All dates controlled by Headers
      'certificationName': 'jobTitle',   // Cert names controlled by Headers
      'certificationDate': 'jobTitle',   // Cert dates controlled by Headers
      'projectTitle': 'jobTitle',        // Project names controlled by Headers
      'projectLink': 'jobTitle',         // Verification URLs controlled by Headers
      
      // Organizations group: Company names, universities, certification issuers
      'company': 'company',
      'certificationIssuer': 'company',  // Cert issuers controlled by Organizations
      
      // Main Body Text group: Descriptions and skills content only
      'summary': 'content',              // Summary descriptions
      'skillCategory': 'content',        // Skill categories
      'skillItems': 'content',           // Individual skills
      'skillList': 'content',            // Skill items (alias)
      'bulletPoints': 'content',         // Bullet points
      'certificationDetails': 'content', // Cert descriptions
      'projectDescription': 'content',   // Project descriptions
      
      // Additional mappings for web renderer elements
      'title': 'content',        // Job title area elements
      'skills': 'content',       // Skills section content
      'content': 'content',      // General content elements
      'description': 'content',  // Description text
      'achievements': 'content', // Achievement lists
      'technologies': 'content', // Technology lists
    }
    
    const configKey = fontSizeMap[elementKey]
    if (configKey) {
      return fontSizeToCSS(this._fontConfig[configKey])
    }
    
    // Default to content size for unspecified elements
    return fontSizeToCSS(this._fontConfig.content)
  }

  // Generate CSS variables for consistent theming
  getCSSVariables(): CSSProperties {
    return {
      '--primary-color': this._cssData.colors.primary,
      '--secondary-color': this._cssData.colors.secondary,
      '--accent-color': this._cssData.colors.accent,
      '--text-color': this._cssData.colors.text,
      '--background-color': this._cssData.colors.background,
      '--border-color': this._cssData.colors.border || this._cssData.colors.text,
      '--primary-font': this._cssData.typography.primaryFont,
      '--secondary-font': this._cssData.typography.secondaryFont || this._cssData.typography.primaryFont,
      '--base-font-size': this._cssData.typography.baseFontSize,
      '--line-height': this._cssData.typography.lineHeight,
      '--heading-scale': this._cssData.typography.headingScale,
      '--margin': this._cssData.layout.margins,
      '--spacing': this._cssData.layout.spacing,
    } as CSSProperties
  }

  // Get styles for the main container
  getContainerStyles(): CSSProperties {
    const baseStyles: CSSProperties = {
      fontFamily: this._cssData.typography.primaryFont,
      fontSize: this._cssData.typography.baseFontSize,
      lineHeight: this._cssData.typography.lineHeight,
      color: this._cssData.colors.text,
      backgroundColor: this._cssData.colors.background,
      margin: this._cssData.layout.margins,
      maxWidth: this._cssData.layout.pageSize === 'letter' ? '8.5in' : '210mm',
      minHeight: this._cssData.layout.pageSize === 'letter' ? '11in' : '297mm',
      padding: this._cssData.layout.spacing,
      position: 'relative',
    }

    return baseStyles
  }

  // Get only typography styles for sections (without layout constraints)
  getBaseTypographyStyles(): CSSProperties {
    return {
      fontFamily: this._cssData.typography.primaryFont,
      fontSize: this._cssData.typography.baseFontSize,
      lineHeight: this._spacingConfig.lineHeight,
      color: this._cssData.colors.text,
    }
  }

  // Get layout-specific container styles
  getLayoutStyles(): CSSProperties {
    switch (this._cssData.layout.type) {
      case 'two-column':
        return {
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: this._cssData.layout.spacing,
        }
      case 'modern-split':
        return {
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: '0',
        }
      case 'single-column':
      default:
        return {
          display: 'flex',
          flexDirection: 'column',
          gap: this._cssData.layout.spacing,
        }
    }
  }

  // Get styles for specific elements
  getElementStyles(elementKey: keyof TemplateCSSData['elements']): CSSProperties {
    // Ensure elements object exists
    if (!this._cssData.elements) {
      console.warn(`CSS engine missing elements object, using defaults for ${elementKey}`)
      return this.getDefaultElementStyle(elementKey)
    }
    
    const baseStyles = this._cssData.elements[elementKey] || {}
    
    // Apply dynamic font sizes
    const fontSize = this.getFontSizeForElement(elementKey as string)
    if (fontSize) {
      baseStyles.fontSize = fontSize
    }
    
    // If no styles found, return defaults
    if (!baseStyles || Object.keys(baseStyles).length === 0) {
      return this.getDefaultElementStyle(elementKey)
    }
    
    // Process CSS properties that might use theme variables
    const processedStyles: CSSProperties = {}
    
    Object.entries(baseStyles).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Replace color references with actual values
        let processedValue = value
          .replace(/var\(--primary-color\)/g, this._cssData.colors.primary)
          .replace(/var\(--secondary-color\)/g, this._cssData.colors.secondary)
          .replace(/var\(--accent-color\)/g, this._cssData.colors.accent)
          .replace(/var\(--text-color\)/g, this._cssData.colors.text)
          .replace(/var\(--border-color\)/g, this._cssData.colors.border || this._cssData.colors.text)
        
        processedStyles[key as keyof CSSProperties] = processedValue as any
      } else {
        processedStyles[key as keyof CSSProperties] = value
      }
    })

    return processedStyles
  }

  // Get default styles for missing elements (using dynamic font sizes)
  private getDefaultElementStyle(elementKey: keyof TemplateCSSData['elements']): CSSProperties {
    const defaults: { [K in keyof TemplateCSSData['elements']]: CSSProperties } = {
      name: {
        fontSize: this.getFontSizeForElement('name') || fontSizeToCSS(this._fontConfig.name),
        fontWeight: '700',
        marginBottom: '0rem', // NO gap between name and contact
        marginTop: '0rem', // NO top margin
        paddingBottom: '0rem', // NO padding
        paddingTop: '0rem', // NO padding
        lineHeight: 1.0, // Ultra-tight line height
        color: this._cssData.colors.primary,
      },
      title: {
        fontSize: this.getFontSizeForElement('title') || fontSizeToCSS(this._fontConfig.content),
        fontWeight: '400',
        color: this._cssData.colors.text,
      },
      contact: {
        fontSize: this.getFontSizeForElement('contact') || fontSizeToCSS(this._fontConfig.contact),
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        marginTop: '0rem', // Removed gap between name and contact
        paddingTop: '0rem', // NO padding
        marginBottom: '0rem', // NO bottom margin
        paddingBottom: '0rem', // NO padding
      },
      jobTitle: {
        fontSize: this.getFontSizeForElement('jobTitle') || fontSizeToCSS(this._fontConfig.jobTitle),
        fontWeight: '600',
        marginBottom: '0rem',
        color: this._cssData.colors.text,
      },
      company: {
        fontSize: this.getFontSizeForElement('company') || fontSizeToCSS(this._fontConfig.company),
        fontWeight: '500',
        color: this._cssData.colors.secondary,
        marginBottom: '0rem',
      },
      dates: {
        fontSize: this.getFontSizeForElement('dates') || fontSizeToCSS(this._fontConfig.dates),
        color: this._cssData.colors.text,
        fontStyle: 'italic',
        opacity: 0.7,
      },
      bulletPoints: {
        fontSize: this.getFontSizeForElement('bulletPoints') || fontSizeToCSS(this._fontConfig.content),
        lineHeight: 1.0, // Ultra-compact line height
        color: this._cssData.colors.text,
      },
      summary: {
        fontSize: this.getFontSizeForElement('summary') || fontSizeToCSS(this._fontConfig.summary),
        lineHeight: 1.3, // Comfortable reading line height
        color: this._cssData.colors.text,
        whiteSpace: 'pre-line', // Preserve line breaks
      },
      // Skills elements
      skillCategory: {
        fontSize: this.getFontSizeForElement('skillCategory') || fontSizeToCSS(this._fontConfig.skillCategory),
        fontWeight: '600',
        color: this._cssData.colors.text,
      },
      skillItems: {
        fontSize: this.getFontSizeForElement('skillItems') || fontSizeToCSS(this._fontConfig.skillItems),
        color: this._cssData.colors.text,
      },
      // Project elements
      projectTitle: {
        fontSize: this.getFontSizeForElement('projectTitle') || fontSizeToCSS(this._fontConfig.jobTitle),
        fontWeight: '600',
        color: this._cssData.colors.secondary,
      },
      projectDate: {
        fontSize: this.getFontSizeForElement('projectDate') || fontSizeToCSS(this._fontConfig.jobTitle),
        color: this._cssData.colors.text,
        fontStyle: 'italic',
        opacity: 0.7,
      },
      projectDescription: {
        fontSize: this.getFontSizeForElement('projectDescription') || fontSizeToCSS(this._fontConfig.content),
        color: this._cssData.colors.text,
        lineHeight: 1.3,
      },
      projectLink: {
        fontSize: this.getFontSizeForElement('projectLink') || fontSizeToCSS(this._fontConfig.jobTitle),
        color: this._cssData.colors.secondary,
      },
      // Certification elements
      certificationName: {
        fontSize: this.getFontSizeForElement('certificationName') || fontSizeToCSS(this._fontConfig.jobTitle),
        fontWeight: '600',
        color: this._cssData.colors.text,
      },
      certificationDetails: {
        fontSize: this.getFontSizeForElement('certificationDetails') || fontSizeToCSS(this._fontConfig.content),
        color: this._cssData.colors.text,
      },
      certificationIssuer: {
        fontSize: this.getFontSizeForElement('certificationIssuer') || fontSizeToCSS(this._fontConfig.company),
        color: this._cssData.colors.secondary,
        fontStyle: 'italic',
      },
      certificationDate: {
        fontSize: this.getFontSizeForElement('certificationDate') || fontSizeToCSS(this._fontConfig.jobTitle),
        color: this._cssData.colors.text,
        opacity: 0.7,
      },
    }

    return defaults[elementKey] || {}
  }

  // Get section styles
  getSectionStyles(): CSSProperties {
    return {
      ...this._cssData.sections.section,
      marginBottom: spacingToCSS(this._spacingConfig.sectionGaps),
    }
  }

  // Get section title styles
  getSectionTitleStyles(): CSSProperties {
    return {
      ...this._cssData.sections.sectionTitle,
      fontSize: fontSizeToCSS(this._fontConfig.sectionHeaders),
      fontFamily: this._cssData.typography.secondaryFont || this._cssData.typography.primaryFont,
      marginBottom: spacingToCSS(this._spacingConfig.sectionTitleGaps),
    }
  }

  // Get header styles
  getHeaderStyles(): CSSProperties {
    return {
      ...this._cssData.sections.header,
      background: '#ffffff', // Force white background
      color: '#1f2937', // Ensure text is visible
      marginBottom: spacingToCSS(this._spacingConfig.headerToContent),
    }
  }

  // Get spacing-specific styles for individual elements
  getSpacingStyles() {
    return {
      nameToTitle: {
        marginBottom: spacingToCSS(this._spacingConfig.nameToTitle),
      },
      titleToContact: {
        marginBottom: spacingToCSS(this._spacingConfig.titleToContact),
      },
      itemSpacing: {
        marginBottom: spacingToCSS(this._spacingConfig.itemSpacing),
      },
      bulletSpacing: {
        marginBottom: spacingToCSS(this._spacingConfig.bulletSpacing),
      },
    }
  }

  // Helper method to scale font sizes
  getScaledFontSize(scale: number): string {
    const baseSizeNum = parseFloat(this._cssData.typography.baseFontSize)
    const unit = this._cssData.typography.baseFontSize.replace(/[\d.]/g, '')
    return `${baseSizeNum * scale}${unit}`
  }

  // Generate utility classes for common patterns
  getUtilityStyles() {
    return {
      flexBetween: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      } as CSSProperties,
      flexStart: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0rem',
      } as CSSProperties,
      flexWrap: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0rem',
      } as CSSProperties,
      textMuted: {
        opacity: 0.8,
      } as CSSProperties,
      textSmall: {
        fontSize: this.getScaledFontSize(0.9),
      } as CSSProperties,
      textLarge: {
        fontSize: this.getScaledFontSize(1.2),
      } as CSSProperties,
      borderBottom: {
        borderBottom: `1px solid ${this._cssData.colors.border || this._cssData.colors.primary}`,
        paddingBottom: '0rem',
        marginBottom: '0rem',
      } as CSSProperties,
    }
  }
}

// Helper function to create CSS engine from template
export function createCSSEngine(cssData: any, fontConfig?: FontSizeConfig, spacingConfig?: SpacingConfig): CSSEngine {
  const validatedCssData = validateAndNormalizeCSSData(cssData, fontConfig)
  return new CSSEngine(validatedCssData, fontConfig, spacingConfig)
}

// Export the default CSS data for external use (with optional font config)
export function getDefaultCSSDataExport(fontConfig?: FontSizeConfig): TemplateCSSData {
  return getDefaultCSSData(fontConfig)
}

// Validate and normalize CSS data to ensure all required properties exist
function validateAndNormalizeCSSData(cssData: any, fontConfig?: FontSizeConfig): TemplateCSSData {
  if (!cssData) {
    console.warn('No CSS data provided, using defaults')
    return getDefaultCSSData(fontConfig)
  }

  // Ensure all required top-level properties exist
  const normalized: TemplateCSSData = {
    layout: {
      type: cssData.layout?.type || 'single-column',
      pageSize: cssData.layout?.pageSize || 'letter',
      margins: cssData.layout?.margins || '0.1rem', // Absolute minimal margins
      spacing: cssData.layout?.spacing || '0.2rem', // Absolute minimal spacing
      ...cssData.layout
    },
    typography: {
      primaryFont: cssData.typography?.primaryFont || 'Inter, Arial, sans-serif',
      secondaryFont: cssData.typography?.secondaryFont,
      baseFontSize: cssData.typography?.baseFontSize || '7pt', // Absolute minimal font size
      headingScale: cssData.typography?.headingScale || 1.2,
      lineHeight: cssData.typography?.lineHeight || 1.1, // Absolute minimal line height
      ...cssData.typography
    },
    colors: {
      primary: cssData.colors?.primary || '#1f2937',
      secondary: cssData.colors?.secondary || '#4f46e5',
      accent: cssData.colors?.accent || '#059669',
      text: cssData.colors?.text || '#1f2937',
      background: cssData.colors?.background || '#ffffff',
      border: cssData.colors?.border || '#e5e7eb',
      ...cssData.colors
    },
    sections: {
      header: {
        marginBottom: '0rem', // No header margin
        paddingBottom: '0rem', // No header padding
        borderBottom: `2px solid ${cssData.colors?.primary || '#1f2937'}`,
        ...cssData.sections?.header
      },
      section: {
        marginBottom: '0.25rem', // Doubled section spacing
        ...cssData.sections?.section
      },
      sectionTitle: {
        fontWeight: '700',
        marginBottom: '0.2rem', // Doubled title spacing
        color: cssData.colors?.primary || '#1f2937',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        ...cssData.sections?.sectionTitle
      },
      ...cssData.sections
    },
    elements: {
      name: {
        fontSize: fontSizeToCSS(fontConfig?.name || DEFAULT_FONT_SIZES.name),
        fontWeight: '700',
        marginBottom: '0rem', // NO gap between name and contact
        marginTop: '0rem', // NO top margin
        paddingBottom: '0rem', // NO padding
        paddingTop: '0rem', // NO padding
        lineHeight: 1.0, // Ultra-tight line height
        color: cssData.colors?.primary || '#1f2937',
        ...cssData.elements?.name
      },
      contact: {
        fontSize: fontSizeToCSS(fontConfig?.contact || DEFAULT_FONT_SIZES.contact),
        display: 'flex',
        gap: '0rem',
        flexWrap: 'wrap',
        marginTop: '0rem', // Zero gap between name and contact
        ...cssData.elements?.contact
      },
      jobTitle: {
        fontSize: fontSizeToCSS(fontConfig?.jobTitle || DEFAULT_FONT_SIZES.jobTitle),
        fontWeight: '600',
        marginBottom: '0rem',
        ...cssData.elements?.jobTitle
      },
      company: {
        fontSize: fontSizeToCSS(fontConfig?.company || DEFAULT_FONT_SIZES.company),
        fontWeight: '500',
        color: cssData.colors?.secondary || '#4f46e5',
        marginBottom: '0rem',
        ...cssData.elements?.company
      },
      dates: {
        fontSize: fontSizeToCSS(fontConfig?.dates || DEFAULT_FONT_SIZES.dates),
        color: '#6b7280',
        fontStyle: 'italic',
        ...cssData.elements?.dates
      },
      bulletPoints: {
        fontSize: fontSizeToCSS(fontConfig?.content || DEFAULT_FONT_SIZES.content),
        lineHeight: 1.0, // Ultra-compact line height
        ...cssData.elements?.bulletPoints
      },
      ...cssData.elements
    }
  }

  return normalized
}

// Get default CSS data
function getDefaultCSSData(fontConfig?: FontSizeConfig): TemplateCSSData {
  return {
    layout: {
      type: 'single-column',
      pageSize: 'letter',
      margins: '0rem', // Zero margins
      spacing: '0rem', // Zero spacing
    },
    typography: {
      primaryFont: 'Inter, Arial, sans-serif',
      baseFontSize: '7pt', // Absolute minimal font size
      headingScale: 1.2,
      lineHeight: 1.0, // Zero line spacing
    },
    colors: {
      primary: '#1f2937',
      secondary: '#4f46e5',
      accent: '#059669',
      text: '#1f2937',
      background: '#ffffff',
      border: '#e5e7eb',
    },
    sections: {
      header: {
        marginBottom: '0rem', // No spacing after header
        paddingBottom: '0rem', // Zero header padding
        // Removed border for minimal design
      },
      section: {
        marginBottom: '0.25rem', // Doubled section spacing
      },
      sectionTitle: {
        fontWeight: '700',
        marginBottom: '0.125rem', // Doubled title spacing
        color: '#1f2937',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      },
    },
    elements: {
      name: {
        fontSize: fontSizeToCSS(DEFAULT_FONT_SIZES.name),
        fontWeight: '700',
        marginBottom: '0rem', // NO gap between name and contact
        marginTop: '0rem', // NO top margin
        paddingBottom: '0rem', // NO padding
        paddingTop: '0rem', // NO padding
        lineHeight: 1.0, // Ultra-tight line height
        color: '#1f2937',
      },
      contact: {
        fontSize: fontSizeToCSS(DEFAULT_FONT_SIZES.contact),
        display: 'flex',
        gap: '0rem',
        flexWrap: 'wrap',
        marginTop: '0rem', // Zero gap between name and contact
        paddingTop: '0rem', // Zero padding
        marginBottom: '0rem', // Zero bottom margin
        paddingBottom: '0rem', // Zero padding
      },
      jobTitle: {
        fontSize: fontSizeToCSS(DEFAULT_FONT_SIZES.jobTitle),
        fontWeight: '600',
        marginBottom: '0rem',
      },
      company: {
        fontSize: fontSizeToCSS(DEFAULT_FONT_SIZES.company),
        fontWeight: '500',
        color: '#4f46e5',
        marginBottom: '0rem',
      },
      dates: {
        fontSize: fontSizeToCSS(DEFAULT_FONT_SIZES.dates),
        color: '#6b7280',
        fontStyle: 'italic',
      },
      bulletPoints: {
        fontSize: fontSizeToCSS(DEFAULT_FONT_SIZES.content),
        lineHeight: 1.0, // Ultra-compact line height
      },
      summary: {
        fontSize: fontSizeToCSS(DEFAULT_FONT_SIZES.summary),
        lineHeight: 1.3, // Comfortable reading line height
        color: '#1f2937',
        whiteSpace: 'pre-line', // Preserve line breaks
      },
      // Skills elements
      skillCategory: {
        fontSize: fontSizeToCSS(DEFAULT_FONT_SIZES.skillCategory),
        fontWeight: '600',
        color: '#1f2937',
      },
      skillItems: {
        fontSize: fontSizeToCSS(DEFAULT_FONT_SIZES.skillItems),
        color: '#1f2937',
      },
      // Project elements
      projectTitle: {
        fontSize: fontSizeToCSS(DEFAULT_FONT_SIZES.jobTitle),
        fontWeight: '600',
        color: '#4f46e5',
      },
      projectDate: {
        fontSize: fontSizeToCSS(DEFAULT_FONT_SIZES.jobTitle),
        color: '#6b7280',
        fontStyle: 'italic',
      },
      projectDescription: {
        fontSize: fontSizeToCSS(DEFAULT_FONT_SIZES.content),
        color: '#1f2937',
        lineHeight: 1.3,
      },
      projectLink: {
        fontSize: fontSizeToCSS(DEFAULT_FONT_SIZES.jobTitle),
        color: '#4f46e5',
      },
      // Certification elements
      certificationName: {
        fontSize: fontSizeToCSS(DEFAULT_FONT_SIZES.jobTitle),
        fontWeight: '600',
        color: '#1f2937',
      },
      certificationDetails: {
        fontSize: fontSizeToCSS(DEFAULT_FONT_SIZES.content),
        color: '#1f2937',
      },
      certificationIssuer: {
        fontSize: fontSizeToCSS(DEFAULT_FONT_SIZES.company),
        color: '#4f46e5',
        fontStyle: 'italic',
      },
      certificationDate: {
        fontSize: fontSizeToCSS(DEFAULT_FONT_SIZES.jobTitle),
        color: '#6b7280',
      },
    },
  }
}

// Helper function to safely get nested CSS property
export function getCSSProperty(obj: any, path: string, fallback: any = undefined): any {
  return path.split('.').reduce((current, key) => current?.[key], obj) ?? fallback
}

// Utility function to merge CSS styles
export function mergeStyles(...styles: (CSSProperties | undefined)[]): CSSProperties {
  return styles.filter((style): style is CSSProperties => Boolean(style)).reduce((merged, style) => ({ ...merged, ...style }), {})
}