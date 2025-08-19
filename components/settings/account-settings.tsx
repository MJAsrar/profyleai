"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { 
  CreditCard, 
  Crown, 
  Mail, 
  Smartphone, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  Loader2,
  ExternalLink
} from "lucide-react"

interface AccountData {
  id: string
  email: string
  emailVerified?: string
  subscriptionTier: string
  createdAt: string
  accounts: Array<{
    provider: string
    type: string
  }>
  _count: {
    resumes: number
    coverLetters: number
    interviewPreps: number
  }
}

export function AccountSettings() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [accountData, setAccountData] = useState<AccountData | null>(null)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)

  useEffect(() => {
    const fetchAccountData = async () => {
      if (!session?.user?.id) return

      try {
        const response = await fetch('/api/user/account')
        if (response.ok) {
          const data = await response.json()
          setAccountData(data)
        }
      } catch (error) {
        console.error('Error fetching account data:', error)
        toast({
          title: "Error",
          description: "Failed to load account data",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccountData()
  }, [session, toast])

  const getSubscriptionDetails = (tier: string) => {
    switch (tier) {
      case 'PRO':
        return {
          name: 'Pro',
          color: 'bg-gradient-to-r from-blue-600 to-purple-600',
          features: ['Unlimited resumes', 'Advanced templates', 'AI optimization', 'Priority support'],
          price: '$9.99/month'
        }
      case 'ENTERPRISE':
        return {
          name: 'Enterprise',
          color: 'bg-gradient-to-r from-purple-600 to-pink-600',
          features: ['Everything in Pro', 'Team collaboration', 'Custom branding', 'Dedicated support'],
          price: '$29.99/month'
        }
      default:
        return {
          name: 'Free',
          color: 'bg-muted',
          features: ['3 resumes', 'Basic templates', 'Standard support'],
          price: 'Free'
        }
    }
  }

  const handleVerifyEmail = async () => {
    try {
      const response = await fetch('/api/user/verify-email', {
        method: 'POST'
      })
      if (response.ok) {
        toast({
          title: "Verification Email Sent",
          description: "Check your email for verification instructions"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!accountData) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Failed to load account data</p>
        </CardContent>
      </Card>
    )
  }

  const subscription = getSubscriptionDetails(accountData.subscriptionTier)

  return (
    <div className="space-y-6">
      {/* Subscription Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${subscription.color} text-white`}>
                  <Crown className="h-3 w-3 mr-1" />
                  {subscription.name}
                </Badge>
                <span className="text-lg font-semibold">{subscription.price}</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {subscription.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              {accountData.subscriptionTier === 'FREE' ? (
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Upgrade to Pro
                </Button>
              ) : (
                <>
                  <Button variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Billing
                  </Button>
                  <Button variant="ghost" className="text-muted-foreground">
                    Cancel Subscription
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Usage Stats */}
          <div>
            <h4 className="font-medium mb-3">Usage This Month</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-xl font-bold">{accountData._count.resumes}</div>
                <div className="text-xs text-muted-foreground">Resumes</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-xl font-bold">{accountData._count.coverLetters}</div>
                <div className="text-xs text-muted-foreground">Cover Letters</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-xl font-bold">{accountData._count.interviewPreps}</div>
                <div className="text-xs text-muted-foreground">Interviews</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email & Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email & Verification
          </CardTitle>
          <CardDescription>
            Manage your email settings and verification status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{accountData.email}</div>
                <div className="text-sm text-muted-foreground">Primary email address</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {accountData.emailVerified ? (
                <Badge variant="secondary" className="text-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <>
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Unverified
                  </Badge>
                  <Button size="sm" onClick={handleVerifyEmail}>
                    Verify
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Email Preferences */}
          <div className="space-y-4 pt-4">
            <h4 className="font-medium">Email Preferences</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about your account activity
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="marketing-emails">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about new features and tips
                  </p>
                </div>
                <Switch
                  id="marketing-emails"
                  checked={marketingEmails}
                  onCheckedChange={setMarketingEmails}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Connected Accounts
          </CardTitle>
          <CardDescription>
            Manage your connected social accounts and integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accountData.accounts.length > 0 ? (
            <div className="space-y-3">
              {accountData.accounts.map((account, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {account.provider === 'google' && <Mail className="h-4 w-4" />}
                    {account.provider === 'github' && <Globe className="h-4 w-4" />}
                    <div>
                      <div className="font-medium capitalize">{account.provider}</div>
                      <div className="text-sm text-muted-foreground">
                        Connected via {account.type}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Disconnect
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No connected accounts</p>
              <Button variant="outline" className="mt-2">
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Basic information about your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Account ID</Label>
              <p className="font-mono text-xs break-all">{accountData.id}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Member Since</Label>
              <p className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(accountData.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
