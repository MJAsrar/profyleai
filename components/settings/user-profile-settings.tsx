"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, User, Mail, Calendar, Crown, CheckCircle2 } from "lucide-react"

interface UserProfile {
  id: string
  name: string | null
  email: string
  image?: string | null
  subscriptionTier: string
  emailVerified?: string | null
  createdAt: string
  updatedAt: string
}

export function UserProfileSettings() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    name: ""
  })

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return

      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
          setFormData({
            name: data.name || ""
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [session, toast])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        toast({
          title: "Success",
          description: "Profile updated successfully"
        })
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case 'PRO':
        return <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"><Crown className="h-3 w-3 mr-1" />Pro</Badge>
      case 'ENTERPRISE':
        return <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"><Crown className="h-3 w-3 mr-1" />Enterprise</Badge>
      default:
        return <Badge variant="secondary">Free</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Failed to load profile data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and professional details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/30 rounded-lg">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.image ?? undefined} alt={profile.name ?? undefined} />
              <AvatarFallback className="text-lg">
                {profile.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="text-xl font-semibold">{profile.name || "Unnamed User"}</h3>
                {getSubscriptionBadge(profile.subscriptionTier)}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{profile.email}</span>
                {profile.emailVerified && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Change Photo
            </Button>
          </div>

          {/* Profile Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
              />
              <p className="text-sm text-muted-foreground">
                This is your display name that will appear on your resumes and throughout the application.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your account details and subscription status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold text-primary">{profile.subscriptionTier}</div>
              <div className="text-sm text-muted-foreground">Subscription Plan</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold text-primary">
                {profile.emailVerified ? 'Verified' : 'Unverified'}
              </div>
              <div className="text-sm text-muted-foreground">Email Status</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold text-primary">
                {new Date(profile.createdAt).toLocaleDateString()}
              </div>
              <div className="text-sm text-muted-foreground">Member Since</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
