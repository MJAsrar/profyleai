import { Metadata } from 'next'

// Base configuration
export const siteConfig = {
  name: 'Profyle',
  description: 'Build professional resumes with AI assistance. Create ATS-friendly resumes, cover letters, and optimize your LinkedIn profile with our AI-powered platform.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://profyleai.com',
  ogImage: '/og-image.png',
  creator: '@profyleai',
  keywords: [
    'resume builder',
    'AI resume',
    'resume maker',
    'professional resume',
    'ATS resume',
    'resume templates',
    'cover letter generator',
    'LinkedIn optimizer',
    'interview prep',
    'job application',
    'career tools',
    'resume examples'
  ]
}

// Default metadata that will be used as fallback
export const defaultMetadata: Metadata = {
  title: {
    default: `${siteConfig.name} - AI Resume Builder`,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - AI Resume Builder`,
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.creator,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },
}

// Page-specific metadata configurations
export const pageMetadata = {
  home: {
    title: 'AI Resume Builder - Create Professional Resumes with AI | Profyle',
    description: 'Build professional, ATS-friendly resumes in minutes with AI assistance. Choose from expert-designed templates, generate cover letters, and optimize your LinkedIn profile.',
    keywords: [
      'AI resume builder',
      'resume maker online',
      'professional resume templates',
      'ATS friendly resume',
      'free resume builder',
      'resume generator',
      'job application tools'
    ],
    openGraph: {
      title: 'Build Your Perfect Resume with AI Assistance',
      description: 'Create professional resumes, cover letters, and optimize your LinkedIn profile with our AI-powered platform. Get hired faster with personalized content.',
    }
  },
  
  login: {
    title: 'Login to Your Account',
    description: 'Sign in to your Profyle account to continue building your professional resume and accessing AI-powered career tools.',
    robots: { index: false, follow: true }
  },
  
  signup: {
    title: 'Create Your Free Account',
    description: 'Join thousands of professionals who use Profyle to create stunning resumes. Sign up for free and start building your career today.',
  },
  
  dashboard: {
    title: 'Dashboard - Manage Your Career Tools',
    description: 'Access your resume builder, cover letter generator, LinkedIn optimizer, and interview prep tools from your personalized dashboard.',
    robots: { index: false, follow: true }
  },
  
  resumeBuilder: {
    title: 'Resume Builder - Create Professional Resumes',
    description: 'Build your professional resume with our AI-powered resume builder. Choose from ATS-friendly templates and get real-time suggestions.',
    keywords: [
      'resume builder',
      'create resume',
      'resume templates',
      'professional resume',
      'ATS resume builder'
    ]
  },
  
  viewResumes: {
    title: 'My Resumes - View and Manage',
    description: 'View, edit, and manage all your created resumes. Download as PDF or create new versions tailored for specific jobs.',
    robots: { index: false, follow: true }
  },
  
  coverLetter: {
    title: 'Cover Letter Generator - AI-Powered Cover Letters',
    description: 'Generate personalized cover letters that match your resume and target job. Create compelling cover letters in minutes with AI assistance.',
    keywords: [
      'cover letter generator',
      'AI cover letter',
      'cover letter templates',
      'job application letter',
      'personalized cover letter'
    ]
  },
  
  linkedin: {
    title: 'LinkedIn Optimizer - Enhance Your Professional Profile',
    description: 'Optimize your LinkedIn profile to attract recruiters and opportunities. Get AI-powered suggestions to improve your professional presence.',
    keywords: [
      'LinkedIn optimizer',
      'LinkedIn profile optimization',
      'professional networking',
      'LinkedIn headline',
      'LinkedIn summary'
    ]
  },
  
  interview: {
    title: 'Interview Prep - Practice with AI-Generated Questions',
    description: 'Prepare for job interviews with AI-generated questions tailored to your field and target role. Practice answers and get feedback.',
    keywords: [
      'interview preparation',
      'mock interview',
      'interview questions',
      'job interview practice',
      'interview coaching'
    ]
  },
  
  preview: {
    title: 'Resume Preview & Export',
    description: 'Preview your resume and export as a professional PDF. Make final adjustments before downloading your polished resume.',
    robots: { index: false, follow: true }
  },
  
  privacy: {
    title: 'Privacy Policy',
    description: 'Learn how Profyle protects your personal information and resume data. Read our comprehensive privacy policy and data handling practices.',
  },
  
  templates: {
    title: 'Professional Resume Templates - Choose from 20+ ATS-Friendly Designs',
    description: 'Browse our collection of professional resume templates. Choose from modern, classic, creative, and ATS-friendly designs to build your perfect resume.',
    keywords: [
      'resume templates',
      'professional resume templates',
      'ATS resume templates',
      'modern resume templates',
      'creative resume templates',
      'free resume templates',
      'resume template gallery',
      'job application templates'
    ],
    openGraph: {
      title: 'Professional Resume Templates Gallery',
      description: 'Choose from 20+ professionally designed resume templates. Modern, classic, creative, and ATS-friendly options available.',
    }
  }
}

// Helper function to generate metadata for a specific page
export function generateMetadata(page: keyof typeof pageMetadata, customData?: Partial<Metadata>): Metadata {
  const pageData = pageMetadata[page]
  const canonicalUrl = `${siteConfig.url}${getPagePath(page)}`
  
  return {
    ...defaultMetadata,
    title: pageData.title,
    description: pageData.description,
    keywords: (pageData as any).keywords || defaultMetadata.keywords,
    robots: (pageData as any).robots || defaultMetadata.robots,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      ...defaultMetadata.openGraph,
      title: (pageData as any).openGraph?.title || pageData.title,
      description: (pageData as any).openGraph?.description || pageData.description,
      url: canonicalUrl,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title: (pageData as any).openGraph?.title || pageData.title,
      description: (pageData as any).openGraph?.description || pageData.description,
    },
    ...customData
  }
}

// Helper function to get page paths
function getPagePath(page: keyof typeof pageMetadata): string {
  const paths = {
    home: '/',
    login: '/login',
    signup: '/signup',
    dashboard: '/dashboard',
    resumeBuilder: '/dashboard/resume-builder',
    viewResumes: '/dashboard/view-resumes',
    coverLetter: '/dashboard/cover-letter',
    linkedin: '/dashboard/linkedin',
    interview: '/dashboard/interview',
    preview: '/dashboard/preview',
    privacy: '/privacy',
    templates: '/templates'
  }
  
  return paths[page] || '/'
}

// Structured data schemas
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.png`,
  description: siteConfig.description,
  sameAs: [
    // Add social media URLs here when available
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: 'English'
  }
}

export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1000',
    bestRating: '5',
    worstRating: '1'
  },
  featureList: [
    'AI-powered resume builder',
    'Professional resume templates',
    'Cover letter generator',
    'LinkedIn profile optimizer',
    'Interview preparation tools',
    'ATS-friendly formats'
  ]
}

