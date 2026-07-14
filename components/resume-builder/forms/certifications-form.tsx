"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, ExternalLink, Sparkles, Loader2, Edit, Save, X } from "lucide-react"
import { useResumeStore } from "@/lib/resume-store"
import { useToast } from "@/hooks/use-toast"

export function CertificationsForm() {
  const { resumeData, addCertification, updateCertification, removeCertification } = useResumeStore()
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizingId, setOptimizingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>(null)
  const [newCertification, setNewCertification] = useState({
    name: "",
    issuedBy: "",
    issueDate: "",
    expiryDate: "",
    isLifetime: false,
    credentialId: "",
    verificationUrl: "",
    description: "",
  })

  const handleAddCertification = () => {
    if (newCertification.name && newCertification.issuedBy && newCertification.issueDate) {
      addCertification(newCertification)
      setNewCertification({
        name: "",
        issuedBy: "",
        issueDate: "",
        expiryDate: "",
        isLifetime: false,
        credentialId: "",
        verificationUrl: "",
        description: "",
      })
      setShowAddForm(false)
    }
  }

  const handleLifetimeChange = (checked: boolean) => {
    setNewCertification({
      ...newCertification,
      isLifetime: checked,
      expiryDate: checked ? "" : newCertification.expiryDate,
    })
  }

  const handleEditCertification = (cert: any) => {
    setEditingId(cert.id)
    setEditData({ ...cert })
  }

  const handleSaveEdit = () => {
    if (editData && editingId && editData.name && editData.issuedBy && editData.issueDate) {
      updateCertification(editingId, editData)
      setEditingId(null)
      setEditData(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditData(null)
  }

  const handleEditLifetimeChange = (checked: boolean) => {
    setEditData({
      ...editData,
      isLifetime: checked,
      expiryDate: checked ? "" : editData.expiryDate,
    })
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr + '-01') // Add day for YYYY-MM format
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const optimizeCertificationDescription = async (certificationName: string | undefined, currentDescription: string | undefined, certificationId?: string) => {
    if (!currentDescription || currentDescription.trim().length === 0) {
      toast({
        title: "No content to optimize",
        description: "Please write some content first, then click optimize to improve it.",
        variant: "destructive"
      })
      return
    }

    const isNewCertification = !certificationId
    if (isNewCertification) {
      setIsOptimizing(true)
    } else {
      setOptimizingId(certificationId)
    }

    try {
      const response = await fetch('/api/optimize-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentDescription,
          contentType: 'certification',
          context: {
            certificationName: certificationName
          }
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to optimize content')
      }

      if (result.success && result.data) {
        if (isNewCertification) {
          setNewCertification({ ...newCertification, description: result.data.optimizedContent })
        } else {
          updateCertification(certificationId, { description: result.data.optimizedContent })
        }
        
        toast({
          title: "Certification description optimized!",
          description: `Improved with: ${result.data.improvements.slice(0, 2).join(', ')}${result.data.improvements.length > 2 ? '...' : ''}`,
        })
      }
    } catch (error) {
      console.error('Error optimizing certification description:', error)
      toast({
        title: "Optimization failed",
        description: error instanceof Error ? error.message : "Failed to optimize content. Please try again.",
        variant: "destructive"
      })
    } finally {
      if (isNewCertification) {
        setIsOptimizing(false)
      } else {
        setOptimizingId(null)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Certifications</h3>
        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Certification
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Certification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certName">Certification Name *</Label>
                <Input
                  id="certName"
                  value={newCertification.name}
                  onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                  placeholder="AWS Certified Solutions Architect"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certIssuedBy">Issued By *</Label>
                <Input
                  id="certIssuedBy"
                  value={newCertification.issuedBy}
                  onChange={(e) => setNewCertification({ ...newCertification, issuedBy: e.target.value })}
                  placeholder="Amazon Web Services"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certIssueDate">Issue Date *</Label>
                <Input
                  id="certIssueDate"
                  type="month"
                  value={newCertification.issueDate}
                  onChange={(e) => setNewCertification({ ...newCertification, issueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certExpiryDate">Expiry Date</Label>
                <Input
                  id="certExpiryDate"
                  type="month"
                  value={newCertification.expiryDate}
                  onChange={(e) => setNewCertification({ ...newCertification, expiryDate: e.target.value })}
                  disabled={newCertification.isLifetime}
                  placeholder={newCertification.isLifetime ? "Lifetime certification" : ""}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isLifetime"
                checked={newCertification.isLifetime}
                onCheckedChange={handleLifetimeChange}
              />
              <Label htmlFor="isLifetime">This certification has no expiry date (Lifetime)</Label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certCredentialId">Credential ID (Optional)</Label>
                <Input
                  id="certCredentialId"
                  value={newCertification.credentialId}
                  onChange={(e) => setNewCertification({ ...newCertification, credentialId: e.target.value })}
                  placeholder="AWS-SAA-123456"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certVerificationUrl">Verification URL (Optional)</Label>
                <Input
                  id="certVerificationUrl"
                  type="url"
                  value={newCertification.verificationUrl}
                  onChange={(e) => setNewCertification({ ...newCertification, verificationUrl: e.target.value })}
                  placeholder="https://www.credly.com/badges/..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="certDescription">Description (Optional)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => optimizeCertificationDescription(newCertification.name, newCertification.description)}
                  disabled={isOptimizing}
                >
                  {isOptimizing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isOptimizing ? "Optimizing..." : "Optimize with AI"}
                </Button>
              </div>
              <Textarea
                id="certDescription"
                value={newCertification.description}
                onChange={(e) => setNewCertification({ ...newCertification, description: e.target.value })}
                placeholder="Brief description of the certification and its relevance to your expertise..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddCertification}>Add Certification</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {(resumeData.certifications || []).map((cert) => (
          <Card key={cert.id}>
            <CardContent className="pt-6">
              {editingId === cert.id ? (
                // Edit mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`edit-name-${cert.id}`}>Certification Name *</Label>
                      <Input
                        id={`edit-name-${cert.id}`}
                        value={editData?.name || ""}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        placeholder="AWS Solutions Architect"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-issuedBy-${cert.id}`}>Issued By *</Label>
                      <Input
                        id={`edit-issuedBy-${cert.id}`}
                        value={editData?.issuedBy || ""}
                        onChange={(e) => setEditData({ ...editData, issuedBy: e.target.value })}
                        placeholder="Amazon Web Services"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`edit-issueDate-${cert.id}`}>Issue Date *</Label>
                      <Input
                        id={`edit-issueDate-${cert.id}`}
                        type="month"
                        value={editData?.issueDate || ""}
                        onChange={(e) => setEditData({ ...editData, issueDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-expiryDate-${cert.id}`}>Expiry Date</Label>
                      <Input
                        id={`edit-expiryDate-${cert.id}`}
                        type="month"
                        value={editData?.expiryDate || ""}
                        onChange={(e) => setEditData({ ...editData, expiryDate: e.target.value })}
                        disabled={editData?.isLifetime}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-isLifetime-${cert.id}`}
                      checked={editData?.isLifetime || false}
                      onCheckedChange={handleEditLifetimeChange}
                    />
                    <Label htmlFor={`edit-isLifetime-${cert.id}`}>This certification is lifetime</Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`edit-credentialId-${cert.id}`}>Credential ID</Label>
                      <Input
                        id={`edit-credentialId-${cert.id}`}
                        value={editData?.credentialId || ""}
                        onChange={(e) => setEditData({ ...editData, credentialId: e.target.value })}
                        placeholder="ABC123DEF456"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-verificationUrl-${cert.id}`}>Verification URL</Label>
                      <Input
                        id={`edit-verificationUrl-${cert.id}`}
                        type="url"
                        value={editData?.verificationUrl || ""}
                        onChange={(e) => setEditData({ ...editData, verificationUrl: e.target.value })}
                        placeholder="https://verify.example.com/123"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`edit-description-${cert.id}`}>Description</Label>
                    <div className="flex gap-2">
                      <Textarea
                        id={`edit-description-${cert.id}`}
                        value={editData?.description || ""}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        placeholder="Describe what this certification covers and its relevance..."
                        className="min-h-[80px] flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => optimizeCertificationDescription(editData?.name, editData?.description, cert.id)}
                        disabled={optimizingId === cert.id}
                        className="self-start"
                      >
                        {optimizingId === cert.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveEdit} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={handleCancelEdit} size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // Display mode
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{cert.name}</h4>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(cert.issueDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-medium">{cert.issuedBy}</p>
                      <span className="text-sm text-muted-foreground">
                        {cert.isLifetime 
                          ? '• Lifetime' 
                          : cert.expiryDate 
                            ? `• Expires ${formatDate(cert.expiryDate)}`
                            : '• No Expiry'}
                      </span>
                    </div>
                    {cert.credentialId && (
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Credential ID:</strong> {cert.credentialId}
                      </p>
                    )}
                    {cert.verificationUrl && (
                      <div className="mb-2">
                        <a
                          href={cert.verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Verify Certificate
                        </a>
                      </div>
                    )}
                    {cert.description && (
                      <div className="mt-2">
                        <div className="flex items-start justify-between">
                          <p className="text-sm text-muted-foreground flex-1 mr-2">{cert.description}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => optimizeCertificationDescription(cert.name, cert.description, cert.id)}
                            disabled={optimizingId === cert.id}
                          >
                            {optimizingId === cert.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditCertification(cert)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeCertification(cert.id!)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}