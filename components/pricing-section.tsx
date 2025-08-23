"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, GraduationCap, Building2, Coins, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { CreditPurchaseModal } from "@/components/credits/credit-purchase-modal"

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string>("")

  const handlePurchaseClick = (packageId: string) => {
    setSelectedPackage(packageId)
    setShowPurchaseModal(true)
  }
  const plans = [
    {
      id: "free",
      name: "Free",
      monthlyPrice: "$0",
      yearlyPrice: "$0",
      yearlyTotal: "$0",
      description: "Perfect for getting started",
      features: [
        "50 free credits included", 
        "1 Video Interview session", 
        "10 Text Interview sessions",
        "16 Resume Builder uses",
        "25 Resume Tailoring sessions",
        "25 Cover Letter generations",
        "No credit card required"
      ],
      cta: "Start Free Today",
      popular: false,
      credits: 50,
      oneTime: true,
      free: true,
    },
    {
      id: "starter",
      name: "Starter",
      monthlyPrice: "$5",
      yearlyPrice: "$5",
      yearlyTotal: "$5",
      description: "Perfect for trying our services",
      features: [
        "50 credits (≈ $5.00 value)", 
        "1 Video Interview session", 
        "10 Text Interview sessions",
        "16 Resume Builder uses",
        "25 Resume Tailoring sessions",
        "25 Cover Letter generations"
      ],
      cta: "Get 50 Credits",
      popular: false,
      credits: 50,
      oneTime: true,
    },
    {
      id: "premium", 
      name: "Premium",
      monthlyPrice: "$25",
      yearlyPrice: "$25", 
      yearlyTotal: "$25",
      description: "Most popular choice with bonus",
      features: [
        "275 credits (≈ $27.50 value)",
        "5+ Video Interview sessions",
        "55 Text Interview sessions", 
        "90+ Resume Builder uses",
        "135+ Resume Tailoring sessions",
        "135+ Cover Letter generations",
        "10% bonus credits included"
      ],
      cta: "Get 275 Credits",
      popular: true,
      credits: 275,
      oneTime: true,
      savings: "10% bonus",
    },
    {
      id: "pro",
      name: "Pro",
      monthlyPrice: "$50",
      yearlyPrice: "$50",
      yearlyTotal: "$50", 
      description: "For power users and professionals",
      features: [
        "575 credits (≈ $57.50 value)",
        "11+ Video Interview sessions",
        "115 Text Interview sessions",
        "190+ Resume Builder uses", 
        "285+ Resume Tailoring sessions",
        "285+ Cover Letter generations",
        "15% bonus credits included"
      ],
      cta: "Get 575 Credits",
      popular: false,
      credits: 575,
      oneTime: true,
      savings: "15% bonus",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      monthlyPrice: "$100",
      yearlyPrice: "$100",
      yearlyTotal: "$100",
      description: "Maximum value for teams",
      features: [
        "1200 credits (≈ $120.00 value)",
        "24+ Video Interview sessions",
        "240 Text Interview sessions",
        "400+ Resume Builder uses",
        "600+ Resume Tailoring sessions", 
        "600+ Cover Letter generations",
        "20% bonus credits included"
      ],
      cta: "Get 1200 Credits",
      popular: false,
      credits: 1200,
      oneTime: true,
      savings: "20% bonus",
    },
  ]

  return (
    <section id="pricing" className="py-20 bg-muted/50">
      <div className="content-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Start Free, Pay As You Grow</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Begin with 50 free credits - no credit card required. Pay only for what you use. No recurring subscriptions.
          </p>
          
          {/* Credit Info */}
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                <div className="font-medium">Video Interview</div>
                <div className="text-primary font-bold">50 credits</div>
                <div className="text-muted-foreground text-xs">$5.00 value</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                <div className="font-medium">Text Interview</div>
                <div className="text-primary font-bold">5 credits</div>
                <div className="text-muted-foreground text-xs">$0.50 value</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                <div className="font-medium">Resume Builder</div>
                <div className="text-primary font-bold">3 credits</div>
                <div className="text-muted-foreground text-xs">$0.30 value</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                <div className="font-medium">Tailoring & Cover Letters</div>
                <div className="text-primary font-bold">2 credits</div>
                <div className="text-muted-foreground text-xs">$0.20 value</div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-5">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative hover:shadow-md transition-shadow ${plan.popular ? "border-primary shadow-lg scale-105" : ""} ${plan.free ? "border-green-500/50 bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-medium rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              {plan.free && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-3 py-1 text-sm font-medium rounded-full">
                    FREE START
                  </span>
                </div>
              )}
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground text-lg ml-1">
                    one-time
                  </span>
                  <div className="mt-2">
                    <div className="text-primary font-semibold">
                      {plan.credits} credits
                    </div>
                    {plan.savings && (
                      <div className="text-green-600 font-medium text-sm">
                        {plan.savings}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.free ? (
                  <Link href="/signup" className="w-full">
                    <Button 
                      className="w-full bg-green-500 hover:bg-green-600 text-white" 
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {plan.cta}
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handlePurchaseClick(plan.id)}
                  >
                    <Coins className="h-4 w-4 mr-2" />
                    {plan.cta}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
          </div>
        </div>
      </div>

      {/* Credit Purchase Modal */}
      <CreditPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        preselectedPackage={selectedPackage}
      />
    </section>
  )
}
