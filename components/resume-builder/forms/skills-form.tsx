"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, X, Edit, Save } from "lucide-react"
import { useResumeStore } from "@/lib/resume-store"

export function SkillsForm() {
  const skills = useResumeStore((s) => s.resumeData.skills)
  const addSkillCategory = useResumeStore((s) => s.addSkillCategory)
  const updateSkillCategory = useResumeStore((s) => s.updateSkillCategory)
  const removeSkillCategory = useResumeStore((s) => s.removeSkillCategory)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>(null)
  const [newCategory, setNewCategory] = useState({
    category: "",
    skills: [] as Array<{ name: string; level?: "Beginner" | "Intermediate" | "Advanced" | "Expert" }>,
  })
  const [currentSkill, setCurrentSkill] = useState("")

  const handleAddSkill = () => {
    if (currentSkill.trim()) {
      setNewCategory({
        ...newCategory,
        skills: [...newCategory.skills, { name: currentSkill.trim() }],
      })
      setCurrentSkill("")
    }
  }

  const handleRemoveSkill = (index: number) => {
    setNewCategory({
      ...newCategory,
      skills: newCategory.skills.filter((_, i) => i !== index),
    })
  }

  const handleAddCategory = () => {
    if (newCategory.category && newCategory.skills.length > 0) {
      addSkillCategory(newCategory)
      setNewCategory({ category: "", skills: [] })
      setShowAddForm(false)
    }
  }

  const handleEditSkillCategory = (skillCategory: any) => {
    setEditingId(skillCategory.id)
    setEditData({ 
      ...skillCategory,
      skills: skillCategory.skills || skillCategory.items || [] // Support both old and new formats
    })
  }

  const handleSaveEdit = () => {
    if (editData && editingId && editData.category && editData.skills.length > 0) {
      updateSkillCategory(editingId, editData)
      setEditingId(null)
      setEditData(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditData(null)
  }

  const handleAddSkillToEdit = () => {
    if (currentSkill.trim() && editData) {
      setEditData({
        ...editData,
        skills: [...editData.skills, { name: currentSkill.trim() }]
      })
      setCurrentSkill("")
    }
  }

  const handleRemoveSkillFromEdit = (index: number) => {
    if (editData) {
      setEditData({
        ...editData,
        skills: editData.skills.filter((_: any, i: number) => i !== index)
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (editingId) {
        handleAddSkillToEdit()
      } else {
        handleAddSkill()
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="max-w-[42ch] text-[13px] leading-relaxed text-ink-muted">Group them the way the job posting does. Skip anything you&apos;d dread being tested on.</p>
        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Skill Category
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Skill Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category Name *</Label>
              <Input
                id="category"
                value={newCategory.category}
                onChange={(e) => setNewCategory({ ...newCategory, category: e.target.value })}
                placeholder="e.g., Programming Languages, Tools, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill">Add Skills</Label>
              <div className="flex gap-2">
                <Input
                  id="skill"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a skill and press Enter"
                />
                <Button type="button" onClick={handleAddSkill}>
                  Add
                </Button>
              </div>
            </div>

            {newCategory.skills.length > 0 && (
              <div className="space-y-2">
                <Label>Skills in this category:</Label>
                <div className="flex flex-wrap gap-2">
                  {newCategory.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill.name}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveSkill(index)} />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleAddCategory}>Add Category</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {skills.map((skillCategory) => (
          <Card key={skillCategory.id}>
            <CardContent className="pt-6">
              {editingId === skillCategory.id ? (
                // Edit mode
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`edit-category-${skillCategory.id}`}>Category Name *</Label>
                    <Input
                      id={`edit-category-${skillCategory.id}`}
                      value={editData?.category || ""}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                      placeholder="e.g., Programming Languages, Tools, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`edit-skill-${skillCategory.id}`}>Add Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`edit-skill-${skillCategory.id}`}
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter skill name and press Enter"
                        className="flex-1"
                      />
                      <Button onClick={handleAddSkillToEdit} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {editData?.skills && editData.skills.length > 0 && (
                    <div className="space-y-2">
                      <Label>Skills in this category:</Label>
                      <div className="flex flex-wrap gap-2">
                        {editData.skills.map((skill: any, index: number) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {typeof skill === 'string' ? skill : skill.name}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveSkillFromEdit(index)} />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

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
                    <h4 className="font-semibold mb-2">{skillCategory.category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {(skillCategory.skills || (skillCategory as any).items || []).map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {typeof skill === 'string' ? skill : skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditSkillCategory(skillCategory)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeSkillCategory(skillCategory.id!)}>
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
