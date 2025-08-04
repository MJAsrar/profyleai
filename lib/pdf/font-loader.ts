/**
 * Font Loader - Load and register custom fonts with PDFMake
 */

import type { TFontDictionary } from 'pdfmake/interfaces'

export interface FontConfig {
  normal: string
  bold: string
  italics?: string
  bolditalics?: string
}

export class FontLoader {
  private static fonts: TFontDictionary = {}
  private static isInitialized = false

  /**
   * Initialize and register all custom fonts
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      console.log(`🔧 Initializing FontLoader (${typeof window === 'undefined' ? 'server' : 'client'}-side)...`)
      
      // Clear any existing fonts first
      this.fonts = {}
      // Register all our custom fonts
      await this.registerCustomFonts()
      this.isInitialized = true
      
      console.log(`✅ FontLoader initialized successfully with ${Object.keys(this.fonts).length} font families`)
    } catch (error) {
      console.error('❌ FontLoader initialization failed:', error)
      // Reset initialized flag so it can try again
      this.isInitialized = false
      throw error
    }
  }

  /**
   * Force re-initialization (for debugging)
   */
  static async forceReinitialize(): Promise<void> {
    console.log('🔄 Force re-initializing FontLoader...')
    this.isInitialized = false
    this.fonts = {}
    await this.initialize()
  }

  /**
   * Register custom fonts with PDFMake
   */
  private static async registerCustomFonts(): Promise<void> {
    const fontConfigs = [
      {
        name: 'Inter',
        paths: {
          normal: '/fonts/Inter/static/Inter_18pt-Regular.ttf',
          bold: '/fonts/Inter/static/Inter_18pt-Bold.ttf',
          italics: '/fonts/Inter/static/Inter_18pt-Italic.ttf',
          bolditalics: '/fonts/Inter/static/Inter_18pt-BoldItalic.ttf'
        }
      },
      {
        name: 'CrimsonText',
        paths: {
          normal: '/fonts/Crimson_Text/CrimsonText-Regular.ttf',
          bold: '/fonts/Crimson_Text/CrimsonText-Bold.ttf',
          italics: '/fonts/Crimson_Text/CrimsonText-Italic.ttf',
          bolditalics: '/fonts/Crimson_Text/CrimsonText-BoldItalic.ttf'
        }
      },
      {
        name: 'JetBrainsMono',
        paths: {
          normal: '/fonts/JetBrains_Mono/static/JetBrainsMono-Regular.ttf',
          bold: '/fonts/JetBrains_Mono/static/JetBrainsMono-Bold.ttf',
          italics: '/fonts/JetBrains_Mono/static/JetBrainsMono-Italic.ttf',
          bolditalics: '/fonts/JetBrains_Mono/static/JetBrainsMono-BoldItalic.ttf'
        }
      },
      {
        name: 'Poppins',
        paths: {
          normal: '/fonts/Poppins/Poppins-Regular.ttf',
          bold: '/fonts/Poppins/Poppins-Bold.ttf',
          italics: '/fonts/Poppins/Poppins-Italic.ttf',
          bolditalics: '/fonts/Poppins/Poppins-BoldItalic.ttf'
        }
      },
      {
        name: 'PlayfairDisplay',
        paths: {
          normal: '/fonts/Playfair_Display/static/PlayfairDisplay-Regular.ttf',
          bold: '/fonts/Playfair_Display/static/PlayfairDisplay-Bold.ttf',
          italics: '/fonts/Playfair_Display/static/PlayfairDisplay-Italic.ttf',
          bolditalics: '/fonts/Playfair_Display/static/PlayfairDisplay-BoldItalic.ttf'
        }
      },
      {
        name: 'Montserrat',
        paths: {
          normal: '/fonts/Montserrat/static/Montserrat-Regular.ttf',
          bold: '/fonts/Montserrat/static/Montserrat-Bold.ttf',
          italics: '/fonts/Montserrat/static/Montserrat-Italic.ttf',
          bolditalics: '/fonts/Montserrat/static/Montserrat-BoldItalic.ttf'
        }
      },
      // NunitoSans variable fonts - now enabled for Clean Minimalist template
      {
        name: 'NunitoSans',
        paths: {
          normal: '/fonts/Nunito_Sans/NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf',
          bold: '/fonts/Nunito_Sans/NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf',
          italics: '/fonts/Nunito_Sans/NunitoSans-Italic-VariableFont_YTLC,opsz,wdth,wght.ttf',
          bolditalics: '/fonts/Nunito_Sans/NunitoSans-Italic-VariableFont_YTLC,opsz,wdth,wght.ttf'
        }
      },
      {
        name: 'LibertinusSerif',
        paths: {
          normal: '/fonts/Libertinus_Serif/LibertinusSerif-Regular.ttf',
          bold: '/fonts/Libertinus_Serif/LibertinusSerif-Bold.ttf',
          italics: '/fonts/Libertinus_Serif/LibertinusSerif-Italic.ttf',
          bolditalics: '/fonts/Libertinus_Serif/LibertinusSerif-BoldItalic.ttf'
        }
      }
    ]

    for (const config of fontConfigs) {
      console.log(`📁 Loading font family: ${config.name}`)
      
      // Try to load all font variants
      const fontVariants: any = {}
      let loadedAny = false
      let loadedVariants: string[] = []
      
      for (const [variant, path] of Object.entries(config.paths)) {
        const loadedFont = await this.loadFont(path)
        if (loadedFont) {
          fontVariants[variant] = loadedFont
          loadedAny = true
          loadedVariants.push(variant)
        }
      }
      
      // Only register the font if we loaded at least one variant
      if (loadedAny) {
        // Fill missing variants with available ones
        if (!fontVariants.normal && fontVariants.bold) {
          fontVariants.normal = fontVariants.bold
        }
        if (!fontVariants.bold && fontVariants.normal) {
          fontVariants.bold = fontVariants.normal
        }
        if (!fontVariants.italics) {
          fontVariants.italics = fontVariants.normal || fontVariants.bold
        }
        if (!fontVariants.bolditalics) {
          fontVariants.bolditalics = fontVariants.bold || fontVariants.normal
        }
        
        this.fonts[config.name] = fontVariants
        console.log(`✅ ${config.name} registered with variants: ${loadedVariants.join(', ')}`)
      } else {
        console.warn(`⚠️ ${config.name} failed to load any variants`)
      }
    }
  }

