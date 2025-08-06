import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Cookie, Settings, BarChart3, Shield, Users, Calendar } from "lucide-react"

export default function CookiesPage() {
  const cookieTypes = [
    {
      icon: Shield,
      title: "Essential Cookies",
      description: "Required for basic site functionality",
      examples: ["Authentication", "Security", "Form submissions"],
      required: true,
      color: "green"
    },
    {
      icon: BarChart3,
      title: "Analytics Cookies",
      description: "Help us understand how you use our site",
      examples: ["Page views", "User flows", "Performance metrics"],
      required: false,
      color: "blue"
    },
    {
      icon: Settings,
      title: "Functional Cookies",
      description: "Remember your preferences and settings",
      examples: ["Language preference", "Theme selection", "Form data"],
      required: false,
      color: "purple"
    },
    {
      icon: Users,
      title: "Marketing Cookies",
      description: "Used to deliver relevant advertisements",
      examples: ["Ad targeting", "Campaign tracking", "Social media"],
      required: false,
      color: "orange"
    }
  ]

  const colorClasses = {
    green: "border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20",
    blue: "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20",
    purple: "border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20",
    orange: "border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20"
  }

  const iconColors = {
    green: "text-green-600",
    blue: "text-blue-600",
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
              <Cookie className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Cookie Policy</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn about how we use cookies to improve your experience on Profyle
          </p>
          <div className="mt-6 text-sm text-muted-foreground">
            Last updated: <span className="font-medium">December 2024</span>
          </div>
        </div>

        {/* What Are Cookies */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Cookie className="h-6 w-6 text-primary mr-3" />
            What Are Cookies?
          </h2>
          <Card className="p-8">
            <p className="text-muted-foreground leading-relaxed mb-4">
              Cookies are small text files that are stored on your computer or mobile device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and allowing us to 
              understand how you use our service.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Good to know:</strong> Cookies don't contain personal information and can't harm your device. 
                You can control how cookies are used through your browser settings.
              </p>
            </div>
          </Card>
        </section>

        {/* Types of Cookies */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-8 text-center">Types of Cookies We Use</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {cookieTypes.map((type, index) => (
              <Card key={index} className={`p-6 ${colorClasses[type.color as keyof typeof colorClasses]}`}>
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-white/60 rounded-lg">
                    <type.icon className={`h-6 w-6 ${iconColors[type.color as keyof typeof iconColors]}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{type.title}</h3>
                      {type.required ? (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Required</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Optional</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Examples:</p>
                      <ul className="text-xs text-muted-foreground">
                        {type.examples.map((example, i) => (
                          <li key={i}>• {example}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Cookie Details */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Cookie Details</h2>
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-lg">Session vs Persistent Cookies</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Session Cookies</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Temporary cookies that are deleted when you close your browser
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Used for login sessions</li>
                    <li>• Form data retention</li>
                    <li>• Shopping cart contents</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Persistent Cookies</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Stored on your device until they expire or you delete them
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Remember login status</li>
                    <li>• Save preferences</li>
                    <li>• Analytics data</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-lg">Third-Party Cookies</h3>
              <p className="text-muted-foreground mb-4">
                We may also use third-party services that set their own cookies:
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <span className="font-medium">Google Analytics</span>
                    <p className="text-sm text-muted-foreground">Helps us understand site usage and performance</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <span className="font-medium">Stripe</span>
                    <p className="text-sm text-muted-foreground">Secure payment processing</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <span className="font-medium">Intercom</span>
                    <p className="text-sm text-muted-foreground">Customer support and live chat</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Managing Cookies */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Settings className="h-6 w-6 text-primary mr-3" />
            <h2 className="text-2xl font-bold">Managing Your Cookie Preferences</h2>
          </div>
          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Browser Settings</h3>
                <p className="text-muted-foreground mb-4">
                  You can control cookies through your browser settings. Here's how to manage cookies in popular browsers:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Chrome:</p>
                    <p className="text-muted-foreground">Settings → Privacy and security → Cookies</p>
                    <p className="font-medium">Firefox:</p>
                    <p className="text-muted-foreground">Settings → Privacy & Security → Cookies</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Safari:</p>
                    <p className="text-muted-foreground">Preferences → Privacy → Cookies</p>
                    <p className="font-medium">Edge:</p>
                    <p className="text-muted-foreground">Settings → Site permissions → Cookies</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Important:</strong> Disabling certain cookies may affect your experience on our website. 
                  Essential cookies are required for basic functionality and cannot be disabled.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Updates */}
        <section>
          <div className="flex items-center mb-6">
            <Calendar className="h-6 w-6 text-primary mr-3" />
            <h2 className="text-2xl font-bold">Updates to This Policy</h2>
          </div>
          <Card className="p-8">
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other 
              operational, legal, or regulatory reasons. Any changes will be posted on this page with an updated 
              "Last Updated" date.
            </p>
            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="text-sm">
                <strong>Stay Informed:</strong> We recommend checking this page periodically to stay informed 
                about how we use cookies.
              </p>
            </div>
          </Card>
        </section>

        {/* Contact */}
        <section className="mt-16">
          <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
            <h2 className="text-2xl font-bold mb-4">Questions About Cookies?</h2>
            <p className="text-muted-foreground mb-6">
              If you have any questions about our use of cookies, please contact us.
            </p>
            <div className="text-sm text-muted-foreground">
              Email: <span className="font-medium">junaidasrar04@gmail.com</span>
            </div>
          </Card>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}