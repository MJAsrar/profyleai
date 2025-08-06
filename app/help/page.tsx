import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HelpCircle, Search, FileText, Users, Sparkles, Download, MessageSquare, Linkedin, Target, Video, BookOpen, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HelpCenterPage() {
  const categories = [
    {
      icon: FileText,
      title: "Resume Building",
      description: "Learn how to create professional resumes",
      articles: 12,
      color: "blue"
    },
    {
      icon: Target,
      title: "Resume Tailoring",
      description: "Optimize your resume for specific jobs",
      articles: 8,
      color: "green"
    },
    {
      icon: Sparkles,
      title: "AI Features",
      description: "Make the most of our AI-powered tools",
      articles: 10,
      color: "purple"
    },
    {
      icon: Download,
      title: "Export & Sharing",
      description: "Download and share your resumes",
      articles: 6,
      color: "orange"
    },
    {
      icon: MessageSquare,
      title: "Cover Letters",
      description: "Create compelling cover letters",
      articles: 7,
      color: "pink"
    },
    {
      icon: Linkedin,
      title: "LinkedIn Optimization",
      description: "Enhance your LinkedIn presence",
      articles: 5,
      color: "indigo"
    }
  ]

  const popularArticles = [
    { title: "Getting Started with Resume Builder", views: "15.2k", category: "Basics" },
    { title: "How to Use AI Content Suggestions", views: "12.8k", category: "AI Features" },
    { title: "Tailoring Your Resume for ATS Systems", views: "11.4k", category: "Optimization" },
    { title: "Best Practices for Professional Resumes", views: "9.7k", category: "Tips" },
    { title: "Exporting Your Resume as PDF", views: "8.9k", category: "Export" }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <HelpCircle className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Help Center</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Find answers to your questions and learn how to make the most of Profyle
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search for help articles..."
              className="pl-10 pr-4 py-3 text-base"
            />
            <Button className="absolute right-2 top-1/2 transform -translate-y-1/2">
              Search
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 hover:shadow-md transition-shadow border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
            <div className="flex items-center space-x-3 mb-3">
              <Video className="h-8 w-8 text-blue-600" />
              <h3 className="font-semibold text-lg">Video Tutorials</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Watch step-by-step guides to master all features
            </p>
            <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50">
              Watch Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
          
          <Card className="p-6 hover:shadow-md transition-shadow border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
            <div className="flex items-center space-x-3 mb-3">
              <MessageSquare className="h-8 w-8 text-green-600" />
              <h3 className="font-semibold text-lg">Live Chat</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Get instant help from our support team
            </p>
            <Button variant="outline" size="sm" className="border-green-200 hover:bg-green-50">
              Start Chat
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
          
          <Card className="p-6 hover:shadow-md transition-shadow border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
            <div className="flex items-center space-x-3 mb-3">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <h3 className="font-semibold text-lg">Documentation</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive guides and API documentation
            </p>
            <Link href="/docs">
              <Button variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50">
                Read Docs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>

        {/* Help Categories */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const colorClasses = {
                blue: "border-blue-200 hover:border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20",
                green: "border-green-200 hover:border-green-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20",
                purple: "border-purple-200 hover:border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20",
                orange: "border-orange-200 hover:border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20",
                pink: "border-pink-200 hover:border-pink-300 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/20 dark:to-pink-900/20",
                indigo: "border-indigo-200 hover:border-indigo-300 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20"
              }
              
              const iconColors = {
                blue: "text-blue-600",
                green: "text-green-600", 
                purple: "text-purple-600",
                orange: "text-orange-600",
                pink: "text-pink-600",
                indigo: "text-indigo-600"
              }
              
              return (
                <Card key={index} className={`p-6 hover:shadow-md transition-all duration-300 cursor-pointer ${colorClasses[category.color as keyof typeof colorClasses]}`}>
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-white/60 rounded-lg">
                      <category.icon className={`h-6 w-6 ${iconColors[category.color as keyof typeof iconColors]}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{category.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                      <div className="text-xs text-muted-foreground">
                        {category.articles} articles
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Popular Articles */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Popular Articles</h2>
          <Card className="p-8">
            <div className="space-y-4">
              {popularArticles.map((article, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-medium">{article.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {article.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {article.views} views
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Contact Support */}
        <section>
          <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
            <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </Link>
              <Link href="/faq">
                <Button variant="outline" size="lg">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  View FAQ
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}