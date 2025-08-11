"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Edit, Save, X } from "lucide-react"
import { useResumeStore } from "@/lib/resume-store"

export function EducationForm() {
  const { resumeData, addEducation, updateEducation, removeEducation } = useResumeStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>(null)
  const [newEducation, setNewEducation] = useState({
    institution: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    gpa: "",
  })

  const handleAddEducation = () => {
    if (newEducation.institution && newEducation.degree) {
      addEducation(newEducation)
      setNewEducation({
        institution: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        gpa: "",
      })
      setShowAddForm(false)
    }
  }

  const handleEditEducation = (edu: any) => {
    setEditingId(edu.id)
    setEditData({ ...edu })
  }

  const handleSaveEdit = () => {
    if (editData && editingId && editData.institution && editData.degree) {
      updateEducation(editingId, editData)
      setEditingId(null)
      setEditData(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditData(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Education</h3>
        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Education
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Education</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="institution">Institution *</Label>
                <Input
                  id="institution"
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                  placeholder="University Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="degree">Degree *</Label>
                <Input
                  id="degree"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                  placeholder="Bachelor of Science"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field">Field of Study</Label>
                <Input
                  id="field"
                  value={newEducation.field}
                  onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
                  placeholder="Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpa">GPA (Optional)</Label>
                <Input
                  id="gpa"
                  value={newEducation.gpa}
                  onChange={(e) => setNewEducation({ ...newEducation, gpa: e.target.value })}
                  placeholder="3.8"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="month"
                  value={newEducation.startDate}
                  onChange={(e) => setNewEducation({ ...newEducation, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="month"
                  value={newEducation.endDate}
                  onChange={(e) => setNewEducation({ ...newEducation, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddEducation}>Add Education</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {resumeData.education.map((edu) => (
          <Card key={edu.id}>
            <CardContent className="pt-6">
              {editingId === edu.id ? (
                // Edit mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`edit-institution-${edu.id}`}>Institution *</Label>
                      <Input
                        id={`edit-institution-${edu.id}`}
                        value={editData?.institution || ""}
                        onChange={(e) => setEditData({ ...editData, institution: e.target.value })}
                        placeholder="University Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-degree-${edu.id}`}>Degree *</Label>
                      <Input
                        id={`edit-degree-${edu.id}`}
                        value={editData?.degree || ""}
                        onChange={(e) => setEditData({ ...editData, degree: e.target.value })}
                        placeholder="Bachelor of Science"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`edit-field-${edu.id}`}>Field of Study</Label>
                      <Input
                        id={`edit-field-${edu.id}`}
                        value={editData?.field || ""}
                        onChange={(e) => setEditData({ ...editData, field: e.target.value })}
                        placeholder="Computer Science"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-gpa-${edu.id}`}>GPA (Optional)</Label>
                      <Input
                        id={`edit-gpa-${edu.id}`}
                        value={editData?.gpa || ""}
                        onChange={(e) => setEditData({ ...editData, gpa: e.target.value })}
                        placeholder="3.8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`edit-startDate-${edu.id}`}>Start Date</Label>
                      <Input
                        id={`edit-startDate-${edu.id}`}
                        type="month"
                        value={editData?.startDate || ""}
                        onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-endDate-${edu.id}`}>End Date</Label>
                      <Input
                        id={`edit-endDate-${edu.id}`}
                        type="month"
                        value={editData?.endDate || ""}
                        onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                      />
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
                    <h4 className="font-semibold">{edu.degree}</h4>
                    <p className="text-muted-foreground">{edu.institution}</p>
                    {edu.field && <p className="text-sm text-muted-foreground">{edu.field}</p>}
                    <p className="text-sm text-muted-foreground">
                      {edu.startDate} - {edu.endDate}
                      {edu.gpa && ` • GPA: ${edu.gpa}`}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditEducation(edu)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeEducation(edu.id)}>
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
