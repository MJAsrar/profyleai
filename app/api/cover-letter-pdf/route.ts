// TypeScript has complex issues with pdfMake types - using targeted fixes
import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser, createAuthError } from "@/lib/auth-utils"
import { CoverLetterData } from "@/lib/cover-letter-store"
import { z } from "zod"

// Validation schema for the request
const coverLetterPDFSchema = z.object({
  jobDetails: z.object({
    jobTitle: z.string().min(1, "Job title is required"),
    companyName: z.string().min(1, "Company name is required"),
    hiringManager: z.string().optional(),
    jobDescription: z.string().optional(),
  }),
  personalInfo: z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  content: z.object({
    opening: z.string().min(1, "Opening paragraph is required"),
    body: z.string().min(1, "Body content is required"),
    closing: z.string().min(1, "Closing paragraph is required"),
  }),
  tone: z.string()
})

/**
 * POST /api/cover-letter-pdf - Generate and download cover letter PDF
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(req)
    if (!user) {
      return createAuthError()
    }

    // Parse and validate request body
    const body = await req.json()
    const validatedData = coverLetterPDFSchema.parse(body) as CoverLetterData

    console.log(`📄 Generating cover letter PDF for user ${user.id} - ${validatedData.jobDetails.jobTitle} at ${validatedData.jobDetails.companyName}`)

    try {
      // Generate PDF blob using dynamic imports (same pattern as resume PDFs)
      const pdfBlob = await generateCoverLetterPDFBlob(validatedData)

      // Generate filename
      const filename = `${validatedData.personalInfo.fullName.replace(/\s+/g, '_')}_Cover_Letter_${validatedData.jobDetails.companyName.replace(/\s+/g, '_')}.pdf`

      console.log(`✅ Successfully generated cover letter PDF: ${filename}`)

      // Return PDF as response
      return new NextResponse(pdfBlob, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': pdfBlob.byteLength.toString(),
        },
      })

    } catch (templateError) {
      console.error('❌ PDF template generation error:', templateError)
      return NextResponse.json(
        { 
          error: "Failed to generate PDF from template",
          code: "TEMPLATE_ERROR"
        },
        { status: 500 }
      )
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Cover letter PDF validation error:', error.errors)
      return NextResponse.json(
        { 
          error: "Invalid cover letter data", 
          details: error.errors,
          code: "VALIDATION_ERROR" 
        },
        { status: 400 }
      )
    }

    console.error("❌ POST /api/cover-letter-pdf error:", error)
    return NextResponse.json(
      { 
        error: "Internal server error. Please try again.",
        code: "INTERNAL_ERROR"
      },
      { status: 500 }
    )
  }
}

/**
 * Generate PDF blob for cover letter using dynamic imports
 * Following the same pattern as resume PDF generation
 */
