import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Eye, Lock, Users, Database, FileText, Mail, Calendar } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="content-container py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy for Profyle</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            (Web App & Chrome Extension)
          </p>
          <div className="mt-6 space-y-1 text-sm text-muted-foreground">
            <div>Effective Date: <span className="font-medium">December 15, 2024</span></div>
            <div>Last Updated: <span className="font-medium">December 15, 2024</span></div>
          </div>
            </div>

        {/* Introduction */}
        <Card className="mb-12 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-8">
            <p className="text-muted-foreground leading-relaxed">
                  Profyle ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard information when you use:
                </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="font-medium">The Profyle Chrome Extension (the "Extension")</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="font-medium">The Profyle Web App (the "Web App")</span>
              </div>
            </div>
            <div className="mt-6 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>By using our services, you agree to the terms of this Privacy Policy.</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Information We Collect */}
              <section>
            <div className="flex items-center mb-6">
              <Database className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">1. Information We Collect</h2>
            </div>
            
            <div className="space-y-6">
              {/* Chrome Extension */}
              <Card className="p-6 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                <h3 className="font-semibold mb-4 text-lg flex items-center">
                  <span className="mr-3 text-blue-600">A.</span>
                  From the Chrome Extension
                </h3>
                <div className="space-y-3 mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <span className="font-medium">Job Posting Content:</span>
                      <span className="text-muted-foreground"> When you click the Extension on a job posting, we read the text of the posting to generate a tailored resume.</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <span className="font-medium">User Preferences:</span>
                      <span className="text-muted-foreground"> If you choose to save settings (e.g., default resume), we store this locally in your browser.</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <span className="font-medium">Account Sync (optional):</span>
                      <span className="text-muted-foreground"> If you log in to your Profyle account through the Extension, we may sync your tailored resumes to your account.</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">We do not:</h4>
                  <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                    <li>• Track your browsing history</li>
                    <li>• Collect unrelated data from other websites</li>
                    <li>• Sell or share your job posting data</li>
                </ul>
                </div>
              </Card>

              {/* Web App */}
              <Card className="p-6 border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
                <h3 className="font-semibold mb-4 text-lg flex items-center">
                  <span className="mr-3 text-green-600">B.</span>
                  From the Web App
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <span className="font-medium">Account Information:</span>
                      <span className="text-muted-foreground"> Name, email address, and password when you sign up.</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <span className="font-medium">Uploaded Resumes and Generated Content:</span>
                      <span className="text-muted-foreground"> Resumes, cover letters, and tailored documents you create using the Web App.</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <span className="font-medium">Usage Data:</span>
                      <span className="text-muted-foreground"> Basic analytics (e.g., pages visited) to improve the service.</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
              </section>

                    {/* How We Use Information */}
          <section>
            <div className="flex items-center mb-6">
              <Users className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">2. How We Use Your Information</h2>
            </div>
            
            <Card className="p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4 text-lg">We use the information collected to:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                      <span>Tailor resumes and cover letters to job postings</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                      <span>Save your documents to your account (if applicable)</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                      <span>Provide customer support and improve our services</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-red-800 dark:text-red-200">We do not:</h4>
                  <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                    <li>• Sell or transfer your data to third parties</li>
                    <li>• Use your data for advertising purposes unrelated to resume tailoring</li>
                    <li>• Use or transfer data to determine creditworthiness or for lending purposes</li>
                  </ul>
                </div>
              </div>
            </Card>
          </section>

          {/* Chrome Extension Permissions */}
          <section>
            <div className="flex items-center mb-6">
              <Shield className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">3. Chrome Extension Permissions</h2>
            </div>
            
            <Card className="p-8">
              <p className="text-muted-foreground mb-6">The Extension requests the following permissions:</p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5"></div>
                  <div>
                    <span className="font-medium">activeTab:</span>
                    <span className="text-muted-foreground"> To read job descriptions from the page you are viewing when you activate the Extension.</span>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5"></div>
                  <div>
                    <span className="font-medium">storage:</span>
                    <span className="text-muted-foreground"> To save your preferences and session data.</span>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5"></div>
                  <div>
                    <span className="font-medium">scripting:</span>
                    <span className="text-muted-foreground"> To display the Extension's interface and extract job descriptions from the page.</span>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5"></div>
                  <div>
                    <span className="font-medium">downloads:</span>
                    <span className="text-muted-foreground"> To allow you to download tailored resumes.</span>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5"></div>
                  <div>
                    <span className="font-medium">Host Permissions:</span>
                    <span className="text-muted-foreground"> To read job postings on supported job boards (e.g., LinkedIn, Indeed) for tailoring purposes.</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Important:</strong> These permissions are used only for the Extension's single purpose and are never used to collect unrelated data.
                </p>
              </div>
            </Card>
          </section>

                    {/* Data Security */}
          <section>
            <div className="flex items-center mb-6">
              <Lock className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">4. Data Security</h2>
            </div>
            
            <Card className="p-8">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                  <span>All communications between the Extension/Web App and our servers are encrypted</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                  <span>User accounts are protected with industry-standard security measures</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                  <span>You may request deletion of your data at any time by contacting us</span>
                </li>
              </ul>
            </Card>
          </section>

          {/* Data Sharing */}
          <section>
            <div className="flex items-center mb-6">
              <Users className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">5. Data Sharing</h2>
            </div>
            
            <Card className="p-8">
              <p className="text-muted-foreground mb-4">We may share data only in these cases:</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                  <span>With service providers that help us operate Profyle (under strict confidentiality agreements)</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                  <span>If required by law or to protect our legal rights</span>
                </li>
              </ul>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                  We never sell user data.
                </p>
              </div>
            </Card>
          </section>

                    {/* Your Rights */}
          <section>
            <div className="flex items-center mb-6">
              <FileText className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">6. Your Rights</h2>
            </div>
            
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <span className="font-medium">Access and Control:</span>
                    <span className="text-muted-foreground"> You can access, edit, or delete your data through your account settings or by contacting us.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <span className="font-medium">Opt-Out:</span>
                    <span className="text-muted-foreground"> You can uninstall the Extension at any time.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <span className="font-medium">Data Deletion:</span>
                    <span className="text-muted-foreground"> Request data deletion by emailing junaidasrar04@gmail.com.</span>
                  </div>
                </li>
              </ul>
            </Card>
          </section>

          {/* Updates to Policy */}
          <section>
            <div className="flex items-center mb-6">
              <Calendar className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">7. Updates to This Policy</h2>
            </div>
            
            <Card className="p-8">
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy occasionally. If changes are significant, we will notify users through the Web App or Extension.
              </p>
            </Card>
          </section>

                    {/* Contact Information */}
          <section>
            <div className="flex items-center mb-6">
              <Mail className="h-6 w-6 text-primary mr-3" />
              <h2 className="text-2xl font-bold">8. Contact Us</h2>
            </div>
            
            <Card className="p-8">
              <div className="text-center">
                <p className="text-muted-foreground mb-6">
                  For questions or privacy requests:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="font-medium">Email:</span>
                    <span>junaidasrar04@gmail.com</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    <span className="font-medium">Website:</span>
                    <span>https://profyleai.com</span>
                  </div>
                </div>
              </div>
            </Card>
          </section>
            </div>
      </main>
      
        <Footer />
    </div>
  )
}