// Service schemas for each tool
export const resumeBuilderServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI Resume Builder',
  description: 'Create professional, ATS-friendly resumes with AI assistance and expert-designed templates.',
  provider: {
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url
  },
  serviceType: 'Resume Building Service',
  areaServed: 'Worldwide',
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: `${siteConfig.url}/dashboard/resume-builder`,
    serviceType: 'Online'
  }
}

export const coverLetterServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI Cover Letter Generator',
  description: 'Generate personalized cover letters that match your resume and target job.',
  provider: {
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url
  },
  serviceType: 'Cover Letter Writing Service',
  areaServed: 'Worldwide',
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: `${siteConfig.url}/dashboard/cover-letter`,
    serviceType: 'Online'
  }
}

export const linkedinOptimizerServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'LinkedIn Profile Optimizer',
  description: 'Optimize your LinkedIn profile to attract recruiters and career opportunities.',
  provider: {
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url
  },
  serviceType: 'Professional Profile Optimization',
  areaServed: 'Worldwide',
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: `${siteConfig.url}/dashboard/linkedin`,
    serviceType: 'Online'
  }
}

// FAQ Schema for common resume questions
export const resumeFAQSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I create an ATS-friendly resume?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Use a clean, simple format with standard fonts, clear headings, and include relevant keywords from the job description. Avoid images, graphics, and complex formatting that ATS systems cannot read.'
      }
    },
    {
      '@type': 'Question',
      name: 'What should I include in my resume summary?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Your resume summary should be 2-3 sentences highlighting your most relevant experience, key skills, and career achievements that align with the job you\'re applying for.'
      }
    },
    {
      '@type': 'Question',
      name: 'How long should my resume be?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For most professionals, a one-page resume is ideal. Senior professionals with 10+ years of experience may use two pages, but never exceed two pages unless you\'re in academia or research.'
      }
    },
    {
      '@type': 'Question',
      name: 'Should I include a photo on my resume?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In most countries including the US, Canada, and UK, photos on resumes are not recommended and may lead to unconscious bias. Focus on your qualifications and achievements instead.'
      }
    }
  ]
}

// HowTo Schema for resume building process
export const resumeBuildingHowToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Build a Professional Resume with AI',
  description: 'Step-by-step guide to creating a professional resume using AI-powered tools and templates.',
  image: `${siteConfig.url}/og-image.png`,
  totalTime: 'PT30M',
  supply: [
    {
      '@type': 'HowToSupply',
      name: 'Professional email address'
    },
    {
      '@type': 'HowToSupply',
      name: 'Work experience details'
    },
    {
      '@type': 'HowToSupply',
      name: 'Education information'
    }
  ],
  tool: [
    {
      '@type': 'HowToTool',
      name: 'Profyle AI Resume Builder'
    }
  ],
  step: [
    {
      '@type': 'HowToStep',
      name: 'Choose a Template',
      text: 'Select from professional, ATS-friendly resume templates designed for your industry.',
      url: `${siteConfig.url}/templates`
    },
    {
      '@type': 'HowToStep',
      name: 'Add Your Information',
      text: 'Fill in your personal details, work experience, education, and skills using our guided form.',
      url: `${siteConfig.url}/dashboard/resume-builder`
    },
    {
      '@type': 'HowToStep',
      name: 'AI Enhancement',
      text: 'Use AI suggestions to improve your content and optimize for applicant tracking systems.',
      url: `${siteConfig.url}/dashboard/resume-builder`
    },
    {
      '@type': 'HowToStep',
      name: 'Review and Download',
      text: 'Preview your resume, make final adjustments, and download as a professional PDF.',
      url: `${siteConfig.url}/dashboard/preview`
    }
  ]
}

// Breadcrumb schema generator
export function generateBreadcrumbSchema(items: Array<{name: string, url: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}