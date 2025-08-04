"use client"

import type { ResumeData, ResumeTemplate } from "@/lib/resume-store"
import { SectionedDynamicRenderer } from "./sectioned-dynamic-renderer"

interface SectionedTemplateRendererProps {
  template: ResumeTemplate
  data: ResumeData
  section: string
  itemData?: any
}

export function SectionedTemplateRenderer({ 
  template, 
  data, 
  section, 
  itemData 
}: SectionedTemplateRendererProps) {
  
  // Check if this is a dynamic template with CSS data
  if (template.cssData && Object.keys(template.cssData).length > 0) {
    return (
      <SectionedDynamicRenderer
        template={template}
        data={data}
        section={section}
        itemData={itemData}
      />
    )
  }
  
  // Static template sections
  const renderModernSection = (sectionId: string) => {
    const baseStyle = { fontFamily: "Arial, sans-serif" }
    
    switch (sectionId) {
      case 'header':
        return (
          <div className="pb-0 mb-0">
            <h1 className="font-bold text-blue-600 mb-0" style={{ fontSize: '17pt', ...baseStyle }}>
              {data.personalInfo.fullName || "Your Name"}
            </h1>
            <div className="flex flex-wrap gap-0 text-gray-600" style={{ fontSize: '7pt', ...baseStyle }}>
              {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
              {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
              {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
              {data.personalInfo.website && <span className="text-blue-600">{data.personalInfo.website}</span>}
              {data.personalInfo.linkedin && <span className="text-blue-600">{data.personalInfo.linkedin}</span>}
            </div>
          </div>
        )
        
      case 'summary':
        return data.summary ? (
          <div className="mb-2">
            <h2 className="font-bold text-blue-600 mb-0" style={{ fontSize: '13pt', ...baseStyle }}>
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-none" style={{ fontSize: '8pt', ...baseStyle }}>
              {data.summary}
            </p>
          </div>
        ) : null
        
      case 'experience-header':
        return (
          <h2 className="font-bold text-blue-600 mb-0 border-b border-gray-300 pb-0" style={{ fontSize: '13pt', ...baseStyle }}>
            Professional Experience
          </h2>
        )
        
      case 'education-header':
        return (
          <h2 className="font-bold text-blue-600 mb-0 border-b border-gray-300 pb-0" style={{ fontSize: '13pt', ...baseStyle }}>
            Education
          </h2>
        )
        
      case 'skills':
        return data.skills.length > 0 ? (
          <div className="mb-2">
            <h2 className="font-bold text-blue-600 mb-0" style={{ fontSize: '13pt', ...baseStyle }}>
              Skills
            </h2>
            {data.skills.map((skillCategory) => (
              <div key={skillCategory.id} className="mb-0">
                <span className="font-medium text-gray-800" style={{ fontSize: '8pt', ...baseStyle }}>
                  {skillCategory.category}:{" "}
                </span>
                <span className="text-gray-700" style={{ fontSize: '8pt', ...baseStyle }}>
                  {(skillCategory.skills || (skillCategory as any).items || [])
                    .map(skill => typeof skill === 'string' ? skill : skill.name)
                    .join(", ")}
                </span>
              </div>
            ))}
          </div>
        ) : null
        
      case 'projects-header':
        return (
          <h2 className="font-bold text-blue-600 mb-0 border-b border-gray-300 pb-0" style={{ fontSize: '13pt', ...baseStyle }}>
            Projects
          </h2>
        )
        
      case 'certifications-header':
        return (
          <h2 className="font-bold text-blue-600 mb-0 border-b border-gray-300 pb-0" style={{ fontSize: '13pt', ...baseStyle }}>
            Certifications
          </h2>
        )
        
      default:
        // Handle individual items
        if (sectionId.startsWith('experience-') && itemData) {
          const exp = itemData
          return (
            <div className="mb-2">
              <div className="flex justify-between items-start mb-0">
                <h3 className="font-bold text-gray-800" style={{ fontSize: '8pt', ...baseStyle }}>
                  {exp.position}
                </h3>
                <span className="text-gray-600" style={{ fontSize: '7pt', ...baseStyle }}>
                  {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}
                </span>
              </div>
              <p className="font-medium text-gray-700 mb-0" style={{ fontSize: '7pt', ...baseStyle }}>
                {exp.company}
              </p>
              {exp.description && (
                <div className="text-gray-600 whitespace-pre-line" style={{ fontSize: '8pt', ...baseStyle }}>
                  {exp.description}
                </div>
              )}
            </div>
          )
        }
        
        if (sectionId.startsWith('education-') && itemData) {
          const edu = itemData
          return (
            <div className="mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800" style={{ fontSize: '8pt', ...baseStyle }}>
                    {edu.degree}
                  </h3>
                  {edu.field && <p className="text-gray-600" style={{ fontSize: '8pt', ...baseStyle }}>{edu.field}</p>}
                </div>
                <div className="text-right text-gray-600" style={{ fontSize: '7pt', ...baseStyle }}>
                  <p>{edu.startDate} - {edu.endDate}</p>
                </div>
              </div>
              <div className="flex justify-between items-start" style={{ marginTop: '0rem' }}>
                <p className="text-gray-700" style={{ fontSize: '7pt', ...baseStyle }}>{edu.institution}</p>
                {edu.gpa && <p className="text-gray-600" style={{ fontSize: '7pt', ...baseStyle }}>GPA: {edu.gpa}</p>}
              </div>
            </div>
          )
        }
        
        if (sectionId.startsWith('project-') && itemData) {
          const project = itemData
          return (
            <div className="mb-2">
              <div className="flex items-center gap-0 mb-0">
                <h3 className="font-bold text-gray-800" style={{ fontSize: '8pt', ...baseStyle }}>
                  {project.name}
                </h3>
                {(project.liveUrl || project.githubUrl) && (
                  <span className="italic text-gray-600" style={{ fontSize: '7pt', ...baseStyle }}>
                    {project.liveUrl || project.githubUrl}
                  </span>
                )}
              </div>
              <p className="mb-0 text-gray-700" style={{ fontSize: '8pt', ...baseStyle }}>
                {project.description}
              </p>
              {project.technologies.length > 0 && (
                <p style={{ fontSize: '8pt', ...baseStyle }}>
                  <span className="font-bold text-gray-800">Technologies: </span>
                  <span className="text-gray-700">{project.technologies.join(", ")}</span>
                </p>
              )}
            </div>
          )
        }
        
        if (sectionId.startsWith('certification-') && itemData) {
          const cert = itemData
          return (
            <div className="mb-2">
              <div className="flex justify-between items-start mb-0">
                <h3 className="font-bold text-gray-800" style={{ fontSize: '8pt', ...baseStyle }}>
                  {cert.name}
                </h3>
                <span className="text-gray-600" style={{ fontSize: '7pt', ...baseStyle }}>
                  {cert.issueDate && new Date(cert.issueDate + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-start mb-0">
                <p className="text-gray-700" style={{ fontSize: '7pt', ...baseStyle }}>{cert.issuedBy}</p>
                <span className="text-gray-600" style={{ fontSize: '7pt', ...baseStyle }}>
                  {cert.isLifetime 
                    ? 'Lifetime' 
                    : cert.expiryDate 
                      ? `Expires ${new Date(cert.expiryDate + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                      : 'No Expiry'}
                </span>
              </div>
              {cert.credentialId && (
                <div style={{ fontSize: '8pt', ...baseStyle }}>
                  <span className="font-medium text-gray-800">Credential ID: </span>
                  <span className="text-gray-700">{cert.credentialId}</span>
                </div>
              )}
            </div>
          )
        }
        
        return null
    }
  }
  
  // Classic template sections  
  const renderClassicSection = (sectionId: string) => {
    const baseStyle = { fontFamily: "Times, serif" }
    
    switch (sectionId) {
      case 'header':
        return (
          <div className="text-center pb-0 mb-0">
            <h1 className="font-bold mb-0" style={{ fontSize: '18pt', ...baseStyle }}>
              {data.personalInfo.fullName || "Your Name"}
            </h1>
            <div className="text-center" style={{ fontSize: '8pt', ...baseStyle }}>
              {[
                data.personalInfo.email,
                data.personalInfo.phone,
                data.personalInfo.location,
                data.personalInfo.website,
                data.personalInfo.linkedin
              ].filter(Boolean).join(" | ")}
            </div>
          </div>
        )
        
      case 'summary':
        return data.summary ? (
          <div className="mb-2">
            <h2 className="font-bold mb-0 text-center" style={{ fontSize: '13pt', ...baseStyle }}>
              PROFESSIONAL SUMMARY
            </h2>
            <p className="leading-none text-center" style={{ fontSize: '8pt', ...baseStyle }}>
              {data.summary}
            </p>
          </div>
        ) : null
        
      // Add other classic template sections...
      default:
        return renderModernSection(sectionId) // Fallback to modern for now
    }
  }
  
  // ATS template sections
  const renderATSSection = (sectionId: string) => {
    const baseStyle = { fontFamily: "Arial, sans-serif" }
    
    switch (sectionId) {
      case 'header':
        return (
          <div className="pb-4 mb-0">
            <h1 className="font-bold mb-0" style={{ fontSize: '16pt', ...baseStyle }}>
              {data.personalInfo.fullName || "Your Name"}
            </h1>
            <div className="space-y-1" style={{ fontSize: '8pt', ...baseStyle }}>
              {data.personalInfo.email && <div>Email: {data.personalInfo.email}</div>}
              {data.personalInfo.phone && <div>Phone: {data.personalInfo.phone}</div>}
              {data.personalInfo.location && <div>Location: {data.personalInfo.location}</div>}
              {data.personalInfo.website && <div>Website: {data.personalInfo.website}</div>}
              {data.personalInfo.linkedin && <div>LinkedIn: {data.personalInfo.linkedin}</div>}
            </div>
          </div>
        )
        
      case 'summary':
        return data.summary ? (
          <div className="mb-2">
            <h2 className="font-bold mb-0" style={{ fontSize: '12pt', ...baseStyle }}>
              PROFESSIONAL SUMMARY
            </h2>
            <p className="leading-none" style={{ fontSize: '8pt', ...baseStyle }}>
              {data.summary}
            </p>
          </div>
        ) : null
        
      // Add other ATS template sections...
      default:
        return renderModernSection(sectionId) // Fallback to modern for now
    }
  }
  
  // Route to appropriate template renderer
  const renderSection = () => {
    switch (template.category) {
      case "CLASSIC":
        return renderClassicSection(section)
      case "ATS":
        return renderATSSection(section)
      case "MODERN":
      default:
        return renderModernSection(section)
    }
  }
  
  return (
    <div className="w-full bg-white text-black">
      {renderSection()}
    </div>
  )
}