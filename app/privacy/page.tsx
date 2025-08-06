import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MotionWrapper } from "@/components/ui/motion-wrapper"

export const metadata = {
  title: 'Privacy Policy - Profyle',
  description: 'Privacy Policy for Profyle Web App & Chrome Extension',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <MotionWrapper animation="fade-in-down" delay={0}>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy for Profyle</h1>
            <div className="text-sm text-muted-foreground mb-8">
              <p><strong>Effective Date:</strong> December 1, 2024</p>
              <p><strong>Last Updated:</strong> December 1, 2024</p>
            </div>

            <div className="space-y-8">
              <section>
                <p className="text-lg leading-relaxed">
                  Profyle ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard information when you use:
                </p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>The Profyle Chrome Extension (the "Extension")</li>
                  <li>The Profyle Web App (the "Web App")</li>
                </ul>
                <p className="text-lg leading-relaxed">
                  By using our services, you agree to the terms of this Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                
                <h3 className="text-xl font-medium mb-3">A. From the Chrome Extension</h3>
                <ul className="list-disc ml-6 space-y-2">
                  <li><strong>Job Posting Content:</strong> When you click the Extension on a job posting, we read the text of the posting to generate a tailored resume.</li>
                  <li><strong>User Preferences:</strong> If you choose to save settings (e.g., default resume), we store this locally in your browser.</li>
                  <li><strong>Account Sync (optional):</strong> If you log in to your Profyle account through the Extension, we may sync your tailored resumes to your account.</li>
                </ul>
                
                <p className="font-medium mt-4 mb-2">We do not:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Track your browsing history.</li>
                  <li>Collect unrelated data from other websites.</li>
                  <li>Sell or share your job posting data.</li>
                </ul>

                <h3 className="text-xl font-medium mb-3 mt-6">B. From the Web App</h3>
                <ul className="list-disc ml-6 space-y-2">
                  <li><strong>Account Information:</strong> Name, email address, and password when you sign up.</li>
                  <li><strong>Uploaded Resumes and Generated Content:</strong> Resumes, cover letters, and tailored documents you create using the Web App.</li>
                  <li><strong>Usage Data:</strong> Basic analytics (e.g., pages visited) to improve the service.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                <p className="mb-4">We use the information collected to:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Tailor resumes and cover letters to job postings.</li>
                  <li>Save your documents to your account (if applicable).</li>
                  <li>Provide customer support and improve our services.</li>
                </ul>
                
                <p className="font-medium mt-4 mb-2">We do not:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Sell or transfer your data to third parties.</li>
                  <li>Use your data for advertising purposes unrelated to resume tailoring.</li>
                  <li>Use or transfer data to determine creditworthiness or for lending purposes.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Chrome Extension Permissions</h2>
                <p className="mb-4">The Extension requests the following permissions:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li><strong>activeTab:</strong> To read job descriptions from the page you are viewing when you activate the Extension.</li>
                  <li><strong>storage:</strong> To save your preferences and session data.</li>
                  <li><strong>scripting:</strong> To display the Extension's interface and extract job descriptions from the page.</li>
                  <li><strong>downloads:</strong> To allow you to download tailored resumes.</li>
                  <li><strong>Host Permissions:</strong> To read job postings on supported job boards (e.g., LinkedIn, Indeed) for tailoring purposes.</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  These permissions are used only for the Extension's single purpose and are never used to collect unrelated data.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                <ul className="list-disc ml-6 space-y-2">
                  <li>All communications between the Extension/Web App and our servers are encrypted.</li>
                  <li>User accounts are protected with industry-standard security measures.</li>
                  <li>You may request deletion of your data at any time by contacting us.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Data Sharing</h2>
                <p className="mb-4">We may share data only in these cases:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>With service providers that help us operate Profyle (under strict confidentiality agreements).</li>
                  <li>If required by law or to protect our legal rights.</li>
                </ul>
                <p className="font-medium">We never sell user data.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
                <ul className="list-disc ml-6 space-y-2">
                  <li><strong>Access and Control:</strong> You can access, edit, or delete your data through your account settings or by contacting us.</li>
                  <li><strong>Opt-Out:</strong> You can uninstall the Extension at any time.</li>
                  <li><strong>Data Deletion:</strong> Request data deletion by emailing our support team.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Updates to This Policy</h2>
                <p>We may update this Privacy Policy occasionally. If changes are significant, we will notify users through the Web App or Extension.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
                <p className="mb-4">For questions or privacy requests:</p>
                <ul className="space-y-2">
                  <li><strong>Email:</strong> <a href="mailto:junaidasrar04@gmail.com" className="text-primary hover:underline">junaidasrar04@gmail.com</a></li>
                  <li><strong>Website:</strong> <a href="https://www.profyleai.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://www.profyleai.com</a></li>
                </ul>
              </section>
            </div>
          </div>
        </MotionWrapper>
      </main>
      <MotionWrapper animation="fade-in" delay={200}>
        <Footer />
      </MotionWrapper>
    </div>
  )
}