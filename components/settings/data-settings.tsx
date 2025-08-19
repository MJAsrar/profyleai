"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { 
  Database, 
  Download, 
  Trash2, 
  AlertTriangle, 
  Shield, 
  FileText,
  HardDrive,
  Calendar,
  Loader2,
  ExternalLink
} from "lucide-react"

interface DataUsage {
  resumes: number
  coverLetters: number
  interviews: number
  totalSize: string
  lastBackup?: string
}

export function DataSettings() {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dataUsage] = useState<DataUsage>({
    resumes: 5,
    coverLetters: 3,
    interviews: 2,
    totalSize: "2.4 MB",
    lastBackup: "2024-01-15T10:30:00Z"
  })

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/user/export-data', {
        method: 'POST'
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `profyle-data-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        
        toast({
          title: "Export Complete",
          description: "Your data has been exported successfully"
        })
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Are you absolutely sure? This action cannot be undone and will permanently delete your account and all associated data.")) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Account Deleted",
          description: "Your account has been successfully deleted"
        })
        // Redirect to home page after a delay
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } else {
        throw new Error('Deletion failed')
      }
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Overview
          </CardTitle>
          <CardDescription>
            View your data usage and storage information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{dataUsage.resumes}</div>
              <div className="text-sm text-muted-foreground">Resumes</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{dataUsage.coverLetters}</div>
              <div className="text-sm text-muted-foreground">Cover Letters</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{dataUsage.interviews}</div>
              <div className="text-sm text-muted-foreground">Interviews</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Storage Used</span>
                <span>{dataUsage.totalSize} / 100 MB</span>
              </div>
              <Progress value={2.4} className="h-2" />
            </div>
            
            {dataUsage.lastBackup && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Last backup: {new Date(dataUsage.lastBackup).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Your Data
          </CardTitle>
          <CardDescription>
            Download a copy of all your data in a portable format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Data Export Includes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All resumes and their content</li>
              <li>• Cover letters and templates</li>
              <li>• Interview preparation data</li>
              <li>• Account settings and preferences</li>
              <li>• Usage statistics and analytics</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleExportData} disabled={isExporting} className="flex items-center gap-2">
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Request Extended Export
            </Button>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <Shield className="h-4 w-4 inline mr-1" />
              Your exported data will be encrypted and available for download for 7 days.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Data Retention
          </CardTitle>
          <CardDescription>
            Understand how long we keep your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Active Data</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Data you actively use and access
                </p>
                <Badge variant="secondary">Retained indefinitely</Badge>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Deleted Items</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Items you've deleted from your account
                </p>
                <Badge variant="secondary">30 days</Badge>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Analytics Data</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Anonymous usage and performance data
                </p>
                <Badge variant="secondary">24 months</Badge>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Inactive Accounts</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Accounts with no activity
                </p>
                <Badge variant="secondary">12 months</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Controls
          </CardTitle>
          <CardDescription>
            Control how your data is used and shared
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">Data Processing</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    We process your data to provide and improve our services
                  </p>
                </div>
                <Badge variant="secondary">Required</Badge>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">Analytics & Insights</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Anonymous data used to understand usage patterns
                  </p>
                </div>
                <Badge variant="outline">Optional</Badge>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">Marketing Communications</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Product updates and feature announcements
                  </p>
                </div>
                <Badge variant="outline">Optional</Badge>
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Privacy Policy
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-red-200 rounded-lg bg-red-50/50">
            <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
            <p className="text-sm text-red-700 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <div className="space-y-3">
              <div className="text-sm text-red-700">
                <strong>This will delete:</strong>
                <ul className="mt-1 ml-4 list-disc">
                  <li>All resumes and cover letters</li>
                  <li>Interview preparation data</li>
                  <li>Account settings and preferences</li>
                  <li>Usage history and analytics</li>
                </ul>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {isDeleting ? 'Deleting Account...' : 'Delete My Account'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
