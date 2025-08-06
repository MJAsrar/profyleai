import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Scale, Users, Shield, AlertCircle, Calendar } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Scale className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Terms of Service</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Please read these terms carefully before using our services
          </p>
          <div className="mt-6 text-sm text-muted-foreground">
            Last updated: <span className="font-medium">December 2024</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-12">
          {/* Agreement */}
          <section>
            <div className="flex items-center mb-6">
              <FileText className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">Agreement to Terms</h2>
            </div>
            <Card className="p-8">
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using Profyle ("Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </Card>
          </section>

          {/* Use License */}
          <section>
            <div className="flex items-center mb-6">
              <Shield className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">Use License</h2>
            </div>
            <Card className="p-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Permission is granted to temporarily use Profyle for:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <span>Personal, non-commercial transitory viewing only</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <span>Creating and downloading your own resume documents</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <span>Sharing your resume documents with potential employers</span>
                  </li>
                </ul>
                
                <h3 className="font-semibold text-lg mt-6">This license shall NOT permit you to:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                    <span>Modify or copy the materials</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                    <span>Use the materials for commercial purposes or public display</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                    <span>Attempt to reverse engineer any software</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                    <span>Remove any copyright or proprietary notations</span>
                  </li>
                </ul>
              </div>
            </Card>
          </section>

          {/* User Accounts */}
          <section>
            <div className="flex items-center mb-6">
              <Users className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">User Accounts</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-3 text-lg">Account Creation</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• You must provide accurate information</li>
                  <li>• You are responsible for account security</li>
                  <li>• One account per person</li>
                  <li>• Must be 16 years or older</li>
                </ul>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-semibold mb-3 text-lg">Account Responsibilities</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Keep login credentials secure</li>
                  <li>• Notify us of unauthorized access</li>
                  <li>• Update information when necessary</li>
                  <li>• Comply with all terms and policies</li>
                </ul>
              </Card>
            </div>
          </section>

          {/* Prohibited Uses */}
          <section>
            <div className="flex items-center mb-6">
              <AlertCircle className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">Prohibited Uses</h2>
            </div>
            <Card className="p-8 border-red-200 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
              <div className="space-y-4">
                <p className="font-medium text-red-800 dark:text-red-200">
                  You may not use our service:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>For any unlawful purpose</span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>To transmit harmful code</span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>To harass or abuse others</span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>To violate intellectual property</span>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>To spam or send unsolicited content</span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>To impersonate others</span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>To circumvent security measures</span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>To interfere with service operation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </section>

          {/* Service Modifications */}
          <section>
            <div className="flex items-center mb-6">
              <Calendar className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">Service Modifications</h2>
            </div>
            <Card className="p-8">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Profyle reserves the right to modify or discontinue the service at any time, with or without notice. 
                We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the service.
              </p>
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> We will make reasonable efforts to notify users of significant changes to our service 
                  and will provide migration options when possible.
                </p>
              </div>
            </Card>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Limitation of Liability</h2>
            <Card className="p-8">
              <p className="text-muted-foreground leading-relaxed mb-4">
                In no event shall Profyle or its suppliers be liable for any damages (including, without limitation, 
                damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
                to use the materials on Profyle's website, even if Profyle or an authorized representative has been 
                notified orally or in writing of the possibility of such damage.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability 
                for consequential or incidental damages, these limitations may not apply to you.
              </p>
            </Card>
          </section>

          {/* Contact Information */}
          <section>
            <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
              <h2 className="text-2xl font-bold mb-4">Questions About Terms?</h2>
              <p className="text-muted-foreground mb-6">
                If you have any questions about these Terms of Service, please contact us.
              </p>
              <div className="text-sm text-muted-foreground">
                Email: <span className="font-medium">junaidasrar04@gmail.com</span>
              </div>
            </Card>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}