"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, X } from "lucide-react"
import { useResumeStore } from "@/lib/resume-store"

export function SkillsForm() {
  const { resumeData, addSkillCategory, removeSkillCategory } = useResumeStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCategory, setNewCategory] = useState({
    category: "",
    skills: [] as Array<{ name: string; level?: string }>,
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddSkill()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Skills</h3>
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
        {resumeData.skills.map((skillCategory) => (
          <Card key={skillCategory.id}>
            <CardContent className="pt-6">
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
                <Button variant="ghost" size="sm" onClick={() => removeSkillCategory(skillCategory.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
