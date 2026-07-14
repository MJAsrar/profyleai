"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, X, Sparkles, Loader2, Edit, Save } from "lucide-react"
import { useResumeStore } from "@/lib/resume-store"
import { useToast } from "@/hooks/use-toast"
import type { ProjectItem } from "@/lib/validations/resume"

export function ProjectsForm() {
  const projects = useResumeStore((s) => s.resumeData.projects)
  const addProject = useResumeStore((s) => s.addProject)
  const updateProject = useResumeStore((s) => s.updateProject)
  const removeProject = useResumeStore((s) => s.removeProject)
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizingId, setOptimizingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>(null)
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    technologies: [] as string[],
    url: "",
  })
  const [currentTech, setCurrentTech] = useState("")

  const handleAddTechnology = () => {
    if (currentTech.trim()) {
      setNewProject({
        ...newProject,
        technologies: [...newProject.technologies, currentTech.trim()],
      })
      setCurrentTech("")
    }
  }

  const handleRemoveTechnology = (index: number) => {
    setNewProject({
      ...newProject,
      technologies: newProject.technologies.filter((_, i) => i !== index),
    })
  }

  const handleAddProject = () => {
    if (newProject.name && newProject.description) {
      addProject(newProject as unknown as Omit<ProjectItem, "id">)
      setNewProject({
        name: "",
        description: "",
        technologies: [],
        url: "",
      })
      setShowAddForm(false)
    }
  }

  const handleEditProject = (project: any) => {
    setEditingId(project.id)
    setEditData({ ...project })
  }

  const handleSaveEdit = () => {
    if (editData && editingId && editData.name && editData.description) {
      updateProject(editingId, editData)
      setEditingId(null)
      setEditData(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditData(null)
  }

  const handleAddTechnologyToEdit = () => {
    if (currentTech.trim() && editData) {
      setEditData({
        ...editData,
        technologies: [...editData.technologies, currentTech.trim()]
      })
      setCurrentTech("")
    }
  }

  const handleRemoveTechnologyFromEdit = (index: number) => {
    if (editData) {
      setEditData({
        ...editData,
        technologies: editData.technologies.filter((_: string, i: number) => i !== index)
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (editingId) {
        handleAddTechnologyToEdit()
      } else {
        handleAddTechnology()
      }
    }
  }

  const optimizeProjectDescription = async (projectName: string | undefined, currentDescription: string | undefined, projectId?: string) => {
    if (!currentDescription || currentDescription.trim().length === 0) {
      toast({
        title: "No content to optimize",
        description: "Please write some content first, then click optimize to improve it.",
        variant: "destructive"
      })
      return
    }

    const isNewProject = !projectId
    if (isNewProject) {
      setIsOptimizing(true)
    } else {
      setOptimizingId(projectId)
    }

    try {
      const response = await fetch('/api/optimize-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentDescription,
          contentType: 'project',
          context: {
            projectName: projectName
          }
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to optimize content')
      }

      if (result.success && result.data) {
        if (isNewProject) {
          setNewProject({ ...newProject, description: result.data.optimizedContent })
        } else {
          updateProject(projectId, { description: result.data.optimizedContent })
        }
        
        toast({
          title: "Project description optimized!",
          description: `Improved with: ${result.data.improvements.slice(0, 2).join(', ')}${result.data.improvements.length > 2 ? '...' : ''}`,
        })
      }
    } catch (error) {
      console.error('Error optimizing project description:', error)
      toast({
        title: "Optimization failed",
        description: error instanceof Error ? error.message : "Failed to optimize content. Please try again.",
        variant: "destructive"
      })
    } finally {
      if (isNewProject) {
        setIsOptimizing(false)
      } else {
        setOptimizingId(null)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="max-w-[42ch] text-[13px] leading-relaxed text-ink-muted">Optional. Worth adding when the work says something your job titles don&apos;t.</p>
        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="My Awesome Project"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectUrl">Project URL (Optional)</Label>
                <Input
                  id="projectUrl"
                  value={newProject.url}
                  onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
                  placeholder="https://github.com/username/project"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="projectDescription">Description *</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => optimizeProjectDescription(newProject.name, newProject.description)}
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
                id="projectDescription"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Describe what the project does, your role, and key achievements..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technology">Technologies Used</Label>
              <div className="flex gap-2">
                <Input
                  id="technology"
                  value={currentTech}
                  onChange={(e) => setCurrentTech(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a technology and press Enter"
                />
                <Button type="button" onClick={handleAddTechnology}>
                  Add
                </Button>
              </div>
            </div>

            {newProject.technologies.length > 0 && (
              <div className="space-y-2">
                <Label>Technologies:</Label>
                <div className="flex flex-wrap gap-2">
                  {newProject.technologies.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tech}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTechnology(index)} />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleAddProject}>Add Project</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardContent className="pt-6">
              {editingId === project.id ? (
                // Edit mode
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`edit-name-${project.id}`}>Project Name *</Label>
                    <Input
                      id={`edit-name-${project.id}`}
                      value={editData?.name || ""}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      placeholder="My Awesome Project"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`edit-url-${project.id}`}>Project URL</Label>
                    <Input
                      id={`edit-url-${project.id}`}
                      type="url"
                      value={editData?.url || ""}
                      onChange={(e) => setEditData({ ...editData, url: e.target.value })}
                      placeholder="https://github.com/username/project"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`edit-description-${project.id}`}>Description *</Label>
                    <div className="flex gap-2">
                      <Textarea
                        id={`edit-description-${project.id}`}
                        value={editData?.description || ""}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        placeholder="Describe what the project does, technologies used, and your contributions..."
                        className="min-h-[100px] flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => optimizeProjectDescription(editData?.name, editData?.description, project.id)}
                        disabled={optimizingId === project.id}
                        className="self-start"
                      >
                        {optimizingId === project.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`edit-tech-${project.id}`}>Technologies</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`edit-tech-${project.id}`}
                        value={currentTech}
                        onChange={(e) => setCurrentTech(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter technology and press Enter"
                        className="flex-1"
                      />
                      <Button onClick={handleAddTechnologyToEdit} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {editData?.technologies && editData.technologies.length > 0 && (
                    <div className="space-y-2">
                      <Label>Technologies:</Label>
                      <div className="flex flex-wrap gap-2">
                        {editData.technologies.map((tech: string, index: number) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tech}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTechnologyFromEdit(index)} />
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
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{project.name}</h4>
                      {(project as { url?: string }).url && (
                        <a
                          href={(project as { url?: string }).url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          View Project
                        </a>
                      )}
                    </div>
                    <div className="mb-2">
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-muted-foreground flex-1 mr-2">{project.description}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => optimizeProjectDescription(project.name, project.description, project.id)}
                          disabled={optimizingId === project.id}
                        >
                          {optimizingId === project.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditProject(project)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeProject(project.id ?? "")}>
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
