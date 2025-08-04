import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create comprehensive resume templates with real CSS styling data
  const templates = [
    // MODERN TEMPLATES
    {
      name: 'Modern Professional',
      category: 'MODERN' as const,
      previewUrl: '/templates/previews/modern-professional.jpg',
      cssData: {
        layout: {
          pageSize: 'letter',
          margins: '0.75in',
          columns: 'single',
          spacing: '1.2em'
        },
        typography: {
          primaryFont: "'Inter', 'Segoe UI', sans-serif",
          secondaryFont: "'Inter', 'Segoe UI', sans-serif",
          baseFontSize: '9pt',
          lineHeight: '1.4'
        },
        colors: {
          primary: '#1f2937',
          secondary: '#4f46e5',
          accent: '#6366f1',
          text: '#374151',
          muted: '#6b7280',
          background: '#ffffff'
        },
        sections: {
          header: {
            background: '#ffffff',
            color: '#1f2937',
            padding: '2rem 2rem 1.5rem',
            marginBottom: '1.5rem',
            borderRadius: '0 0 1rem 1rem'
          },
          section: {
            marginBottom: '1.5rem',
            borderLeft: '3px solid #e5e7eb',
            paddingLeft: '1rem'
          },
          sectionTitle: {
            fontSize: '14pt',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }
        },
        elements: {
          name: {
            fontSize: '28pt',
            fontWeight: '700',
            marginBottom: '0.5rem'
          },
          title: {
            fontSize: '16pt',
            fontWeight: '400',
            opacity: '0.9'
          },
          contact: {
            fontSize: '10pt',
            display: 'flex',
            gap: '1rem',
            marginTop: '1rem'
          },
          jobTitle: {
            fontSize: '12pt',
            fontWeight: '600',
            color: '#1f2937'
          },
          company: {
            fontSize: '11pt',
            fontWeight: '500',
            color: '#4f46e5'
          },
          dates: {
            fontSize: '10pt',
            color: '#6b7280',
            fontStyle: 'italic'
          },
          bulletPoints: {
            fontSize: '10pt',
            lineHeight: '1.5',
            marginLeft: '1rem'
          }
        }
      }
    },
    // ATS FRIENDLY TEMPLATE
    {
      name: 'ATS Friendly',
      category: 'ATS' as const,
      previewUrl: '/templates/previews/ats-friendly.jpg',
      cssData: {
        layout: {
          pageSize: 'letter',
          margins: '0.75in',
          columns: 'single',
          spacing: '1.0em'
        },
        typography: {
          primaryFont: "'LibertinusSerif', 'Times New Roman', serif",
          secondaryFont: "'LibertinusSerif', 'Times New Roman', serif", 
          baseFontSize: '9pt',
          lineHeight: '1.3'
        },
        colors: {
          primary: '#000000',
          secondary: '#000000',
          accent: '#000000',
          text: '#000000',
          muted: '#000000',
          background: '#ffffff'
        },
        sections: {
          header: {
            background: '#ffffff',
            color: '#000000',
            padding: '0',
            marginBottom: '15px',
            borderBottom: 'none'
          },
          section: {
            marginBottom: '15px',
            padding: '0',
            border: 'none'
          },
          sectionTitle: {
            fontSize: '12pt',
            fontWeight: '700',
            color: '#000000',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderBottom: 'none'
          }
        },
        elements: {
          name: {
            fontSize: '20pt',
            fontWeight: '700',
            color: '#000000',
            marginBottom: '4px',
            textAlign: 'left'
          },
          contact: {
            fontSize: '11pt',
            color: '#000000',
            marginBottom: '0',
            display: 'inline-block'
          },
          jobTitle: {
            fontSize: '11pt',
            fontWeight: '400',
            color: '#000000',
            fontStyle: 'italic'
          },
          company: {
            fontSize: '11pt',
            fontWeight: '700',
            color: '#000000'
          },
          dates: {
            fontSize: '11pt',
            color: '#000000',
            fontWeight: '400'
          },
          bulletPoints: {
            fontSize: '11pt',
            color: '#000000',
            lineHeight: '1.3',
            marginLeft: '20px'
          },
          skills: {
            fontSize: '11pt',
            color: '#000000',
            lineHeight: '1.4'
          }
        }
      }
    },
    // TECH STACK TEMPLATE
    {
      name: 'Tech Stack',
      category: 'MODERN' as const,
      previewUrl: '/templates/previews/tech-stack.jpg',
      cssData: {
        layout: {
          pageSize: 'letter',
          margins: '0.75in',
          columns: 'single',
          spacing: '1.2em'
        },
        typography: {
          primaryFont: "'LibertinusSerif', 'Libertinus Serif', serif",
          secondaryFont: "'LibertinusSerif', 'Libertinus Serif', serif",
          baseFontSize: '9pt',
          lineHeight: '1.4'
        },
        colors: {
          primary: '#1f2937',
          secondary: '#374151',
          accent: '#6b7280',
          text: '#374151',
          muted: '#6b7280',
          background: '#ffffff'
        },
        sections: {
          header: {
            background: '#ffffff',
            color: '#1f2937',
            padding: '1.5rem 0 1rem',
            marginBottom: '1.5rem',
            borderBottom: '2px solid #e5e7eb'
          },
          section: {
            marginBottom: '1.5rem',
            padding: '0',
            borderLeft: 'none'
          },
          sectionTitle: {
            fontSize: '14pt',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }
        },
        elements: {
          name: {
            fontSize: '26pt',
            fontWeight: '700',
            marginBottom: '0.5rem'
          },
          title: {
            fontSize: '14pt',
            fontWeight: '400',
            color: '#6b7280'
          },
          contact: {
            fontSize: '10pt',
            display: 'flex',
            gap: '1rem',
            marginTop: '0.75rem'
          },
          jobTitle: {
            fontSize: '12pt',
            fontWeight: '600',
            color: '#1f2937'
          },
          company: {
            fontSize: '11pt',
            fontWeight: '500',
            color: '#374151'
          },
          dates: {
            fontSize: '10pt',
            color: '#6b7280',
            fontStyle: 'italic'
          },
          bulletPoints: {
            fontSize: '10pt',
            lineHeight: '1.5',
            marginLeft: '1rem'
          },
          skills: {
            fontSize: '10pt',
            lineHeight: '1.4',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.5rem'
          }
        }
      }
    },
    // CLEAN MINIMALIST TEMPLATE
    {
      name: 'Clean Minimalist',
      category: 'MODERN' as const,
      previewUrl: '/templates/previews/clean-minimalist.jpg',
      cssData: {
        layout: {
          pageSize: 'letter',
          margins: '0.75in',
          columns: 'single',
          spacing: '1.2em'
        },
        typography: {
          primaryFont: "'Nunito Sans', 'Nunito', sans-serif",
          secondaryFont: "'Nunito Sans', 'Nunito', sans-serif",
          baseFontSize: '9pt',
          lineHeight: '1.4'
        },
        colors: {
          primary: '#022c22', // Super duuper dark green for subheadings
          secondary: '#064e3b', // Very dark green
          accent: '#065f46', // Dark green accent
          text: '#1f2937',
          muted: '#6b7280',
          background: '#ffffff'
        },
        sections: {
          header: {
            background: '#ffffff',
            color: '#1f2937',
            padding: '2rem 2rem 1.5rem',
            marginBottom: '1.5rem'
          },
          section: {
            marginBottom: '1.5rem',
            borderLeft: '2px solid #022c22', // Super duuper dark green accent
            paddingLeft: '1rem'
          },
          sectionTitle: {
            fontSize: '14pt',
            fontWeight: '600',
            color: '#022c22', // Super duuper dark green subheadings
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }
        },
        elements: {
          name: {
            fontSize: '28pt',
            fontWeight: '700',
            marginBottom: '0.5rem',
            color: '#1f2937'
          },
          title: {
            fontSize: '16pt',
            fontWeight: '400',
            color: '#6b7280',
            marginBottom: '1rem'
          },
          contact: {
            fontSize: '10pt',
            display: 'flex',
            gap: '1rem',
            marginTop: '0.75rem',
            color: '#022c22' // Super duuper dark green contact info
          },
          jobTitle: {
            fontSize: '12pt',
            fontWeight: '600',
            color: '#1f2937'
          },
          company: {
            fontSize: '11pt',
            fontWeight: '500',
            color: '#374151'
          },
          dates: {
            fontSize: '10pt',
            color: '#6b7280',
            fontStyle: 'italic'
          },
          bulletPoints: {
            fontSize: '10pt',
            lineHeight: '1.5',
            marginLeft: '1rem'
          },
          skills: {
            fontSize: '10pt',
            lineHeight: '1.4',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.5rem'
          }
        }
      }
    },
    // TRADITIONAL PROFESSIONAL TEMPLATE
    {
      name: 'Traditional Professional',
      category: 'CLASSIC' as const,
      previewUrl: '/templates/previews/traditional-professional.jpg',
      cssData: {
        layout: {
          pageSize: 'letter',
          margins: '1in',
          columns: 'single',
          spacing: '1.4em'
        },
        typography: {
          primaryFont: "'Crimson Text', 'Times New Roman', serif",
          secondaryFont: "'Crimson Text', 'Times New Roman', serif",
          baseFontSize: '11pt',
          lineHeight: '1.5'
        },
        colors: {
          primary: '#000000',
          secondary: '#333333',
          accent: '#666666',
          text: '#000000',
          muted: '#666666',
          background: '#ffffff'
        },
        sections: {
          header: {
            background: '#ffffff',
            color: '#000000',
            padding: '1.5rem 0 1rem',
            marginBottom: '1.5rem',
            borderBottom: '2px solid #000000'
          },
          section: {
            marginBottom: '1.5rem'
          },
          sectionTitle: {
            fontSize: '14pt',
            fontWeight: '700',
            color: '#000000',
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderBottom: '1px solid #000000',
            paddingBottom: '0.25rem'
          }
        },
        elements: {
          name: {
            fontSize: '24pt',
            fontWeight: '700',
            marginBottom: '0.5rem',
            textAlign: 'center'
          },
          title: {
            fontSize: '14pt',
            fontWeight: '400',
            color: '#333333',
            textAlign: 'center'
          },
          contact: {
            fontSize: '11pt',
            textAlign: 'center',
            marginTop: '0.75rem'
          },
          jobTitle: {
            fontSize: '12pt',
            fontWeight: '600',
            color: '#000000'
          },
          company: {
            fontSize: '11pt',
            fontWeight: '500',
            color: '#333333'
          },
          dates: {
            fontSize: '11pt',
            color: '#666666',
            fontStyle: 'italic'
          },
          bulletPoints: {
            fontSize: '11pt',
            lineHeight: '1.5',
            marginLeft: '1.5rem'
          },
          skills: {
            fontSize: '11pt',
            lineHeight: '1.5'
          }
        }
      }
    }
  ]

  // Create templates (update existing ones)
  console.log('🌱 Creating templates...')
  let processedCount = 0
  for (const template of templates) {
    try {
      // Try to find existing template first
      const existing = await prisma.template.findFirst({
        where: { name: template.name }
      })
      
      if (existing) {
        // Update the existing template with new data
        const updated = await prisma.template.update({
          where: { id: existing.id },
          data: {
            category: template.category,
            previewUrl: template.previewUrl,
            cssData: template.cssData,
            isActive: template.isActive || true
          }
        })
        console.log(`✅ Updated template: ${template.name} (ID: ${updated.id})`)
        processedCount++
      } else {
        const created = await prisma.template.create({
          data: {
            ...template,
            isActive: template.isActive !== undefined ? template.isActive : true
          }
        })
        console.log(`✅ Created template: ${template.name} (ID: ${created.id})`)
        processedCount++
      }
    } catch (error: any) {
      console.error(`❌ Failed to process template ${template.name}:`, error.message)
    }
  }

  console.log(`✅ Successfully processed ${processedCount} templates out of ${templates.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
