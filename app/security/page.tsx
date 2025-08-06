import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Lock, Database, Eye, AlertTriangle, CheckCircle2, Server, Users, FileCheck, Key } from "lucide-react"

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All data is encrypted using industry-standard AES-256 encryption",
      details: ["Data encrypted in transit and at rest", "Zero-knowledge architecture", "Secure key management"]
    },
    {
      icon: Shield,
      title: "SOC 2 Compliance",
      description: "We maintain SOC 2 Type II compliance for security and availability",
      details: ["Annual security audits", "Continuous monitoring", "Third-party validation"]
    },
    {
      icon: Server,
      title: "Secure Infrastructure",
      description: "Built on enterprise-grade cloud infrastructure with 99.9% uptime",
      details: ["AWS security standards", "Regular security patches", "Redundant systems"]
    },
    {
      icon: Users,
      title: "Access Controls",
      description: "Strict employee access controls and background checks",
      details: ["Role-based permissions", "Multi-factor authentication", "Regular access reviews"]
    },
    {
      icon: Eye,
      title: "Continuous Monitoring",
      description: "24/7 security monitoring and threat detection",
      details: ["Real-time alerts", "Automated threat response", "Security incident tracking"]
    },
    {
      icon: FileCheck,
      title: "Regular Audits",
      description: "Independent security audits and penetration testing",
      details: ["Quarterly penetration tests", "Code security reviews", "Vulnerability assessments"]
    }
  ]

  const certifications = [
    { name: "SOC 2 Type II", description: "Security and availability standards" },
    { name: "GDPR Compliant", description: "European data protection compliance" },
    { name: "CCPA Compliant", description: "California privacy law compliance" },
    { name: "ISO 27001", description: "Information security management" }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Security & Trust</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your data security and privacy are our top priorities. Learn about our comprehensive security measures.
          </p>
        </div>

        {/* Security Promise */}
        <section className="mb-16">
          <Card className="p-8 border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Our Security Promise</h2>
              <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                We employ bank-level security measures to protect your personal information and resume data. 
                Your privacy is never compromised, and your data is never sold or shared with third parties.
              </p>
            </div>
          </Card>
        </section>

        {/* Security Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Enterprise-Grade Security</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg mr-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* Data Protection */}
        <section className="mb-16">
          <div className="flex items-center justify-center mb-8">
            <Database className="h-8 w-8 text-primary mr-3" />
            <h2 className="text-3xl font-bold">Data Protection</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Key className="h-6 w-6 text-primary mr-3" />
                Encryption Standards
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">AES-256 Encryption</p>
                    <p className="text-sm text-muted-foreground">Military-grade encryption for all stored data</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">TLS 1.3</p>
                    <p className="text-sm text-muted-foreground">Latest encryption for data in transit</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Zero-Knowledge</p>
                    <p className="text-sm text-muted-foreground">We cannot access your unencrypted data</p>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Server className="h-6 w-6 text-primary mr-3" />
                Infrastructure Security
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">AWS Infrastructure</p>
                    <p className="text-sm text-muted-foreground">Built on Amazon's secure cloud platform</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Multi-Region Backup</p>
                    <p className="text-sm text-muted-foreground">Data replicated across multiple regions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">DDoS Protection</p>
                    <p className="text-sm text-muted-foreground">Enterprise-level attack mitigation</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Compliance & Certifications */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Compliance & Certifications</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">{cert.name}</h3>
                <p className="text-sm text-muted-foreground">{cert.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Incident Response */}
        <section className="mb-16">
          <div className="flex items-center justify-center mb-8">
            <AlertTriangle className="h-8 w-8 text-primary mr-3" />
            <h2 className="text-3xl font-bold">Incident Response</h2>
          </div>
          
          <Card className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-red-600">1</span>
                </div>
                <h3 className="font-semibold mb-2">Detection</h3>
                <p className="text-sm text-muted-foreground">Automated monitoring systems detect potential threats in real-time</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-yellow-600">2</span>
                </div>
                <h3 className="font-semibold mb-2">Response</h3>
                <p className="text-sm text-muted-foreground">Our security team responds immediately to contain and investigate</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <h3 className="font-semibold mb-2">Communication</h3>
                <p className="text-sm text-muted-foreground">We notify affected users within 72 hours as required by law</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Security Best Practices */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Your Security Best Practices</h2>
          <Card className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 text-lg">Account Security</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span className="text-sm">Use a strong, unique password</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span className="text-sm">Enable two-factor authentication</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span className="text-sm">Keep your browser up to date</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span className="text-sm">Log out from shared devices</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 text-lg">Data Protection</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                    <span className="text-sm">Regularly review your data</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                    <span className="text-sm">Download backups of important documents</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                    <span className="text-sm">Report suspicious activity immediately</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                    <span className="text-sm">Use secure networks for access</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Contact Security Team */}
        <section>
          <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Security Questions or Concerns?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our security team is here to help. Report security issues or ask questions about our security practices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-sm">
                <p className="font-medium">Security Team:</p>
                <p className="text-muted-foreground">junaidasrar04@gmail.com</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Bug Bounty:</p>
                <p className="text-muted-foreground">junaidasrar04@gmail.com</p>
              </div>
            </div>
          </Card>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}