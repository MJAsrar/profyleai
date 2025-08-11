/**
 * ATS Friendly PDF Template - Optimized for Applicant Tracking Systems
 */

import type { Content, Style, TDocumentDefinitions } from 'pdfmake/interfaces'
import type { ResumeData } from '@/lib/resume-store'
import { BasePDFTemplate, type TemplateStyles } from '../template-engine'

export class ATSPDFTemplate extends BasePDFTemplate {
  id = 'ats'
  name = 'ATS Friendly'
  
  constructor() {
    super()
  }
  
  generate(data: any, options?: any): TDocumentDefinitions {
    try {
      const result = super.generate(data, options)
      return result
    } catch (error) {
      throw error
    }
  }

  styles: TemplateStyles = {
    fonts: {
      header: 'Arial',  // ATS-friendly fonts
      body: 'Arial',
      accent: 'Arial'
    },
    colors: {
      primary: '#000000',      // Pure black for ATS compatibility
      secondary: '#000000',    // Pure black
      accent: '#000000',       // Pure black
      text: '#000000',         // Pure black
      background: '#ffffff',   // Pure white
      muted: '#000000'         // Pure black
    },
    spacing: {
      section: 15,             // Consistent spacing between sections
      item: 8,                 // Spacing between items
      line: 4                  // Line spacing
    },
    typography: {
      name: 20,                // 20pt for name (18-22pt range)
      title: 12,               // 12pt for section titles
      body: 11,                // 11pt for body text
      contact: 11              // 11pt for contact info
    }
  }

  protected buildHeader(data: ResumeData): Content {
    const personalInfo = data.personalInfo || {}
    
    const headerContent: Content[] = [
      // Name - Bold, large font
      {
        text: personalInfo.fullName || 'Your Name',
        style: 'name',
        margin: [0, 0, 0, 0]
      }
    ]

    // Basic contact info line
    const basicContactItems: string[] = []
    if (personalInfo.email) basicContactItems.push(personalInfo.email)
    if (personalInfo.phone) basicContactItems.push(personalInfo.phone)
    if (personalInfo.location) basicContactItems.push(personalInfo.location)
    
    if (basicContactItems.length > 0) {
      headerContent.push({
        text: basicContactItems.join(' | '),
        style: 'contact',
        margin: [0, 0, 0, 0]
      })
    }

    // Websites line
    const websiteItems: string[] = []
    if (personalInfo.website) websiteItems.push(personalInfo.website)
    if (personalInfo.linkedin) websiteItems.push(personalInfo.linkedin)
    if (personalInfo.github) websiteItems.push(personalInfo.github)
    if (personalInfo.portfolio) websiteItems.push(personalInfo.portfolio)
    
    if (websiteItems.length > 0) {
      headerContent.push({
        text: websiteItems.join(' | '),
        style: 'contact',
        margin: [0, 0, 0, 0]
      })
    }

    return {
      stack: headerContent,
      margin: [0, 0, 0, 0] // No spacing after header
    }
  }

  protected buildExperience(experience: any[]): Content {
    if (!experience || experience.length === 0) return { text: '' }

    const content: Content[] = [
      { text: 'WORK EXPERIENCE', style: 'sectionTitle' }
    ]

    experience.forEach(exp => {
      const expContent: Content[] = []
      
      // Line 1: Organization name (bold), Location (regular)
      expContent.push({
        columns: [
          { text: exp.company || 'Company', style: 'companyName', width: '*' },
          { text: exp.location || '', style: 'bodyText', width: 'auto', alignment: 'right' }
        ],
        margin: [0, 0, 0, 0]
      })
      
      // Line 2: Position (italic) + Date range (right-aligned)
      expContent.push({
        columns: [
          { text: exp.position || 'Position', style: 'positionName', width: '*' },
          { 
            text: `${exp.startDate || ''} - ${exp.isCurrent ? 'Present' : (exp.endDate || '')}`, 
            style: 'bodyText', 
            width: 'auto', 
            alignment: 'right' 
          }
        ],
        margin: [0, 0, 0, 4]
      })

      // Bullet points for descriptions
      if (exp.description) {
        const bulletPoints = exp.description.split('\n')
          .filter((line: string) => line.trim())
          .map((line: string) => ({
            text: `• ${line.trim()}`,
            style: 'bulletPoint'
          }))
        
        if (bulletPoints.length > 0) {
          expContent.push({
            stack: bulletPoints,
            margin: [20, 0, 0, 0]  // Left indentation for bullets
          })
        }
      }

      content.push({
        stack: expContent,
        margin: [0, 0, 0, 8]  // Spacing between experience entries
      })
    })

    return {
      stack: content,
      margin: [0, 0, 0, 15]
    }
  }