  /**
   * Load font file as base64 data URL
   */
  private static async loadFont(fontPath: string): Promise<string | null> {
    try {
      let arrayBuffer: ArrayBuffer

      // Check if we're running in Node.js (server-side) or browser (client-side)
      if (typeof window === 'undefined') {
        // Server-side: Use Node.js fs to read font files
        const fs = await import('fs')
        const path = await import('path')
        
        // Convert web path to file system path
        const publicPath = path.join(process.cwd(), 'public', fontPath)
        
        try {
          const buffer = fs.readFileSync(publicPath)
          arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
        } catch (fsError) {
          console.warn(`Server-side font loading failed: ${fontPath}`, fsError)
          return null
        }
      } else {
        // Client-side: Use fetch as before
        const response = await fetch(fontPath)
        if (!response.ok) {
          console.warn(`Client-side font loading failed: ${fontPath}`)
          return null
        }
        arrayBuffer = await response.arrayBuffer()
      }
      
      if (arrayBuffer.byteLength === 0) {
        console.warn(`Font file is empty: ${fontPath}`)
        return null
      }
      
      // Additional validation for problematic font types
      if (fontPath.includes('Variable') || fontPath.includes('variable')) {
        console.warn(`Skipping variable font (known to cause issues): ${fontPath}`)
        return null
      }
      
      // Check for reasonable font file size (avoid corrupted or problematic files)
      if (arrayBuffer.byteLength > 10 * 1024 * 1024) { // 10MB limit
        console.warn(`Font file too large, skipping: ${fontPath} (${arrayBuffer.byteLength} bytes)`)
        return null
      }
      
      // Convert to base64 in chunks to avoid stack overflow for large fonts
      const uint8Array = new Uint8Array(arrayBuffer)
      let binaryString = ''
      const chunkSize = 8192 // Process 8KB at a time
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize)
        binaryString += String.fromCharCode(...chunk)
      }
      
      // Use appropriate base64 encoding based on environment
      let base64: string
      if (typeof window === 'undefined') {
        // Server-side: Use Buffer
        base64 = Buffer.from(uint8Array).toString('base64')
      } else {
        // Client-side: Use btoa
        base64 = btoa(binaryString)
      }
      
      // Determine MIME type based on file extension
      const isWoff2 = fontPath.endsWith('.woff2')
      const isTtf = fontPath.endsWith('.ttf')
      const mimeType = isWoff2 ? 'font/woff2' : isTtf ? 'font/truetype' : 'application/font-truetype'
      
      const dataUrl = `data:${mimeType};charset=utf-8;base64,${base64}`
      
      console.log(`✅ Successfully loaded font: ${fontPath} (${typeof window === 'undefined' ? 'server' : 'client'}-side)`)
      return dataUrl
    } catch (error) {
      console.error(`❌ Font loading failed for ${fontPath}:`, error)
      return null
    }
  }

  /**
   * Get registered fonts for PDFMake
   */
  static getFonts(): TFontDictionary {
    return this.fonts
  }

  /**
   * Map CSS font family to PDFMake font name
   */
  static mapFontFamily(cssFont: string): string {
    if (!cssFont) return 'Helvetica'

    const lowerFont = cssFont.toLowerCase()

    // Direct font mappings to our custom fonts (only if loaded)
    const customFontMappings: { [key: string]: string } = {
      'inter': 'Inter',
      'crimson text': 'CrimsonText',
      'jetbrains mono': 'JetBrainsMono',
      'poppins': 'Poppins',
      'playfair display': 'PlayfairDisplay',
      'montserrat': 'Montserrat',
      'nunito sans': 'NunitoSans', // Re-enabled for Clean Minimalist
      'libertinusserif': 'LibertinusSerif',
      'libertinus serif': 'LibertinusSerif'
    }

    // Check for custom fonts first (only if they're actually loaded)
    for (const [pattern, pdfFont] of Object.entries(customFontMappings)) {
      if (lowerFont.includes(pattern)) {
        if (this.fonts[pdfFont]) {
          return pdfFont
        }
      }
    }

    // Fallback to system fonts
    const systemFontMappings: { [key: string]: string } = {
      'georgia': 'Times',
      'times': 'Times',
      'arial': 'Helvetica',
      'helvetica': 'Helvetica',
      'courier': 'Courier'
    }

    for (const [pattern, pdfFont] of Object.entries(systemFontMappings)) {
      if (lowerFont.includes(pattern)) {
        return pdfFont
      }
    }

    // Final fallback based on font type
    if (lowerFont.includes('serif')) {
      return 'Times'
    } else if (lowerFont.includes('mono')) {
      return 'Courier'
    } else {
      return 'Helvetica'
    }
  }

  /**
   * Check if custom fonts are loaded
   */
  static areCustomFontsLoaded(): boolean {
    return this.isInitialized && Object.keys(this.fonts).length > 0
  }

  /**
   * Get available font families
   */
  static getAvailableFonts(): string[] {
    return Object.keys(this.fonts)
  }
}
