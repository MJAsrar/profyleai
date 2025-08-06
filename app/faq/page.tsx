"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { HelpCircle, Search, ChevronDown, ChevronUp, MessageSquare, FileText, CreditCard, Shield, Users } from "lucide-react"
import Link from "next/link"

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [openItems, setOpenItems] = useState<number[]>([])

  const categories = [
    {
      icon: FileText,
      title: "Resume Building",
      color: "blue",
      faqs: [
        {
          question: "How do I create my first resume?",
          answer: "To create your first resume, sign up for an account, choose a template, and follow our step-by-step guide. Our AI assistant will help you add content and optimize your resume for better results."
        },
        {
          question: "Can I use multiple templates?",
          answer: "Yes! With a Pro subscription, you can create multiple resumes using different templates. This is perfect for tailoring your resume to different industries or job types."
        },
        {
          question: "How does the AI content suggestion work?",
          answer: "Our AI analyzes your input and suggests improvements based on industry best practices, keyword optimization, and successful resume patterns. You can accept, modify, or reject any suggestions."
        }
      ]
    },
    {
      icon: CreditCard,
      title: "Billing & Plans",
      color: "green",
      faqs: [
        {
          question: "What's included in the free plan?",
          answer: "The free plan includes access to 1 resume template, basic resume builder, PDF export, and community support. It's perfect for getting started."
        },
        {
          question: "Can I cancel my subscription anytime?",
          answer: "Yes, you can cancel your subscription at any time from your account settings. You'll continue to have access to Pro features until the end of your billing period."
        },
        {
          question: "Do you offer refunds?",
          answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team for a full refund."
        }
      ]
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      color: "purple",
      faqs: [
        {
          question: "Is my personal information secure?",
          answer: "Yes, we use industry-standard encryption and security measures to protect your data. Your information is encrypted both in transit and at rest."
        },
        {
          question: "Do you share my data with third parties?",
          answer: "No, we never sell or share your personal information with third parties. Your privacy is our priority, and we only use your data to provide our services."
        },
        {
          question: "Can I delete my account and data?",
          answer: "Yes, you can delete your account and all associated data at any time from your account settings. This action is permanent and cannot be undone."
        }
      ]
    },
    {
      icon: Users,
      title: "Account & Support",
      color: "orange",
      faqs: [
        {
          question: "How do I reset my password?",
          answer: "Click the 'Forgot Password' link on the login page and enter your email. We'll send you a secure link to reset your password."
        },
        {
          question: "How can I contact support?",
          answer: "You can contact our support team via email at junaidasrar04@gmail.com, use our live chat feature, or submit a ticket through our contact form. We typically respond within 24 hours."
        },
        {
          question: "Can I change my email address?",
          answer: "Yes, you can update your email address in your account settings. You'll need to verify the new email address for security purposes."
        }
      ]
    }
  ]

  const toggleItem = (categoryIndex: number, faqIndex: number) => {
    const itemId = categoryIndex * 100 + faqIndex
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const allFaqs = categories.flatMap((category, categoryIndex) =>
    category.faqs.map((faq, faqIndex) => ({
      ...faq,
      categoryIndex,
      faqIndex,
      category: category.title
    }))
  )

  const filteredFaqs = searchTerm 
    ? allFaqs.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allFaqs

  const colorClasses = {
    blue: "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20",
    green: "border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20",
    purple: "border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20",
    orange: "border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20"
  }

  const iconColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600"
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <HelpCircle className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Find quick answers to common questions about Profyle
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 text-base"
            />
          </div>
        </div>

        {searchTerm ? (
          /* Search Results */
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              Search Results ({filteredFaqs.length})
            </h2>
            {filteredFaqs.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm("")}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              </Card>
            ) : (
              filteredFaqs.map((faq, index) => {
                const itemId = faq.categoryIndex * 100 + faq.faqIndex
                const isOpen = openItems.includes(itemId)
                
                return (
                  <Card key={index} className="overflow-hidden">
                    <button
                      onClick={() => toggleItem(faq.categoryIndex, faq.faqIndex)}
                      className="w-full p-6 text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full mr-3">
                            {faq.category}
                          </span>
                          <span className="font-medium">{faq.question}</span>
                        </div>
                        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6">
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </div>
                    )}
                  </Card>
                )
              })
            )}
          </div>
        ) : (
          /* Categories */
          <div className="space-y-8">
            {categories.map((category, categoryIndex) => (
              <section key={categoryIndex}>
                <Card className={`mb-6 ${colorClasses[category.color as keyof typeof colorClasses]}`}>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold flex items-center">
                      <category.icon className={`h-6 w-6 mr-3 ${iconColors[category.color as keyof typeof iconColors]}`} />
                      {category.title}
                    </h2>
                  </CardContent>
                </Card>
                
                <div className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => {
                    const itemId = categoryIndex * 100 + faqIndex
                    const isOpen = openItems.includes(itemId)
                    
                    return (
                      <Card key={faqIndex} className="overflow-hidden">
                        <button
                          onClick={() => toggleItem(categoryIndex, faqIndex)}
                          className="w-full p-6 text-left hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{faq.question}</span>
                            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </div>
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-6">
                            <p className="text-muted-foreground">{faq.answer}</p>
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Contact Support */}
        <section className="mt-16">
          <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
            <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our support team is ready to help you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </Link>
              <Link href="/help">
                <Button variant="outline" size="lg">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help Center
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