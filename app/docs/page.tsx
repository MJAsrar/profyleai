import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Code, Zap, FileText, Download, ExternalLink, Search, Copy } from "lucide-react"
import Link from "next/link"

export default function DocumentationPage() {
  const sections = [
    {
      title: "Getting Started",
      icon: Zap,
      items: [
        "Quick Start Guide",
        "Account Setup",
        "First Resume Creation",
        "Basic Features Overview"
      ]
    },
    {
      title: "Resume Builder",
      icon: FileText,
      items: [
        "Template Selection",
        "Content Input",
        "Formatting Options",
        "Preview & Edit"
      ]
    },
    {
      title: "AI Features",
      icon: BookOpen,
      items: [
        "Content Suggestions",
        "Resume Optimization",
        "ATS Compatibility",
        "Smart Recommendations"
      ]
    },
    {
      title: "Export & Sharing",
      icon: Download,
      items: [
        "PDF Export",
        "Format Options",
        "Sharing Links",
        "Print Settings"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="content-container py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Documentation</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete guides and documentation to help you master Profyle
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="font-semibold mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-primary" />
                Documentation
              </h2>
              <nav className="space-y-3">
                {sections.map((section, index) => (
                  <div key={index}>
                    <h3 className="font-medium text-sm mb-2 flex items-center">
                      <section.icon className="h-4 w-4 mr-2 text-muted-foreground" />
                      {section.title}
                    </h3>
                    <ul className="ml-6 space-y-1">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          <a href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            {item}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Quick Start */}
            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <Zap className="h-8 w-8 mr-3 text-primary" />
                Quick Start Guide
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      1
                    </div>
                    <h3 className="font-semibold">Create Account</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sign up for your free Profyle account and verify your email address.
                  </p>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      2
                    </div>
                    <h3 className="font-semibold">Choose Template</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Browse our collection of professional templates and select one that fits your style.
                  </p>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      3
                    </div>
                    <h3 className="font-semibold">Add Content</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Fill in your personal information, work experience, and skills with AI assistance.
                  </p>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      4
                    </div>
                    <h3 className="font-semibold">Download</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Preview your resume and download it as a professional PDF.
                  </p>
                </Card>
              </div>
            </section>

            {/* API Documentation */}
            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <Code className="h-8 w-8 mr-3 text-primary" />
                API Documentation
              </h2>
              
              <Card className="p-8 mb-6">
                <h3 className="text-xl font-semibold mb-4">Authentication</h3>
                <p className="text-muted-foreground mb-4">
                  All API requests require authentication using your API key.
                </p>
                
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono">POST /api/auth</span>
                    <Button size="sm" variant="ghost">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="text-sm text-muted-foreground">
{`{
  "api_key": "your-api-key-here",
  "user_id": "user-identifier"
}`}
                  </pre>
                </div>
                
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Full API Reference
                </Button>
              </Card>
            </section>

            {/* Features Documentation */}
            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <FileText className="h-8 w-8 mr-3 text-primary" />
                Feature Guides
              </h2>
              
              <div className="space-y-6">
                {[
                  {
                    title: "AI Content Suggestions",
                    description: "Learn how to use our AI to improve your resume content",
                    topics: ["Setting up AI assistance", "Understanding suggestions", "Applying improvements"]
                  },
                  {
                    title: "Template Customization",
                    description: "Customize templates to match your personal brand",
                    topics: ["Color schemes", "Font selection", "Layout modifications"]
                  },
                  {
                    title: "ATS Optimization",
                    description: "Ensure your resume passes Applicant Tracking Systems",
                    topics: ["ATS-friendly formatting", "Keyword optimization", "Testing compatibility"]
                  }
                ].map((guide, index) => (
                  <Card key={index} className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{guide.title}</h3>
                    <p className="text-muted-foreground mb-4">{guide.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {guide.topics.map((topic, topicIndex) => (
                        <span key={topicIndex} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Support */}
            <section>
              <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
                <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Can't find what you're looking for in our documentation? Our support team is here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <Button size="lg">
                      Contact Support
                    </Button>
                  </Link>
                  <Link href="/help">
                    <Button variant="outline" size="lg">
                      Help Center
                    </Button>
                  </Link>
                </div>
              </Card>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}