  protected buildEducation(education: any[]): Content {
    if (!education || education.length === 0) return { text: '' }

    const content: Content[] = [
      { text: 'EDUCATION', style: 'sectionTitle' }
    ]

    education.forEach(edu => {
      const eduContent: Content[] = []
      
      // Line 1: Institution name (bold), Location (regular)
      eduContent.push({
        columns: [
          { text: edu.institution || 'Institution', style: 'companyName', width: '*' },
          { text: edu.location || '', style: 'bodyText', width: 'auto', alignment: 'right' }
        ],
        margin: [0, 0, 0, 0]
      })
      
      // Line 2: Degree (italic) + Date range and GPA (right-aligned)
      const rightText = [
        `${edu.startDate || ''} - ${edu.endDate || 'Present'}`,
        edu.gpa ? `GPA: ${edu.gpa}` : ''
      ].filter(Boolean).join(' | ')
      
      eduContent.push({
        columns: [
          { 
            text: `${edu.degree || 'Degree'}${edu.field ? ` in ${edu.field}` : ''}`, 
            style: 'positionName', 
            width: '*' 
          },
          { text: rightText, style: 'bodyText', width: 'auto', alignment: 'right' }
        ],
        margin: [0, 0, 0, 0]
      })

      content.push({
        stack: eduContent,
        margin: [0, 0, 0, 8]  // Spacing between education entries
      })
    })

    return {
      stack: content,
      margin: [0, 0, 0, 15]
    }
  }

  protected buildSkills(skills: any[]): Content {
    if (!skills || skills.length === 0) return { text: '' }

    const content: Content[] = [
      { text: 'SKILLS', style: 'sectionTitle' }
    ]

    // Category-style with each category on separate line
    skills.forEach(skillCategory => {
      if (skillCategory && skillCategory.category) {
        const skillsArray = skillCategory.skills || skillCategory.items || []
        const skillNames = skillsArray.map((skill: any) => 
          typeof skill === 'string' ? skill : (skill?.name || 'Skill')
        )
        
        if (skillNames.length > 0) {
          content.push({
            text: [
              { text: `${skillCategory.category}: `, bold: true },
              { text: skillNames.join(', ') }
            ],
            style: 'bodyText',
            margin: [0, 0, 0, 2]
          })
        }
      }
    })

    return {
      stack: content,
      margin: [0, 0, 0, 15]
    }
  }

  protected buildProjects(projects: any[]): Content {
    if (!projects || projects.length === 0) return { text: '' }

    const content: Content[] = [
      { text: 'PROJECTS', style: 'sectionTitle' }
    ]

    projects.forEach(project => {
      const projectContent: Content[] = []
      
      // Line 1: Project Name (bold), URL
      projectContent.push({
        columns: [
          { text: project.name || 'Project', style: 'companyName', bold: true, width: '*' },
          { 
            text: (project.liveUrl || project.githubUrl) || '', 
            style: 'bodyText', 
            width: 'auto', 
            alignment: 'right' 
          }
        ],
        margin: [0, 0, 0, 0]
      })
      
      // Line 2: Description
      if (project.description) {
        projectContent.push({
          text: project.description,
          style: 'bodyText',
          margin: [0, 0, 0, 2]
        })
      }

      // Technologies
      if (project.technologies && project.technologies.length > 0) {
        projectContent.push({
          text: [
            { text: 'Technologies: ', style: 'labelText' },
            { text: project.technologies.join(', '), style: 'bodyText' }
          ],
          margin: [0, 0, 0, 0]
        })
      }

      content.push({
        stack: projectContent,
        margin: [0, 0, 0, 8]  // Spacing between project entries
      })
    })

    return {
      stack: content,
      margin: [0, 0, 0, 15]
    }
  }

  protected getDocumentStyles(): { [key: string]: Style } {
    return {
      section: {
        margin: [0, 0, 0, 12] // Increased bottom margin for better section separation
      },
      name: {
        fontSize: this.styles.typography.name,
        font: this.styles.fonts.header,
        bold: true,
        color: this.styles.colors.primary,
        alignment: 'left'
      },
      contact: {
        fontSize: this.styles.typography.contact,
        font: this.styles.fonts.body,
        color: this.styles.colors.text,
        alignment: 'left'
      },
      sectionTitle: {
        fontSize: this.styles.typography.title,
        font: this.styles.fonts.header,
        bold: true,
        color: this.styles.colors.primary,
        margin: [0, 0, 0, 8]
      },
      companyName: {
        fontSize: this.styles.typography.body,
        font: this.styles.fonts.body,
        bold: true,
        color: this.styles.colors.text
      },
      positionName: {
        fontSize: this.styles.typography.body,
        font: this.styles.fonts.body,
        italics: true,
        color: this.styles.colors.text
      },
      bodyText: {
        fontSize: this.styles.typography.body,
        font: this.styles.fonts.body,
        color: this.styles.colors.text,
        lineHeight: 1.0
      },
      bulletPoint: {
        fontSize: this.styles.typography.body,
        font: this.styles.fonts.body,
        color: this.styles.colors.text,
        lineHeight: 1.0
      },
      labelText: {
        fontSize: this.styles.typography.body,
        font: this.styles.fonts.body,
        bold: true,
        color: this.styles.colors.text
      }
    }
  }
}