/**
 * PDFMake Service - Core PDF generation functionality
 */

import type { TDocumentDefinitions, TFontDictionary } from 'pdfmake/interfaces'
import type { ResumeData } from '@/lib/resume-store'
import { DynamicPDFTemplate } from './templates/dynamic-template'
import type { TemplateCSSData } from '@/lib/css-engine'
import { FontLoader } from './font-loader'
import type { FontSizeConfig } from '@/lib/font-config'

export interface PDFGenerationOptions {
  template: 'modern' | 'classic' | 'creative' | string
  templateData?: {
    id: string
    name: string
    cssData?: TemplateCSSData
  }
  fontConfig?: FontSizeConfig
  filename?: string
  pageSize?: 'A4' | 'LETTER'
  margins?: [number, number, number, number] // [left, top, right, bottom]
}

export interface PDFTemplate {
  id: string
  name: string
  generate(data: ResumeData, options?: Partial<PDFGenerationOptions>): TDocumentDefinitions
}

/**
 * Main PDF Service Class
 */
export class PDFService {
  private static instance: PDFService
  private pdfMake: any = null
  private fonts: TFontDictionary = {}
  private templates: Map<string, PDFTemplate> = new Map()

  private constructor() {}

  static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService()
    }
    return PDFService.instance
  }

  /**
   * Initialize PDFMake with fonts and configuration
   */
  async initialize(): Promise<void> {
    if (this.pdfMake) {
      // Force re-initialization to apply font fixes
      this.pdfMake = null
      this.fonts = {}
    }

    try {
      // Dynamic import to avoid SSR issues
      const pdfMakeModule = await import('pdfmake/build/pdfmake')
      const vfs = await import('pdfmake/build/vfs_fonts')
      
      this.pdfMake = pdfMakeModule.default
      
      // Initialize custom font loader (force re-initialization)
      await FontLoader.forceReinitialize()
      
      // Set up fonts with fallbacks - use only fonts available in PDFMake vfs
      this.fonts = {
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf'
        }
      }
      
      // Check if custom fonts were loaded
      const loadedCustomFonts = FontLoader.getFonts()
      console.log(`🔤 FontLoader provided ${Object.keys(loadedCustomFonts).length} custom fonts:`, Object.keys(loadedCustomFonts))
      
      if (Object.keys(loadedCustomFonts).length > 0) {
        console.log('📝 Custom fonts loaded successfully, will add to VFS')
        // Will add them to VFS and override font definitions
      } else {
        console.warn('⚠️ No custom fonts loaded, falling back to system fonts only')
      }
      
      // Try to add Times if available in vfs, otherwise create alias to Roboto
      const hasTimesNormal = 'Times-Roman.ttf' in vfs.default || 'times.ttf' in vfs.default
      const hasTimesBold = 'Times-Bold.ttf' in vfs.default || 'timesbd.ttf' in vfs.default
      
      if (hasTimesNormal && hasTimesBold) {
        this.fonts.Times = {
          normal: 'Times-Roman.ttf',
          bold: 'Times-Bold.ttf',
          italics: 'Times-Italic.ttf',
          bolditalics: 'Times-BoldItalic.ttf'
        }
      } else {
        this.fonts.Times = {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf'
        }
      }
      
      // Add Helvetica alias (fallback to Roboto)
      this.fonts.Helvetica = {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf', 
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      }
      
      // Start with default VFS
      const customVfs = { ...vfs.default }
      
      // Define custom font configurations with actual file mappings
      const customFontConfigs = [
        { name: 'Inter', paths: { normal: '/fonts/Inter/static/Inter_18pt-Regular.ttf', bold: '/fonts/Inter/static/Inter_18pt-Bold.ttf', italics: '/fonts/Inter/static/Inter_18pt-Italic.ttf', bolditalics: '/fonts/Inter/static/Inter_18pt-BoldItalic.ttf' } },
        { name: 'CrimsonText', paths: { normal: '/fonts/Crimson_Text/CrimsonText-Regular.ttf', bold: '/fonts/Crimson_Text/CrimsonText-Bold.ttf', italics: '/fonts/Crimson_Text/CrimsonText-Italic.ttf', bolditalics: '/fonts/Crimson_Text/CrimsonText-BoldItalic.ttf' } },
        { name: 'JetBrainsMono', paths: { normal: '/fonts/JetBrains_Mono/static/JetBrainsMono-Regular.ttf', bold: '/fonts/JetBrains_Mono/static/JetBrainsMono-Bold.ttf', italics: '/fonts/JetBrains_Mono/static/JetBrainsMono-Italic.ttf', bolditalics: '/fonts/JetBrains_Mono/static/JetBrainsMono-BoldItalic.ttf' } },
        { name: 'Poppins', paths: { normal: '/fonts/Poppins/Poppins-Regular.ttf', bold: '/fonts/Poppins/Poppins-Bold.ttf', italics: '/fonts/Poppins/Poppins-Italic.ttf', bolditalics: '/fonts/Poppins/Poppins-BoldItalic.ttf' } },
        { name: 'PlayfairDisplay', paths: { normal: '/fonts/Playfair_Display/static/PlayfairDisplay-Regular.ttf', bold: '/fonts/Playfair_Display/static/PlayfairDisplay-Bold.ttf', italics: '/fonts/Playfair_Display/static/PlayfairDisplay-Italic.ttf', bolditalics: '/fonts/Playfair_Display/static/PlayfairDisplay-BoldItalic.ttf' } },
        { name: 'Montserrat', paths: { normal: '/fonts/Montserrat/static/Montserrat-Regular.ttf', bold: '/fonts/Montserrat/static/Montserrat-Bold.ttf', italics: '/fonts/Montserrat/static/Montserrat-Italic.ttf', bolditalics: '/fonts/Montserrat/static/Montserrat-BoldItalic.ttf' } },
        { name: 'NunitoSans', paths: { normal: '/fonts/Nunito_Sans/NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf', bold: '/fonts/Nunito_Sans/NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf', italics: '/fonts/Nunito_Sans/NunitoSans-Italic-VariableFont_YTLC,opsz,wdth,wght.ttf', bolditalics: '/fonts/Nunito_Sans/NunitoSans-Italic-VariableFont_YTLC,opsz,wdth,wght.ttf' } },
        { name: 'LibertinusSerif', paths: { normal: '/fonts/Libertinus_Serif/LibertinusSerif-Regular.ttf', bold: '/fonts/Libertinus_Serif/LibertinusSerif-Bold.ttf', italics: '/fonts/Libertinus_Serif/LibertinusSerif-Italic.ttf', bolditalics: '/fonts/Libertinus_Serif/LibertinusSerif-BoldItalic.ttf' } }
      ]
      
      // Get loaded font data from FontLoader
      const loadedFontData = FontLoader.getFonts()
      
      // Process each custom font configuration
      for (const config of customFontConfigs) {
        const fontData = loadedFontData[config.name]
        if (fontData) {
          // Create clean font definition with VFS filenames
          const fontDefinition: any = {}
          
          for (const [variant, path] of Object.entries(config.paths)) {
            const base64Data = (fontData as any)[variant]
            
            if (typeof base64Data === 'string' && base64Data.startsWith('data:')) {
              // Extract base64 content
              const base64Content = base64Data.split(',')[1]
              if (base64Content) {
                // Extract actual filename from path
                const filename = path.split('/').pop() || `${config.name}-${variant}.ttf`
                
                // Add to VFS
                ;(customVfs as any)[filename] = base64Content
                
                // Set font definition to reference VFS filename
                fontDefinition[variant] = filename
              }
            }
          }
          
          // Only add font if we got at least one variant
          if (Object.keys(fontDefinition).length > 0) {
            this.fonts[config.name] = fontDefinition
          }
        }
      }
      
      this.pdfMake.vfs = customVfs
      this.pdfMake.fonts = this.fonts
      
      console.log(`🎨 PDF Service initialized with ${Object.keys(this.fonts).length} font families:`, Object.keys(this.fonts))
      
    } catch (error) {
      throw new Error('PDFService initialization failed')
    }
  }

  /**
   * Register a PDF template
   */
  registerTemplate(template: PDFTemplate): void {
    this.templates.set(template.id, template)
  }

  /**
   * Get available templates
   */
  getTemplates(): PDFTemplate[] {
    const templates = Array.from(this.templates.values())
    return templates
  }

  /**
   * Generate PDF from resume data
   */
  async generatePDF(
    data: ResumeData, 
    options: PDFGenerationOptions
  ): Promise<void> {
    await this.initialize()

    let template: PDFTemplate

    // Use dynamic template if cssData is provided
    if (options.templateData?.cssData) {
      template = new DynamicPDFTemplate(options.templateData.cssData, options.fontConfig)
    } else {
      // Fallback to hardcoded templates
      const foundTemplate = this.templates.get(options.template)
      if (!foundTemplate) {
        throw new Error(`Template '${options.template}' not found`)
      }
      template = foundTemplate
      
      if (!template) {
        const availableList = Array.from(this.templates.keys()).join(', ')
        throw new Error(`Template '${options.template}' not found. Available: ${availableList}`)
      }
    }

    try {
      // Generate document definition
      const docDefinition = template.generate(data, options)
      
      if (!docDefinition || !docDefinition.content) {
        throw new Error(`Template ${template.name} generated invalid document definition`)
      }
      
      // Add default configuration
      const finalDocDefinition: TDocumentDefinitions = {
        ...docDefinition,
        pageSize: options.pageSize || 'LETTER',
        pageMargins: options.margins || [0, 0, 0, 0],
        info: {
          title: data.title || 'Resume',
          author: data.personalInfo?.fullName || 'Resume Builder',
          subject: 'Professional Resume',
          creator: 'Profyle App',
          creationDate: new Date()
        },
        defaultStyle: {
          fontSize: 11,
          lineHeight: 1.3,
          ...docDefinition.defaultStyle
        }
      }

      // Generate and download PDF
      const pdfDocGenerator = this.pdfMake.createPdf(finalDocDefinition, null, this.fonts, this.pdfMake.vfs)
      const filename = options.filename || this.generateFilename(data.personalInfo?.fullName)
      
      pdfDocGenerator.download(filename)
      
    } catch (error) {
      throw new Error('Failed to generate PDF')
    }
  }

  /**
   * Generate PDF blob for preview or further processing
   */
  async generatePDFBlob(
    data: ResumeData, 
    options: PDFGenerationOptions
  ): Promise<Blob> {
    await this.initialize()

    let template: PDFTemplate

    // Use dynamic template if cssData is provided
    if (options.templateData?.cssData) {
      template = new DynamicPDFTemplate(options.templateData.cssData, options.fontConfig)
    } else {
      const foundTemplate = this.templates.get(options.template)
      if (!foundTemplate) {
        throw new Error(`Template '${options.template}' not found`)
      }
      template = foundTemplate
    }

    return new Promise((resolve, reject) => {
      try {
        const docDefinition = template.generate(data, options)
        const finalDocDefinition: TDocumentDefinitions = {
          ...docDefinition,
          pageSize: options.pageSize || 'LETTER',
          pageMargins: options.margins || [0, 0, 0, 0]
        }

        // Pass fonts and VFS explicitly to createPdf
        const pdfDocGenerator = this.pdfMake.createPdf(finalDocDefinition, null, this.fonts, this.pdfMake.vfs)
        pdfDocGenerator.getBlob((blob: Blob) => {
          resolve(blob)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Generate safe filename
   */
  private generateFilename(name?: string): string {
    const baseName = name || 'resume'
    const cleanName = baseName
      .replace(/[^a-zA-Z0-9\-_\s]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
    return `${cleanName}.pdf`
  }

  /**
   * Add custom fonts (to be implemented in font management)
   */
  addFonts(fontDictionary: TFontDictionary): void {
    this.fonts = { ...this.fonts, ...fontDictionary }
    if (this.pdfMake) {
      this.pdfMake.fonts = this.fonts
    }
  }
}

// Export singleton instance
export const pdfService = PDFService.getInstance()
