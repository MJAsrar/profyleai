/**
 * Dynamic PDF Template - Uses database cssData like web renderer
 */

import type { Content, Style, TDocumentDefinitions } from 'pdfmake/interfaces'
import type { ResumeData } from '@/lib/resume-store'
import type { TemplateCSSData } from '@/lib/css-engine'
import { CSSEngine, createCSSEngine } from '@/lib/css-engine'
import { FontSizeConfig, DEFAULT_FONT_SIZES, fontSizeToPDF } from '@/lib/font-config'
import { FontLoader } from '../font-loader'

export class DynamicPDFTemplate {
  id = 'dynamic'
  name = 'Dynamic Template'
  private cssData: TemplateCSSData
  private cssEngine: CSSEngine
  private fontConfig: FontSizeConfig
  
  constructor(cssData: TemplateCSSData, fontConfig?: FontSizeConfig) {
    this.cssData = cssData
    this.fontConfig = fontConfig || DEFAULT_FONT_SIZES
    console.log('🏗️ DynamicPDFTemplate constructor called with cssData:', cssData)
    
    // Validate and normalize cssData
    this.cssData = this.validateCSSData(cssData)
    
    // Create CSS engine to use same calculations as web renderer
    this.cssEngine = createCSSEngine(this.cssData, this.fontConfig)
  }

  /**
   * Validate and ensure CSS data has required properties
   */
  private validateCSSData(cssData: any): TemplateCSSData {
    if (!cssData) {
      console.warn('No CSS data provided to DynamicPDFTemplate, using defaults')
      return this.getDefaultCSSData()
    }

    // Ensure all required sections exist
    return {
      layout: cssData.layout || {
        type: 'single-column',
        pageSize: 'letter',
        margins: '0rem', // Zero margins
        spacing: '0rem' // Zero spacing
      },
      typography: cssData.typography || {
        primaryFont: 'Arial, sans-serif',
        baseFontSize: '8pt', // Further reduced from 9pt
        headingScale: 1.3,
        lineHeight: 1.0 // Zero line spacing
      },
      colors: cssData.colors || {
        primary: '#1f2937',
        secondary: '#4f46e5',
        accent: '#059669',
        text: '#1f2937',
        background: '#ffffff',
        border: '#e5e7eb'
      },
      sections: cssData.sections || {
        header: { marginBottom: '1.5rem' }, // Add line spacing after header
        section: { marginBottom: '0.75rem' }, // Increased section margin for better separation
        sectionTitle: { fontWeight: '700', marginBottom: '0.125rem' } // Doubled title margin
      },
      elements: cssData.elements || {
        name: { fontSize: '20pt', fontWeight: '700', marginBottom: '0rem', marginTop: '0rem', lineHeight: 1 }, // NO gap between name and contact
        contact: { fontSize: '8pt', marginTop: '0rem', paddingTop: '0rem' }, // Reduced from 10pt
        jobTitle: { fontSize: '10pt', fontWeight: '600' }, // Reduced from 12pt
        company: { fontSize: '9pt', fontWeight: '500' }, // Reduced from 11pt
        dates: { fontSize: '8pt' }, // Reduced from 10pt
        bulletPoints: { fontSize: '8pt', lineHeight: 1.0 } // Ultra-compact
      }
    }
  }

  /**
   * Get default CSS data for fallback
   */
  private getDefaultCSSData(): TemplateCSSData {
    return {
      layout: {
        type: 'single-column',
        pageSize: 'letter',
        margins: '0rem', // Zero margins
        spacing: '0rem' // Zero spacing
      },
      typography: {
        primaryFont: 'Arial, sans-serif',
        baseFontSize: '8pt', // Further reduced from 9pt
        headingScale: 1.3,
        lineHeight: 1.0 // Zero line spacing
      },
      colors: {
        primary: '#1f2937',
        secondary: '#4f46e5',
        accent: '#059669',
        text: '#1f2937',
        background: '#ffffff',
        border: '#e5e7eb'
      },
      sections: {
        header: { marginBottom: '0rem', paddingBottom: '0rem' }, // No spacing after header
        section: { marginBottom: '0.75rem' }, // Increased section spacing for better separation
        sectionTitle: { fontWeight: '700', marginBottom: '0.125rem' } // Doubled title spacing
      },
      elements: {
        name: { fontSize: '20pt', fontWeight: '700', marginBottom: '0rem', marginTop: '0rem', lineHeight: 1 }, // NO gap between name and contact
        contact: { fontSize: '8pt', marginTop: '0rem', paddingTop: '0rem' }, // Reduced from 10pt
        jobTitle: { fontSize: '10pt', fontWeight: '600' }, // Reduced from 12pt
        company: { fontSize: '9pt', fontWeight: '500' }, // Reduced from 11pt
        dates: { fontSize: '8pt' }, // Reduced from 10pt
        bulletPoints: { fontSize: '8pt', lineHeight: 1.0 } // Ultra-compact
      }
    }
  }