async function generateCoverLetterPDFBlob(data: CoverLetterData): Promise<Buffer> {
  try {
    // Dynamic imports to avoid SSR issues
    const pdfMakeModule = await import('pdfmake/build/pdfmake')
    const vfsModule = await import('pdfmake/build/vfs_fonts')
    
    const pdfMake = pdfMakeModule.default
    
    // Start with default VFS
    const customVfs = { ...vfsModule.default }
    
    // Track which font we'll actually use
    let actualFont = 'Roboto' // Default fallback
    
    try {
      // Load Libertinus Serif fonts using HTTP requests (works in all environments)
      const baseUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://www.profyleai.com' // Use production domain for reliable font access
      
      const fontFiles = {
        normal: 'LibertinusSerif-Regular.ttf',
        bold: 'LibertinusSerif-Bold.ttf',
        italics: 'LibertinusSerif-Italic.ttf',
        bolditalics: 'LibertinusSerif-BoldItalic.ttf',
        semibold: 'LibertinusSerif-SemiBold.ttf'
      }
      
      // Load each font file via HTTP and add to VFS
      const loadedFonts: Record<string, string> = {}
      for (const [variant, filename] of Object.entries(fontFiles)) {
        try {
          const fontUrl = `${baseUrl}/fonts/Libertinus_Serif/${filename}`
          console.log(`🔤 Loading font from: ${fontUrl}`)
          
          const response = await fetch(fontUrl)
          if (!response.ok) {
            console.warn(`⚠️ Font file not found: ${fontUrl} (${response.status})`)
            continue
          }
          
          const fontBuffer = await response.arrayBuffer()
          const base64Font = Buffer.from(fontBuffer).toString('base64')
          ;(customVfs as any)[filename] = base64Font
          loadedFonts[variant] = filename
          console.log(`✅ Loaded ${filename} for LibertinusSerif ${variant}`)
        } catch (fetchError) {
          console.warn(`⚠️ Failed to load font ${filename}:`, fetchError)
        }
      }
      
      // Set up fonts with Libertinus Serif - ensure we have all required variants
      if (loadedFonts.normal && loadedFonts.bold && loadedFonts.italics && loadedFonts.bolditalics) {
        pdfMake.fonts = {
          LibertinusSerif: {
            normal: loadedFonts.normal,
            bold: loadedFonts.bold,
            italics: loadedFonts.italics,
            bolditalics: loadedFonts.bolditalics
          },
          // Also add default Roboto as fallback in the same definition
          Roboto: {
            normal: 'Roboto-Regular.ttf',
            bold: 'Roboto-Medium.ttf',
            italics: 'Roboto-Italic.ttf',
            bolditalics: 'Roboto-MediumItalic.ttf'
          }
        }
        actualFont = 'LibertinusSerif'
        console.log('🎨 LibertinusSerif fonts configured successfully')
      } else {
        throw new Error('Missing required font variants for LibertinusSerif')
      }
      
      // Debug: Print what fonts are actually configured
      console.log('🔤 Final font configuration:', JSON.stringify(pdfMake.fonts, null, 2))
      console.log('📁 Final VFS keys:', Object.keys(customVfs).filter(k => k.includes('Libertinus')))
      
      console.log('🎨 LibertinusSerif fonts loaded successfully')
      
    } catch (fontError) {
      console.warn('⚠️ Failed to load custom fonts, falling back to Roboto:', fontError)
      // Fallback to default fonts
      pdfMake.fonts = {
        Roboto: {
          normal: 'Roboto-Regular.ttf',
          bold: 'Roboto-Medium.ttf',
          italics: 'Roboto-Italic.ttf',
          bolditalics: 'Roboto-MediumItalic.ttf'
        }
      }
      actualFont = 'Roboto'
    }
    
    // Set up VFS BEFORE creating document
    ;(pdfMake as any).vfs = customVfs
    
    console.log('📄 VFS and fonts configured, generating document...')

    // Generate document definition with the actual available font
    const docDefinition = generateCoverLetterDocument(data, actualFont)
    
    console.log('📝 Document generated with font:', docDefinition.defaultStyle?.font)
    
            // Generate PDF buffer
        return new Promise<Buffer>((resolve, reject) => {
          try {
            console.log('🔄 Creating PDF with pdfMake...')
            // Pass fonts and VFS explicitly to createPdf (same as resume system)
            const pdfDocGenerator = (pdfMake as any).createPdf(docDefinition, null, (pdfMake as any).fonts, (pdfMake as any).vfs)
        pdfDocGenerator.getBuffer((buffer: Buffer) => {
          console.log('✅ PDF buffer generated successfully')
          resolve(buffer)
        })
      } catch (pdfError) {
        console.error('❌ PDF generation error:', pdfError)
        reject(pdfError)
      }
    })

  } catch (error) {
    console.error('Cover letter PDF generation error:', error)
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate document definition for cover letter with beautiful typography
 */
function generateCoverLetterDocument(data: CoverLetterData, fontName: string = 'LibertinusSerif') {
  return {
    content: [
      // Header with personal information - elegant and prominent
      {
        stack: [
          {
            text: data.personalInfo.fullName.toUpperCase(),
            style: 'name'
          },
          {
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#2c3e50' }],
            margin: [0, 4, 0, 8]
          },
          ...(data.personalInfo.email || data.personalInfo.phone || data.personalInfo.address ? [{
            columns: [
              {
                stack: [
                  ...(data.personalInfo.email ? [{
                    text: data.personalInfo.email,
                    style: 'contactInfo'
                  }] : []),
                  ...(data.personalInfo.phone ? [{
                    text: data.personalInfo.phone,
                    style: 'contactInfo'
                  }] : [])
                ],
                width: '*'
              },
              {
                stack: [
                  ...(data.personalInfo.address ? [{
                    text: data.personalInfo.address,
                    style: 'contactInfoRight'
                  }] : []),
                  {
                    text: new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }),
                    style: 'contactInfoRight'
                  }
                ],
                width: '*'
              }
            ]
          }] : [])
        ],
        margin: [0, 0, 0, 18]
      },
      
      // Subject line (if job title provided)
      ...(data.jobDetails.jobTitle ? [{
        text: [
          { text: 'RE: ', style: 'subjectLabel' },
          { text: `Application for ${data.jobDetails.jobTitle} Position at ${data.jobDetails.companyName}`, style: 'subjectText' }
        ],
        margin: [0, 0, 0, 12]
      }] : []),
      
      // Salutation
      {
        text: data.jobDetails.hiringManager && data.jobDetails.hiringManager.trim() !== ''
          ? `Dear ${data.jobDetails.hiringManager},`
          : 'Dear Hiring Manager,',
        style: 'salutation',
        margin: [0, 0, 0, 12]
      },
      
      // Content with proper paragraph spacing and formatting
      ...(data.content.opening ? [{
        text: data.content.opening,
        style: 'paragraph',
        margin: [0, 0, 0, 12]
      }] : []),
      
      ...(data.content.body ? data.content.body.split('\n\n').filter(p => p.trim()).map((paragraph, index) => ({
        text: paragraph.trim(),
        style: 'paragraph',
        margin: [0, 0, 0, 12]
      })) : []),
      
      ...(data.content.closing ? [{
        text: data.content.closing,
        style: 'paragraph',
        margin: [0, 0, 0, 18]
      }] : []),
      
      // Professional closing and signature block
      {
        stack: [
          {
            text: 'Sincerely,',
            style: 'closing',
            margin: [0, 0, 0, 0] // No space between sincerely and name
          },
          {
            text: data.personalInfo.fullName,
            style: 'printedName'
          }
        ]
      }
    ],
    
    styles: {
      name: {
        fontSize: 22,
        bold: true,
        color: '#2c3e50',
        letterSpacing: 2,
        alignment: 'center',
        margin: [0, 0, 0, 3]
      },
      contactInfo: {
        fontSize: 10,
        color: '#34495e',
        margin: [0, 2, 0, 0]
      },
      contactInfoRight: {
        fontSize: 10,
        color: '#34495e',
        alignment: 'right',
        margin: [0, 2, 0, 0]
      },
      date: {
        fontSize: 11,
        color: '#2c3e50',
        italics: true
      },
      recipientName: {
        fontSize: 12,
        bold: true,
        color: '#2c3e50',
        margin: [0, 0, 0, 2]
      },
      recipientTitle: {
        fontSize: 11,
        color: '#34495e',
        margin: [0, 0, 0, 2]
      },
      companyName: {
        fontSize: 12,
        bold: true,
        color: '#2c3e50'
      },
      subjectLabel: {
        fontSize: 11,
        bold: true,
        color: '#2c3e50'
      },
      subjectText: {
        fontSize: 11,
        color: '#2c3e50',
        italics: true
      },
      salutation: {
        fontSize: 12,
        color: '#2c3e50',
        bold: true
      },
      paragraph: {
        fontSize: 11,
        color: '#2c3e50',
        alignment: 'justify',
        lineHeight: 1.6,
        margin: [0, 0, 0, 0]
      },
      closing: {
        fontSize: 12,
        color: '#2c3e50'
      },
      printedName: {
        fontSize: 12,
        color: '#2c3e50',
        margin: [0, 0, 0, 0]
      }
    },
    
    defaultStyle: {
      fontSize: 11,
      font: fontName,
      color: '#2c3e50',
      lineHeight: 1.5
    },
    
    pageMargins: [72, 20, 72, 72], // Left, Top (minimal), Right, Bottom margins
    pageSize: 'LETTER',
    
    info: {
      title: `Cover Letter - ${data.personalInfo.fullName} - ${data.jobDetails.companyName}`,
      author: data.personalInfo.fullName,
      subject: `Cover Letter for ${data.jobDetails.jobTitle || 'Position'} at ${data.jobDetails.companyName}`,
      creator: 'Profyle Cover Letter Generator'
    }
  }
}