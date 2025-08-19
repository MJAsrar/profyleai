"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import { 
  Palette, 
  Globe, 
  Volume2, 
  Moon, 
  Sun, 
  Monitor,
  Loader2,
  Save,
  RotateCcw,
  Bell,
  Zap,
  FileText,
  Eye
} from "lucide-react"

interface PreferencesData {
  theme: string
  language: string
  timezone: string
  dateFormat: string
  autoSave: boolean
  notifications: {
    email: boolean
    push: boolean
    sound: boolean
  }
  resume: {
    defaultTemplate: string
    autoOptimize: boolean
    showTips: boolean
  }
  privacy: {
    analytics: boolean
    crashReports: boolean
  }
}

export function PreferencesSettings() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [preferences, setPreferences] = useState<PreferencesData>({
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    autoSave: true,
    notifications: {
      email: true,
      push: true,
      sound: false
    },
    resume: {
      defaultTemplate: 'modern',
      autoOptimize: true,
      showTips: true
    },
    privacy: {
      analytics: true,
      crashReports: true
    }
  })

  useEffect(() => {
    const loadPreferences = () => {
      try {
        // Load from localStorage
        const savedPreferences = localStorage.getItem('profyle-preferences')
        if (savedPreferences) {
          const parsed = JSON.parse(savedPreferences)
          setPreferences(prev => ({ ...prev, ...parsed }))
        }
      } catch (error) {
        console.error('Error loading preferences:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save to localStorage
      localStorage.setItem('profyle-preferences', JSON.stringify(preferences))
      
      toast({
        title: "Success",
        description: "Preferences saved successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    const defaultPrefs = {
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      autoSave: true,
      notifications: {
        email: true,
        push: true,
        sound: false
      },
      resume: {
        defaultTemplate: 'modern',
        autoOptimize: true,
        showTips: true
      },
      privacy: {
        analytics: true,
        crashReports: true
      }
    }
    
    setPreferences(defaultPrefs)
    localStorage.setItem('profyle-preferences', JSON.stringify(defaultPrefs))
    
    toast({
      title: "Reset Complete",
      description: "All preferences have been reset to defaults"
    })
  }

  const updatePreference = (path: string, value: any) => {
    setPreferences(prev => {
      const keys = path.split('.')
      const newPrefs = { ...prev }
      let current: any = newPrefs
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newPrefs
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how the application looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Theme</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Choose your preferred color theme
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'system', label: 'System', icon: Monitor }
                ].map((themeOption) => (
                  <button
                    key={themeOption.value}
                    onClick={() => {
                      setTheme(themeOption.value)
                      updatePreference('theme', themeOption.value)
                    }}
                    className={`p-4 border rounded-lg text-center transition-all hover:shadow-md ${
                      preferences.theme === themeOption.value 
                        ? 'border-primary bg-primary/10' 
                        : 'hover:border-muted-foreground/50'
                    }`}
                  >
                    <themeOption.icon className={`h-6 w-6 mx-auto mb-2 ${
                      preferences.theme === themeOption.value ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <div className="text-sm font-medium">{themeOption.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language & Region
          </CardTitle>
          <CardDescription>
            Set your language, timezone, and regional preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select 
                value={preferences.language} 
                onValueChange={(value) => updatePreference('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select 
                value={preferences.dateFormat} 
                onValueChange={(value) => updatePreference('dateFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  <SelectItem value="MMM DD, YYYY">MMM DD, YYYY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Control how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={preferences.notifications.email}
                onCheckedChange={(checked) => updatePreference('notifications.email', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive browser push notifications
                </p>
              </div>
              <Switch
                checked={preferences.notifications.push}
                onCheckedChange={(checked) => updatePreference('notifications.push', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Sound Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Play sounds for notifications
                </p>
              </div>
              <Switch
                checked={preferences.notifications.sound}
                onCheckedChange={(checked) => updatePreference('notifications.sound', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resume Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resume Preferences
          </CardTitle>
          <CardDescription>
            Set default options for resume creation and editing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Default Template</Label>
              <Select 
                value={preferences.resume.defaultTemplate} 
                onValueChange={(value) => updatePreference('resume.defaultTemplate', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="ats">ATS-Friendly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-save</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save changes as you type
                </p>
              </div>
              <Switch
                checked={preferences.autoSave}
                onCheckedChange={(checked) => updatePreference('autoSave', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>AI Optimization</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically optimize content with AI suggestions
                </p>
              </div>
              <Switch
                checked={preferences.resume.autoOptimize}
                onCheckedChange={(checked) => updatePreference('resume.autoOptimize', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Tips</Label>
                <p className="text-sm text-muted-foreground">
                  Display helpful tips while editing
                </p>
              </div>
              <Switch
                checked={preferences.resume.showTips}
                onCheckedChange={(checked) => updatePreference('resume.showTips', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy & Analytics
          </CardTitle>
          <CardDescription>
            Control data collection and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Usage Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Help improve the app by sharing anonymous usage data
                </p>
              </div>
              <Switch
                checked={preferences.privacy.analytics}
                onCheckedChange={(checked) => updatePreference('privacy.analytics', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Crash Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically send crash reports to help fix bugs
                </p>
              </div>
              <Switch
                checked={preferences.privacy.crashReports}
                onCheckedChange={(checked) => updatePreference('privacy.crashReports', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Preferences
        </Button>
      </div>
    </div>
  )
}