  /**
   * Generate PDF document definition from resume data and CSS data
   */
  generate(data: ResumeData, options?: any): TDocumentDefinitions {

    
    try {
      const content: Content[] = []
      
      // Build document sections with debugging and error isolation
      try {
        content.push(this.buildHeader(data))
      } catch (error) {

        throw new Error(`Header generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      
      if (data.summary && data.summary.trim().length > 0) {
        try {
          content.push(this.buildSummary(data.summary))
        } catch (error) {
          throw new Error(`Summary generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      
      if (data.experience && Array.isArray(data.experience) && data.experience.length > 0) {
        try {
          content.push(this.buildExperience(data.experience))
        } catch (error) {

          throw new Error(`Experience generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      
      if (data.education && Array.isArray(data.education) && data.education.length > 0) {
        try {
          content.push(this.buildEducation(data.education))
        } catch (error) {

          throw new Error(`Education generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      
      if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
        try {
          content.push(this.buildSkills(data.skills))
        } catch (error) {

          throw new Error(`Skills generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      
      if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
        try {
          content.push(this.buildProjects(data.projects))
        } catch (error) {

          throw new Error(`Projects generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      
      if (data.certifications && Array.isArray(data.certifications) && data.certifications.length > 0) {
        try {
          content.push(this.buildCertifications(data.certifications))
        } catch (error) {
          console.error('Certifications generation error:', error)
          throw new Error(`Certifications generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      return {
        content,
        styles: this.getDocumentStyles(),
        defaultStyle: {
          fontSize: Math.max(this.convertCSSSize(this.cssData.typography.baseFontSize) || 8, 6), // Using smaller base font
          font: this.getFontName(this.cssData.typography.primaryFont),
          color: this.cssData.colors.text || '#000000',
          lineHeight: (() => {
            const lineHeight = this.cssData.typography.lineHeight
            if (typeof lineHeight === 'number' && !isNaN(lineHeight) && lineHeight > 0) {
              return lineHeight
            }
            return 1.3 // Reduced fallback for tighter spacing
          })()
        }
      }
    } catch (error) {

      throw new Error(`Dynamic PDF template generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Build header section
   */
  private buildHeader(data: ResumeData): Content {
    const personalInfo = data.personalInfo || {}
    
    const headerContent: Content[] = [
      {
        text: personalInfo.fullName || 'Your Name',
        style: 'name'
      }
    ]

    // Add professional title if available
    if (personalInfo.professionalTitle) {
      headerContent.push({
        text: personalInfo.professionalTitle,
        style: 'title'
      })
    }

    // Add basic contact information
    const basicContactItems = []
    if (personalInfo.email) basicContactItems.push(personalInfo.email)
    if (personalInfo.phone) basicContactItems.push(personalInfo.phone)
    if (personalInfo.location) basicContactItems.push(personalInfo.location)

    if (basicContactItems.length > 0) {
      headerContent.push({
        text: basicContactItems.join(' • '),
        style: 'contact',
        margin: [0, 0, 0, 0]
      })
    }

    // Add websites on separate line
    const websiteItems = []
    if (personalInfo.website) websiteItems.push(personalInfo.website)
    if (personalInfo.linkedin) websiteItems.push(personalInfo.linkedin)
    if (personalInfo.github) websiteItems.push(personalInfo.github)
    if (personalInfo.portfolio) websiteItems.push(personalInfo.portfolio)

    if (websiteItems.length > 0) {
      headerContent.push({
        text: websiteItems.join(' • '),
        style: 'contact',
        margin: [0, 0, 0, 0]
      })
    }

    return {
      stack: [
        ...headerContent,
        // Removed header line for minimal design
      ],
      style: 'header'
    }
  }

  /**
   * Build summary section with justified alignment
   */
  private buildSummary(summary: string): Content {
    return this.createSectionWithBorder([
      { text: this.formatSectionTitle('Professional Summary'), style: 'sectionTitle' },
      this.createSectionLine(),  // Add horizontal line like other sections
      { text: summary, style: 'summaryText' } // Use justified alignment style
    ])
  }

  /**
   * Build experience section
   */
  private buildExperience(experience: any[]): Content {
    // Zero spacing for all elements
    const utilities = this.cssEngine.getUtilityStyles()
    const itemMargin = 0 // Zero item spacing between experience entries
    const descriptionMargin = 0 // Zero description margin
    const columnGap = 0 // Zero column gap
    const bulletMargin = 0 // Zero bullet spacing
    

    
    const experienceItems = experience.map(exp => {
      // Use description as-is, preserving user formatting
      const hasDescription = exp.description && exp.description.trim().length > 0

      return {
      stack: [
          // Match web renderer's flexBetween utility exactly
          {
            columns: [
              { text: exp.position || exp.title || 'Position', style: 'jobTitle', width: '*' },
              { text: this.formatDateRange(exp.startDate, exp.endDate, exp.isCurrent), style: 'dates', width: 'auto', alignment: 'right' }
            ],
            columnGap
          },
        { text: exp.company || 'Company', style: 'company' },
          hasDescription ? {
            text: exp.description,
            style: 'bodyText',
            margin: [0, descriptionMargin, 0, 0] as [number, number, number, number]
        } : null
      ].filter(Boolean),
        margin: [0, 0, 0, itemMargin] as [number, number, number, number]
      }
    })

    return this.createSectionWithBorder([
      { text: this.formatSectionTitle('Professional Experience'), style: 'sectionTitle' },
      this.createSectionLine(),  // Add horizontal line like web renderer
      ...experienceItems
    ], true) // unbreakable
  }

  /**
   * Build education section
   */
  private buildEducation(education: any[]): Content {
    // Zero spacing for all elements
    const itemMargin = 0 // Zero item spacing
    const gpaMargin = 0 // Zero GPA margin
    const columnGap = 0 // Zero column gap
    
    const educationItems = education.map(edu => ({
      stack: [
        // Match web renderer: degree + field, then dates on same line (flexBetween)
        {
          columns: [
            { 
              text: `${edu.degree || 'Degree'}${edu.field ? ` in ${edu.field}` : ''}`, 
              style: 'jobTitle', 
              width: '*' 
            },
            { 
              text: this.formatDateRange(edu.startDate, edu.endDate), 
              style: 'dates', 
              width: 'auto', 
              alignment: 'right' 
            }
          ],
          columnGap
        },
        // Institution and GPA on same line, no gap above
        {
          columns: [
            { 
              text: edu.institution || 'Institution', 
              style: 'company', 
              width: '*' 
            },
            edu.gpa ? { 
              text: `GPA: ${edu.gpa}`, 
              style: 'dates', 
              width: 'auto', 
              alignment: 'right' 
            } : { text: '', width: 'auto' }
          ],
          columnGap,
          margin: [0, 0, 0, 0] as [number, number, number, number] // No margin above this line
        }
      ],
      margin: [0, 0, 0, itemMargin] as [number, number, number, number]
    }))

    return this.createSectionWithBorder([
      { text: this.formatSectionTitle('Education'), style: 'sectionTitle' },
      this.createSectionLine(),  // Add horizontal line like web renderer
      ...educationItems
    ], true) // unbreakable
  }

  /**
   * Build skills section with categories on separate lines
   */
  private buildSkills(skills: any[]): Content {
    if (!skills || skills.length === 0) {
      return {
        stack: [
          { text: 'Skills', style: 'sectionTitle' },
          this.createSectionLine(),
          { text: 'No skills specified', style: 'bodyText' }
        ],
        style: 'section',
        unbreakable: true
      }
    }
    
    const skillCategories = skills.map((skillCategory, index) => {
      if (typeof skillCategory === 'string') {
        return { text: skillCategory, style: 'bodyText', margin: [0, 0, 0, 3] }
      }
      
      // Check for the correct structure based on validation schema
      if (skillCategory && skillCategory.category) {
        // Handle both 'skills' and 'items' field names for backward compatibility
        const skillsArray = skillCategory.skills || skillCategory.items || []
        
        if (Array.isArray(skillsArray) && skillsArray.length > 0) {
          const skillNames = skillsArray.map(skill => {
            if (typeof skill === 'string') return skill
            if (skill && skill.name) return skill.name
            return 'Unknown'
          }).join(', ')
          
          return {
            text: [
              { text: `${skillCategory.category}: `, style: 'skillCategoryName' },
              { text: skillNames, style: 'skillList' }
            ],
            margin: [0, 0, 0, 3]
          }
        } else {
          return {
            text: [
              { text: `${skillCategory.category}: `, style: 'skillCategoryName' },
              { text: 'No skills specified', style: 'skillList' }
            ],
            margin: [0, 0, 0, 3]
          }
        }
      }
      
      return null
    }).filter(Boolean)

    return this.createSectionWithBorder([
      { text: this.formatSectionTitle('Skills'), style: 'sectionTitle' },
      this.createSectionLine(),  // Add horizontal line like web renderer
      ...skillCategories
    ], true) // unbreakable
  }

  /**
   * Build projects section
   */
  private buildProjects(projects: any[]): Content {
    // Zero spacing for all elements
    const itemMargin = 0 // Zero item spacing
    const descriptionMargin = 0 // Zero description margin
    
    const projectItems = projects.map(project => ({
      stack: [
        { text: project.name || 'Project Name', style: 'jobTitle', bold: true },
                (project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0) ? {
          text: `Technologies: ${project.technologies.join(', ')}`, 
          style: 'dates' 
        } : null,
        project.description ? { 
          text: project.description, 
          style: 'bodyText', 
          margin: [0, descriptionMargin, 0, 0] as [number, number, number, number]
        } : null
      ].filter(Boolean),
      margin: [0, 0, 0, itemMargin] as [number, number, number, number]
    }))

    return this.createSectionWithBorder([
      { text: this.formatSectionTitle('Projects'), style: 'sectionTitle' },
      this.createSectionLine(),  // Add horizontal line like web renderer
      ...projectItems
    ], true) // unbreakable
  }

  /**
   * Build certifications section
   */
  private buildCertifications(certifications: any[]): Content {
    // Zero spacing for all elements
    const itemMargin = 0 // Zero certification item spacing
    const detailMargin = 0 // Zero detail margin
    
    const certificationItems = certifications.map(cert => {
      const issueDate = this.formatDate(cert.issueDate)
      const expiryText = cert.isLifetime 
        ? 'Lifetime' 
        : cert.expiryDate 
          ? `Expires ${this.formatDate(cert.expiryDate)}`
          : 'No Expiry'
      
      const certContent: Content[] = [
        // Certification name and issue date
        {
          columns: [
            { text: cert.name || 'Certification', style: 'jobTitle', width: '*' },
            { text: issueDate, style: 'dates', width: 'auto', alignment: 'right' }
          ]
        },
        // Issued by and expiry
        {
          columns: [
            { text: cert.issuedBy || 'Issuing Organization', style: 'company', width: '*' },
            { text: expiryText, style: 'dates', width: 'auto', alignment: 'right' }
          ],
          margin: [0, detailMargin, 0, 0] as [number, number, number, number]
        }
      ]

      // Add credential ID if present
      if (cert.credentialId) {
        certContent.push({
          text: `Credential ID: ${cert.credentialId}`,
          style: 'dates',
          margin: [0, detailMargin, 0, 0] as [number, number, number, number]
        })
      }

      // Add verification URL if present
      if (cert.verificationUrl) {
        certContent.push({
          text: `Verify: ${cert.verificationUrl}`,
          style: 'dates',
          color: this.cssData.colors.primary || '#0066cc',
          margin: [0, detailMargin, 0, 0] as [number, number, number, number]
        })
      }

      // Add description if present
      if (cert.description) {
        certContent.push({
          text: cert.description,
          style: 'bodyText',
          margin: [0, detailMargin, 0, 0] as [number, number, number, number]
        })
      }

      return {
        stack: certContent,
        margin: [0, 0, 0, itemMargin] as [number, number, number, number]
      }
    })

    return this.createSectionWithBorder([
      { text: this.formatSectionTitle('Certifications'), style: 'sectionTitle' },
      this.createSectionLine(),  // Add horizontal line like web renderer
      ...certificationItems
    ], true) // unbreakable
  }

  /**
   * Format section title with proper text transformation
   * Applies uppercase if textTransform: 'uppercase' is set in CSS
   */
  private formatSectionTitle(title: string): string {
    try {
      // Get section title styles from CSS engine
      const sectionTitleStyles = this.cssEngine.getSectionTitleStyles()
      
      // Check if textTransform is uppercase
      if (sectionTitleStyles.textTransform === 'uppercase') {
        console.log('📝 Applying uppercase transformation to section title:', title)
        return title.toUpperCase()
      }
      
      return title
    } catch (error) {
      console.warn('Section title formatting failed, using original:', error)
      return title
    }
  }

  /**
   * Create a section with border support using table structure
   * PDFMake borders work better on table cells than on stack elements
   */
  private createSectionWithBorder(content: Content[], unbreakable?: boolean): Content {
    // Get the section styles from CSS engine
    const sectionStyles = this.cssEngine.getSectionStyles()
    const convertedStyles = this.convertCSSStyleToPDF(sectionStyles)
    
    // Log the converted styles for debugging
    console.log('🎨 Creating section with border - converted styles:', convertedStyles)
    
    // If we have border styles, create a table structure
    if (convertedStyles.border && convertedStyles.border.some((b: number) => b > 0)) {
      console.log('📐 Creating table structure for borders:', convertedStyles.border)
      
      return {
        table: {
          headerRows: 0,
          widths: ['*'],
          body: [
            [{
              stack: content,
              border: convertedStyles.border,
              borderColor: convertedStyles.borderColor,
              margin: [
                12, // left padding (1rem converted to pts, from paddingLeft: '1rem')
                4,  // top padding 
                4,  // right padding
                4   // bottom padding
              ]
            }]
          ]
        },
        layout: {
          defaultBorder: false, // We define borders explicitly
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0
        },
        margin: [0, 0, 0, 12], // Section spacing
        ...(unbreakable && { unbreakable: true })
      }
    } else {
      // No borders - use original stack structure
      console.log('📝 No borders detected, using stack structure')
      return {
        stack: content,
        style: 'section',
        ...(unbreakable && { unbreakable: true })
      }
    }
  }

  /**
   * Helper method to format dates (YYYY-MM format)
   */
  private formatDate(dateStr?: string): string {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr + '-01') // Add day for YYYY-MM format
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  /**
   * Generate document styles from CSS data using CSS engine (matches web renderer exactly)
   */
  private getDocumentStyles(): { [name: string]: Style } {
    // Use CSS engine to get exact same styles as web renderer
    const headerStyles = this.cssEngine.getHeaderStyles()
    const sectionStyles = this.cssEngine.getSectionStyles()
    const sectionTitleStyles = this.cssEngine.getSectionTitleStyles()
    const utilities = this.cssEngine.getUtilityStyles()

    // Debug: Log the section styles we're getting from CSS engine
    console.log('🔍 Section styles from CSS engine:', sectionStyles)

    return {
      header: {
        margin: [0, 0, 0, 8] as [number, number, number, number], // Add line spacing after header
        alignment: this.convertAlignment(headerStyles.textAlign?.toString())
      },
      name: {
        ...this.convertElementStyle('name'),
        fontSize: fontSizeToPDF(this.fontConfig.name)
      },
      title: {
        ...this.convertElementStyle('title'),
        fontSize: fontSizeToPDF(this.fontConfig.jobTitle),
        margin: [0, 2, 0, 0] as [number, number, number, number]
      },
      contact: {
        ...this.convertElementStyle('contact'),
        fontSize: fontSizeToPDF(this.fontConfig.contact)
      },
      section: {
        ...this.convertCSSStyleToPDF(sectionStyles), // Apply CSS section styles (including borders)
        margin: [0, 0, 0, 12] as [number, number, number, number], // Increased section gap for better readability
        // Debug: Log what CSS styles we're getting
        // Note: This style will be applied to section containers
      },
      sectionTitle: {
        ...this.convertCSSStyleToPDF(sectionTitleStyles),
        fontSize: fontSizeToPDF(this.fontConfig.sectionHeaders),
        margin: [0, 0, 0, 2] as [number, number, number, number] // Doubled spacing between title and content
      },
      jobTitle: {
        ...this.convertElementStyle('jobTitle'),
        fontSize: fontSizeToPDF(this.fontConfig.jobTitle)
      },
      company: {
        ...this.convertElementStyle('company'),
        fontSize: fontSizeToPDF(this.fontConfig.company)
      },
      dates: {
        ...this.convertElementStyle('dates'),
        fontSize: fontSizeToPDF(this.fontConfig.dates)
      },
      bodyText: {
        fontSize: fontSizeToPDF(this.fontConfig.content),
        lineHeight: (() => {
          const lineHeight = this.cssData.typography.lineHeight
          if (typeof lineHeight === 'number' && !isNaN(lineHeight) && lineHeight > 0) {
            return lineHeight
          }
          return 1.3 // Reduced fallback for tighter spacing
        })(),
        color: this.getColorFromCSS(this.cssData.colors.text)
      },
      summaryText: {
        fontSize: fontSizeToPDF(this.fontConfig.summary),
        lineHeight: 1.3, // Comfortable reading line height to match web renderer
        color: this.getColorFromCSS(this.cssData.colors.text),
        alignment: 'justify' // Justified alignment for summary
      },
      bulletPoints: this.convertElementStyle('bulletPoints'),
      // Skills styles
      skillCategoryName: {
        fontSize: fontSizeToPDF(this.fontConfig.skillCategory),
        bold: true,
        color: this.getColorFromCSS(this.cssData.colors.text)
      },
      skillList: {
        fontSize: fontSizeToPDF(this.fontConfig.skillItems),
        color: this.getColorFromCSS(this.cssData.colors.text)
      },
      // Project styles
      projectTitle: {
        fontSize: fontSizeToPDF(this.fontConfig.jobTitle),
        bold: true,
        color: this.getColorFromCSS(this.cssData.colors.secondary)
      },
      projectDescription: {
        fontSize: fontSizeToPDF(this.fontConfig.content),
        color: this.getColorFromCSS(this.cssData.colors.text),
        lineHeight: 1.3
      },
      projectLink: {
        fontSize: fontSizeToPDF(this.fontConfig.jobTitle),
        color: this.getColorFromCSS(this.cssData.colors.secondary)
      },
      // Certification styles
      certificationName: {
        fontSize: fontSizeToPDF(this.fontConfig.jobTitle),
        bold: true,
        color: this.getColorFromCSS(this.cssData.colors.text)
      },
      certificationDetails: {
        fontSize: fontSizeToPDF(this.fontConfig.content),
        color: this.getColorFromCSS(this.cssData.colors.text)
      },
      certificationIssuer: {
        fontSize: fontSizeToPDF(this.fontConfig.company),
        color: this.getColorFromCSS(this.cssData.colors.secondary),
        italics: true
      },
      certificationDate: {
        fontSize: fontSizeToPDF(this.fontConfig.jobTitle),
        color: this.getColorFromCSS(this.cssData.colors.text)
      }
    }
  }

  /**
   * Convert CSS element styles to PDFMake styles
   */
  private convertElementStyle(elementKey: keyof TemplateCSSData['elements']): Style {
    const elementStyles = this.cssEngine.getElementStyles(elementKey)
    return this.convertCSSStyleToPDF(elementStyles)
  }



  /**
   * Convert CSS style object to PDFMake style with NaN protection
   */
  private convertCSSStyleToPDF(cssStyle: any): Style {
    const pdfStyle: Style = {}

    try {
      // Font size
      if (cssStyle.fontSize) {
        const fontSize = this.convertCSSSize(cssStyle.fontSize.toString())
        if (!isNaN(fontSize) && fontSize > 0) {
          pdfStyle.fontSize = fontSize
        }
      }

      // Font weight
      if (cssStyle.fontWeight) {
        const weight = cssStyle.fontWeight.toString()
        const weightNum = parseInt(weight)
        pdfStyle.bold = weight.includes('bold') || (!isNaN(weightNum) && weightNum >= 600)
      }

      // Color
      if (cssStyle.color) {
        pdfStyle.color = this.getColorFromCSS(cssStyle.color.toString())
      }

      // Font family
      if (cssStyle.fontFamily) {
        pdfStyle.font = this.getFontName(cssStyle.fontFamily.toString())
      }

      // Text alignment
      if (cssStyle.textAlign) {
        pdfStyle.alignment = this.convertAlignment(cssStyle.textAlign.toString())
      }

      // Font style
      if (cssStyle.fontStyle === 'italic') {
        pdfStyle.italics = true
      }

      // Text transform
      if (cssStyle.textTransform) {
        pdfStyle.textTransform = cssStyle.textTransform.toString()
      }

      // Line height with NaN protection
      if (cssStyle.lineHeight) {
        const lineHeight = cssStyle.lineHeight
        let parsedLineHeight: number
        
        if (typeof lineHeight === 'number') {
          parsedLineHeight = lineHeight
        } else {
          parsedLineHeight = parseFloat(lineHeight.toString())
        }
        
        // Only set if valid number, otherwise use default
        if (!isNaN(parsedLineHeight) && parsedLineHeight > 0) {
          pdfStyle.lineHeight = parsedLineHeight
        } else {
          pdfStyle.lineHeight = 1.5 // Fallback
        }
      }

      // Margins (convert from CSS margin properties) with NaN protection
      if (cssStyle.marginBottom || cssStyle.marginTop || cssStyle.margin) {
        const marginBottom = this.convertCSSSize(cssStyle.marginBottom?.toString())
        const marginTop = this.convertCSSSize(cssStyle.marginTop?.toString())
        
        // Ensure margins are valid numbers
        const safeMarginTop = isNaN(marginTop) ? 0 : marginTop
        const safeMarginBottom = isNaN(marginBottom) ? 0 : marginBottom
        
        pdfStyle.margin = [0, safeMarginTop, 0, safeMarginBottom] as [number, number, number, number]
      }

      // Border support (NEW FEATURE)
      this.addBorderStyles(cssStyle, pdfStyle)

      // Padding support (for border spacing)
      this.addPaddingStyles(cssStyle, pdfStyle)

    } catch (error) {
      console.warn('CSS to PDF style conversion failed:', cssStyle, error)
    }

    return pdfStyle
  }

  private convertAlignment(textAlign: string | undefined): 'left' | 'center' | 'right' | 'justify' {
    switch (textAlign) {
      case 'center': return 'center'
      case 'right': return 'right'
      case 'justify': return 'justify'
      default: return 'left'
    }
  }

  /**
   * Add border styles to PDFMake style object
   * Handles borderLeft, borderRight, borderTop, borderBottom CSS properties
   */
  private addBorderStyles(cssStyle: any, pdfStyle: any): void {
    try {
      const borders = [0, 0, 0, 0] // [left, top, right, bottom]
      const borderColors = [null, null, null, null] // [left, top, right, bottom]
      let hasBorders = false

      // Parse borderLeft (e.g., "2px solid #022c22")
      if (cssStyle.borderLeft) {
        const match = cssStyle.borderLeft.toString().match(/(\d+(?:\.\d+)?)px\s+solid\s+(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|\w+)/)
        if (match) {
          borders[0] = parseFloat(match[1]) // left border width
          borderColors[0] = this.getColorFromCSS(match[2]) // left border color
          hasBorders = true
        }
      }

      // Parse borderTop
      if (cssStyle.borderTop) {
        const match = cssStyle.borderTop.toString().match(/(\d+(?:\.\d+)?)px\s+solid\s+(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|\w+)/)
        if (match) {
          borders[1] = parseFloat(match[1]) // top border width
          borderColors[1] = this.getColorFromCSS(match[2]) // top border color
          hasBorders = true
        }
      }

      // Parse borderRight
      if (cssStyle.borderRight) {
        const match = cssStyle.borderRight.toString().match(/(\d+(?:\.\d+)?)px\s+solid\s+(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|\w+)/)
        if (match) {
          borders[2] = parseFloat(match[1]) // right border width
          borderColors[2] = this.getColorFromCSS(match[2]) // right border color
          hasBorders = true
        }
      }

      // Parse borderBottom
      if (cssStyle.borderBottom) {
        const match = cssStyle.borderBottom.toString().match(/(\d+(?:\.\d+)?)px\s+solid\s+(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|\w+)/)
        if (match) {
          borders[3] = parseFloat(match[1]) // bottom border width
          borderColors[3] = this.getColorFromCSS(match[2]) // bottom border color
          hasBorders = true
        }
      }

      // Apply borders to PDFMake style if any borders were found
      if (hasBorders) {
        pdfStyle.border = borders
        pdfStyle.borderColor = borderColors

        // Log successful border parsing for debugging
        console.log('🎨 Border styles applied:', {
          borders,
          borderColors,
          originalCSS: {
            borderLeft: cssStyle.borderLeft,
            borderTop: cssStyle.borderTop,
            borderRight: cssStyle.borderRight,
            borderBottom: cssStyle.borderBottom
          }
        })
      }

    } catch (error) {
      console.warn('Border style parsing failed:', error, cssStyle)
    }
  }

  /**
   * Add padding styles to PDFMake style object
   * Handles paddingLeft, paddingRight, paddingTop, paddingBottom CSS properties
   */
  private addPaddingStyles(cssStyle: any, pdfStyle: any): void {
    try {
      let hasPadding = false
      const paddings = [0, 0, 0, 0] // [left, top, right, bottom]

      // Parse paddingLeft (e.g., "1rem", "16px")
      if (cssStyle.paddingLeft) {
        const padding = this.convertCSSSize(cssStyle.paddingLeft.toString())
        if (!isNaN(padding) && padding >= 0) {
          paddings[0] = padding
          hasPadding = true
        }
      }

      // Parse paddingTop
      if (cssStyle.paddingTop) {
        const padding = this.convertCSSSize(cssStyle.paddingTop.toString())
        if (!isNaN(padding) && padding >= 0) {
          paddings[1] = padding
          hasPadding = true
        }
      }

      // Parse paddingRight
      if (cssStyle.paddingRight) {
        const padding = this.convertCSSSize(cssStyle.paddingRight.toString())
        if (!isNaN(padding) && padding >= 0) {
          paddings[2] = padding
          hasPadding = true
        }
      }

      // Parse paddingBottom
      if (cssStyle.paddingBottom) {
        const padding = this.convertCSSSize(cssStyle.paddingBottom.toString())
        if (!isNaN(padding) && padding >= 0) {
          paddings[3] = padding
          hasPadding = true
        }
      }

      // Apply padding to existing margin or create new margin with padding
      if (hasPadding) {
        // PDFMake doesn't have separate padding, so we add it to margin
        const existingMargin = pdfStyle.margin || [0, 0, 0, 0]
        
        // Add padding to margin: [left, top, right, bottom]
        pdfStyle.margin = [
          (existingMargin[0] || 0) + paddings[0], // left margin + left padding
          (existingMargin[1] || 0) + paddings[1], // top margin + top padding
          (existingMargin[2] || 0) + paddings[2], // right margin + right padding
          (existingMargin[3] || 0) + paddings[3]  // bottom margin + bottom padding
        ] as [number, number, number, number]

        console.log('📏 Padding styles applied as margin:', {
          originalPadding: {
            paddingLeft: cssStyle.paddingLeft,
            paddingTop: cssStyle.paddingTop,
            paddingRight: cssStyle.paddingRight,
            paddingBottom: cssStyle.paddingBottom
          },
          convertedPadding: paddings,
          finalMargin: pdfStyle.margin
        })
      }

    } catch (error) {
      console.warn('Padding style parsing failed:', error, cssStyle)
    }
  }

  /**
   * Helper methods (keeping minimal ones for backward compatibility)
   */

  private getFontName(font: string | undefined): string {
    if (!font) return 'Helvetica'
    
    // Use FontLoader to map CSS font to PDFMake font
    const mappedFont = FontLoader.mapFontFamily(font)
    
    console.log(`🔤 Font mapping: "${font}" → "${mappedFont}"`)
    
    return mappedFont
  }

  private getAlignment(): 'left' | 'center' | 'right' | 'justify' {
    // Check CSS data for text alignment preferences
    const headerSection = this.cssData.sections?.header as any
    if (headerSection?.textAlign === 'center') return 'center'
    if (headerSection?.textAlign === 'right') return 'right'
    return 'left'
  }

  /**
   * CSS to PDFMake conversion utilities
   */
  private cssToMarginsArray(cssProperty: string | undefined): [number, number, number, number] {
    if (!cssProperty) return [0, 0, 0, 0]
    
    // Convert CSS margin/padding values to PDFMake array
    const value = this.convertCSSSize(cssProperty)
    return [0, 0, 0, value] // [left, top, right, bottom]
  }

  private convertCSSSize(cssSize: string | undefined): number {
    if (!cssSize) return 0
    
    try {
      const sizeStr = cssSize.toString()
      
      // Handle rem units (1rem = 16pt typically)
      if (sizeStr.includes('rem')) {
        const value = parseFloat(sizeStr)
        if (isNaN(value)) return 0
        return value * 16
      }
      
      // Handle pt units
      if (sizeStr.includes('pt')) {
        const value = parseFloat(sizeStr)
        if (isNaN(value)) return 0
        return value
      }
      
      // Handle px units (convert to pt)
      if (sizeStr.includes('px')) {
        const value = parseFloat(sizeStr)
        if (isNaN(value)) return 0
        return value * 0.75
      }
      
      // Handle calc() expressions
      if (sizeStr.includes('calc(')) {
        const match = sizeStr.match(/calc\(([\d.]+)(rem|pt|px)?\s*\*\s*([\d.]+)\)/)
        if (match) {
          const baseValue = parseFloat(match[1])
          const multiplier = parseFloat(match[3])
          if (isNaN(baseValue) || isNaN(multiplier)) return 0
          
          const unit = match[2] || 'rem'
          const result = baseValue * multiplier
          return unit === 'rem' ? result * 16 : result
        }
      }
      
      // Fallback: try to parse as number
      const parsed = parseFloat(sizeStr)
      return isNaN(parsed) ? 0 : parsed
      
    } catch (error) {
      console.warn('CSS size conversion failed:', cssSize, error)
      return 0
    }
  }

  private getColorFromCSS(colorRef: string | undefined): string {
    if (!colorRef) return '#000000'
    
    // Handle CSS variables
    if (colorRef.includes('var(')) {
      const varMatch = colorRef.match(/var\((--[^)]+)\)/)
      if (varMatch) {
        const varName = varMatch[1]
        const cssVars = this.cssEngine.getCSSVariables()
        return (cssVars as any)[varName] || '#000000'
      }
    }
    
    return colorRef
  }

  /**
   * Create horizontal line separator matching web renderer borderBottom exactly
   */
  private createSectionLine(): any {
    try {
      // Get borderBottom utility styles from CSS engine (same as web renderer)
      const utilities = this.cssEngine.getUtilityStyles()
      const borderBottomStyle = utilities.borderBottom
      
      // Extract border properties with safe fallbacks
      const borderColor = this.getColorFromCSS(
        borderBottomStyle.borderBottom?.toString().match(/solid\s+(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|\w+)/)?.[1]
      )
      
      const marginBottom = 0 // Zero line margin
      
      return {
        canvas: [
          {
            type: 'line' as const,
            x1: 0,
            y1: 0,
            x2: 515,  // Full page width
            y2: 0,
            lineWidth: 1,
            lineColor: borderColor || this.cssData.colors.border || this.cssData.colors.primary || '#e5e7eb'
          }
        ],
        margin: [0, 0, 0, marginBottom] as [number, number, number, number]
      }
    } catch (error) {
      console.warn('Section line creation failed, using fallback:', error)
      return {
        canvas: [
          {
            type: 'line' as const,
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 1,
            lineColor: '#e5e7eb'
          }
        ],
        margin: [0, 0, 0, 0] as [number, number, number, number] // Zero fallback line margin
      }
    }
  }

  /**
   * Create bolder header line separator - darker and thicker than section lines
   */
  // Removed createHeaderLine - no horizontal lines needed

  private formatDateRange(startDate?: string, endDate?: string, isCurrent?: boolean): string {
    if (!startDate) return ''
    const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''
    const end = (isCurrent || !endDate) ? 'Present' : new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    return `${start} - ${end}`
  }
}