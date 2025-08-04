"use client"

import React from 'react'
import { CSSEngine, createCSSEngine, mergeStyles } from '@/lib/css-engine'
import type { ResumeData, ResumeTemplate } from '@/lib/resume-store'
import { useFontConfig } from '@/lib/font-config-store'

interface SectionedDynamicRendererProps {
  template: ResumeTemplate
  data: ResumeData
  section: string
  itemData?: any
}

export function SectionedDynamicRenderer({ 
  template, 
  data, 
  section,
  itemData 
}: SectionedDynamicRendererProps) {
  
  // Get current font configuration
  const fontConfig = useFontConfig()
  
  // Create CSS engine from template data with dynamic font sizes
  const cssEngine = React.useMemo(() => {
    if (template?.cssData) {
      return createCSSEngine(template.cssData, fontConfig)
    }
    if (template?.cssMetadata) {
      return createCSSEngine(constructCSSDataFromMetadata(template), fontConfig)
    }
    return createCSSEngine(null, fontConfig)
  }, [template, fontConfig])

  const utilities = cssEngine.getUtilityStyles()
  
  // Ensure data has proper structure
  const safeData = React.useMemo(() => ({
    personalInfo: data.personalInfo || {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      portfolio: ''
    },
    summary: data.summary || '',
    experience: Array.isArray(data.experience) ? data.experience : [],
    education: Array.isArray(data.education) ? data.education : [],
    skills: Array.isArray(data.skills) ? data.skills : [],
    projects: Array.isArray(data.projects) ? data.projects : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
  }), [data])

  const renderSection = () => {
    switch (section) {
      case 'header':
        return (
          <header style={cssEngine.getHeaderStyles()}>
            <div style={cssEngine.getElementStyles('name')}>
              {safeData.personalInfo.fullName || 'Your Name'}
            </div>
            
            {safeData.personalInfo.professionalTitle && (
              <div style={mergeStyles(cssEngine.getElementStyles('title'), utilities.textMuted)}>
                {safeData.personalInfo.professionalTitle}
              </div>
            )}
            
            {/* Basic Contact Info */}
            <div style={cssEngine.getElementStyles('contact')}>
              {safeData.personalInfo.email && <span key="contact-email">{safeData.personalInfo.email}</span>}
              {safeData.personalInfo.phone && <span key="contact-phone">{safeData.personalInfo.phone}</span>}
              {safeData.personalInfo.location && <span key="contact-location">{safeData.personalInfo.location}</span>}
            </div>
            
            {/* Websites - Separate Line */}
            {(safeData.personalInfo.website || safeData.personalInfo.linkedin || safeData.personalInfo.github || safeData.personalInfo.portfolio) && (
              <div style={cssEngine.getElementStyles('contact')}>
                {safeData.personalInfo.website && (
                  <span key="contact-website" style={{ color: 'var(--primary-color)' }}>{safeData.personalInfo.website}</span>
                )}
                {safeData.personalInfo.linkedin && (
                  <span key="contact-linkedin" style={{ color: 'var(--primary-color)' }}>{safeData.personalInfo.linkedin}</span>
                )}
                {safeData.personalInfo.github && (
                  <span key="contact-github" style={{ color: 'var(--primary-color)' }}>{safeData.personalInfo.github}</span>
                )}
                {safeData.personalInfo.portfolio && (
                  <span key="contact-portfolio" style={{ color: 'var(--primary-color)' }}>{safeData.personalInfo.portfolio}</span>
                )}
              </div>
            )}
          </header>
        )
        
      case 'summary':
        return safeData.summary ? (
          <section style={cssEngine.getSectionStyles()}>
            <h2 style={cssEngine.getSectionTitleStyles()}>Professional Summary</h2>
            <div style={cssEngine.getElementStyles('summary')}>
              {safeData.summary}
            </div>
          </section>
        ) : null
        
      case 'experience-header':
        return (
          <h2 style={cssEngine.getSectionTitleStyles()}>Professional Experience</h2>
        )
        
      case 'education-header':
        return (
          <h2 style={cssEngine.getSectionTitleStyles()}>Education</h2>
        )
        
      case 'skills':
        return safeData.skills.length > 0 ? (
          <section style={cssEngine.getSectionStyles()}>
            <h2 style={cssEngine.getSectionTitleStyles()}>Skills</h2>
            <div style={cssEngine.getElementStyles('skills')}>
              {safeData.skills.map((skillCategory, categoryIndex) => (
                <div key={categoryIndex} style={{ margin: '0 0 4px 0', padding: '0', display: 'block' }}>
                  <span style={mergeStyles(cssEngine.getElementStyles('skillCategory'), { fontWeight: 'bold' })}>
                    {skillCategory.category}:{' '}
                  </span>
                  <span style={cssEngine.getElementStyles('skillList')}>
                    {(skillCategory.skills || (skillCategory as any).items || [])
                      .map(skill => typeof skill === 'string' ? skill : skill.name)
                      .join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null
        
      case 'projects-header':
        return (
          <h2 style={cssEngine.getSectionTitleStyles()}>Projects</h2>
        )
        
      case 'certifications-header':
        return (
          <h2 style={cssEngine.getSectionTitleStyles()}>Certifications</h2>
        )
        
      default:
        // Handle individual items
        if (section.startsWith('experience-') && itemData) {
          const exp = itemData
          return (
            <div style={{ margin: '0', padding: '0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '0', padding: '0' }}>
                <div style={cssEngine.getElementStyles('jobTitle')}>
                  {exp.position}
                </div>
                <div style={cssEngine.getElementStyles('dates')}>
                  {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}
                </div>
              </div>
              <div style={cssEngine.getElementStyles('company')}>
                {exp.company}
              </div>
              {exp.description && (
                <div style={mergeStyles(cssEngine.getElementStyles('bulletPoints'), { marginTop: '0.25rem', whiteSpace: 'pre-line' })}>
                  {exp.description.split('\n').map((line: string, index: number) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
              )}
            </div>
          )
        }
        
        if (section.startsWith('education-') && itemData) {
          const edu = itemData
          return (
            <div style={{ margin: '0', padding: '0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '0', padding: '0' }}>
                <div>
                  <div style={cssEngine.getElementStyles('jobTitle')}>
                    {edu.degree}
                  </div>
                  {edu.field && (
                    <div style={mergeStyles(cssEngine.getElementStyles('bulletPoints'), { marginTop: '0.1rem' })}>
                      {edu.field}
                    </div>
                  )}
                </div>
                <div style={cssEngine.getElementStyles('dates')}>
                  {edu.startDate} - {edu.endDate}
                </div>
              </div>
              <div style={cssEngine.getElementStyles('company')}>
                {edu.institution}
              </div>
              {edu.gpa && (
                <div style={mergeStyles(cssEngine.getElementStyles('bulletPoints'), { marginTop: '0.25rem' })}>
                  GPA: {edu.gpa}
                </div>
              )}
            </div>
          )
        }
        
        if (section.startsWith('project-') && itemData) {
          const project = itemData
          return (
            <div style={{ margin: '0', padding: '0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '0', padding: '0' }}>
                <div style={cssEngine.getElementStyles('jobTitle')}>
                  {project.name}
                </div>
                {(project.liveUrl || project.githubUrl) && (
                  <div style={mergeStyles(cssEngine.getElementStyles('dates'), { fontStyle: 'normal' })}>
                    {project.liveUrl || project.githubUrl}
                  </div>
                )}
              </div>
              <div style={mergeStyles(cssEngine.getElementStyles('bulletPoints'), { marginBottom: '0.25rem' })}>
                {project.description}
              </div>
              {project.technologies && project.technologies.length > 0 && (
                <div style={mergeStyles(cssEngine.getElementStyles('bulletPoints'), { marginTop: '0.25rem' })}>
                  <span style={{ fontWeight: 'bold' }}>Technologies: </span>
                  {project.technologies.join(', ')}
                </div>
              )}
            </div>
          )
        }
        
        if (section.startsWith('certification-') && itemData) {
          const cert = itemData
          return (
            <div style={{ margin: '0', padding: '0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '0', padding: '0' }}>
                <div style={cssEngine.getElementStyles('jobTitle')}>
                  {cert.name}
                </div>
                <div style={cssEngine.getElementStyles('dates')}>
                  {cert.issueDate && new Date(cert.issueDate + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div style={cssEngine.getElementStyles('company')}>
                {cert.issuedBy}
              </div>
              {cert.credentialId && (
                <div style={mergeStyles(cssEngine.getElementStyles('bulletPoints'), { marginTop: '0.25rem' })}>
                  <span style={{ fontWeight: 'bold' }}>Credential ID: </span>
                  {cert.credentialId}
                </div>
              )}
              {cert.expiryDate && !cert.isLifetime && (
                <div style={mergeStyles(cssEngine.getElementStyles('bulletPoints'), { marginTop: '0.1rem' })}>
                  <span style={{ fontWeight: 'bold' }}>Expires: </span>
                  {new Date(cert.expiryDate + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              )}
              {cert.isLifetime && (
                <div style={mergeStyles(cssEngine.getElementStyles('bulletPoints'), { marginTop: '0.1rem' })}>
                  <span style={{ fontWeight: 'bold' }}>Lifetime Certification</span>
                </div>
              )}
            </div>
          )
        }
        
        return null
    }
  }

  return (
    <div style={mergeStyles(cssEngine.getBaseTypographyStyles(), cssEngine.getCSSVariables())}>
      {renderSection()}
    </div>
  )
}

// Helper function to construct CSS data from template metadata
function constructCSSDataFromMetadata(template: ResumeTemplate) {
  const metadata = template.cssMetadata || {}
  
  return {
    layout: {
      type: metadata.layoutType || 'single-column',
      pageSize: metadata.pageSize || 'letter',
      margins: '0.05in',
      columns: 'single',
      spacing: '0.2rem'
    },
    typography: {
      primaryFont: metadata.primaryFont || "'Inter', sans-serif",
      secondaryFont: metadata.primaryFont || "'Inter', sans-serif",
      baseFontSize: '8pt',
      lineHeight: '1.1'
    },
    colors: {
      primary: metadata.primaryColor || '#1f2937',
      secondary: metadata.secondaryColor || '#4f46e5',
      accent: metadata.accentColor || '#6366f1',
      text: '#374151',
      muted: '#6b7280',
      background: '#ffffff'
    },
    sections: {
      header: {
        background: '#ffffff',
        color: '#1f2937',
        padding: '0.2rem 0.2rem 0.2rem',
        marginBottom: '0.25rem'
      },
      section: {
        marginBottom: '0.25rem',
        padding: '0'
      },
      sectionTitle: {
        fontSize: '14pt',
        fontWeight: '600',
        color: metadata.primaryColor || '#1f2937',
        marginBottom: '0.2rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }
    },
    elements: {
      name: {
        fontSize: '18pt',
        fontWeight: '700',
        marginBottom: '0.25rem'
      },
      contact: {
        fontSize: '7pt',
        display: 'flex',
        gap: '1rem',
        margin: '0', padding: '0'
      },
      // Add more element styles as needed...
    }
  }
}