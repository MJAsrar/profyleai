/**
 * Font Management for PDFMake
 * Handles font loading, registration, and fallbacks
 */

import type { TFontDictionary } from 'pdfmake/interfaces'

export interface FontDefinition {
  name: string
  displayName: string
  files: {
    normal: string
    bold: string
    italics: string
    bolditalics: string
  }
  fallback?: boolean
}

export interface FontVariant {
  family: string
  weight: 'normal' | 'bold'
  style: 'normal' | 'italic'
}

/**
 * Font Manager Class
 */
export class FontManager {
  private fonts: Map<string, FontDefinition> = new Map()
  private loadedFonts: Set<string> = new Set()

  constructor() {
    this.registerDefaultFonts()
  }

  /**
   * Register default web-safe fonts that work with PDFMake
   */
  private registerDefaultFonts(): void {
    // Roboto (default PDFMake font)
    this.registerFont({
      name: 'Roboto',
      displayName: 'Roboto',
      files: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      },
      fallback: true
    })

    // Times (classic serif)
    this.registerFont({
      name: 'Times',
      displayName: 'Times New Roman',
      files: {
        normal: 'Times-Roman.ttf',
        bold: 'Times-Bold.ttf',
        italics: 'Times-Italic.ttf',
        bolditalics: 'Times-BoldItalic.ttf'
      },
      fallback: true
    })

    // Helvetica (clean sans-serif)
    this.registerFont({
      name: 'Helvetica',
      displayName: 'Helvetica',
      files: {
        normal: 'Helvetica.ttf',
        bold: 'Helvetica-Bold.ttf',
        italics: 'Helvetica-Oblique.ttf',
        bolditalics: 'Helvetica-BoldOblique.ttf'
      },
      fallback: true
    })
  }

  /**
   * Register a font for use in PDFs
   */
  registerFont(font: FontDefinition): void {
    this.fonts.set(font.name, font)
    console.log(`Font '${font.displayName}' registered`)
  }

  /**
   * Get all available fonts
   */
  getAvailableFonts(): FontDefinition[] {
    return Array.from(this.fonts.values())
  }

  /**
   * Get font by name
   */
  getFont(name: string): FontDefinition | undefined {
    return this.fonts.get(name)
  }

  /**
   * Get fonts suitable for templates
   */
  getFontsForTemplate(templateType: 'modern' | 'classic' | 'creative'): FontDefinition[] {
    const allFonts = this.getAvailableFonts()
    
    switch (templateType) {
      case 'modern':
        // Clean, sans-serif fonts
        return allFonts.filter(f => 
          ['Roboto', 'Helvetica', 'Open Sans', 'Lato'].includes(f.name)
        )
      
      case 'classic':
        // Traditional serif fonts
        return allFonts.filter(f => 
          ['Times', 'Georgia', 'Garamond'].includes(f.name)
        )
      
      case 'creative':
        // Mix of interesting fonts
        return allFonts.filter(f => 
          ['Roboto', 'Montserrat', 'Playfair Display'].includes(f.name)
        )
      
      default:
        return allFonts.filter(f => f.fallback)
    }
  }

  /**
   * Convert to PDFMake font dictionary
   */
  toPDFMakeFonts(): TFontDictionary {
    const fontDict: TFontDictionary = {}
    
    this.fonts.forEach((font, name) => {
      fontDict[name] = {
        normal: font.files.normal,
        bold: font.files.bold,
        italics: font.files.italics,
        bolditalics: font.files.bolditalics
      }
    })
    
    return fontDict
  }

  /**
   * Get fallback font name
   */
  getFallbackFont(): string {
    const fallbackFont = Array.from(this.fonts.values()).find(f => f.fallback)
    return fallbackFont?.name || 'Roboto'
  }

  /**
   * Validate font family name
   */
  validateFont(fontName: string): string {
    if (this.fonts.has(fontName)) {
      return fontName
    }
    
    console.warn(`Font '${fontName}' not found, using fallback`)
    return this.getFallbackFont()
  }

  /**
   * Get font variant for specific styling
   */
  getFontVariant(font: FontVariant): string {
    const fontDef = this.getFont(font.family)
    if (!fontDef) {
      console.warn(`Font family '${font.family}' not found`)
      return this.getFallbackFont()
    }

    // Determine the correct font file based on weight and style
    if (font.weight === 'bold' && font.style === 'italic') {
      return fontDef.name // PDFMake will handle bolditalics automatically
    } else if (font.weight === 'bold') {
      return fontDef.name // PDFMake will handle bold automatically
    } else if (font.style === 'italic') {
      return fontDef.name // PDFMake will handle italics automatically
    }
    
    return fontDef.name
  }

  /**
   * Load additional fonts from URLs or base64 (future enhancement)
   */
  async loadCustomFont(
    name: string,
    displayName: string,
    fontUrls: {
      normal: string
      bold: string
      italics: string
      bolditalics: string
    }
  ): Promise<void> {
    // This would be implemented to load fonts from URLs
    // For now, we'll just register the font definition
    this.registerFont({
      name,
      displayName,
      files: fontUrls,
      fallback: false
    })
    
    this.loadedFonts.add(name)
    console.log(`Custom font '${displayName}' loaded`)
  }

  /**
   * Get font recommendations for different resume sections
   */
  getRecommendedFonts() {
    return {
      header: {
        modern: 'Roboto',
        classic: 'Times',
        creative: 'Roboto'
      },
      body: {
        modern: 'Roboto',
        classic: 'Times',
        creative: 'Roboto'
      },
      accent: {
        modern: 'Helvetica',
        classic: 'Times',
        creative: 'Roboto'
      }
    }
  }
}

// Export singleton instance
export const fontManager = new FontManager()