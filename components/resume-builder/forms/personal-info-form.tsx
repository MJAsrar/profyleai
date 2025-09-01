"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useResumeStore } from "@/lib/resume-store"

export function PersonalInfoForm() {
  const { resumeData, updatePersonalInfo } = useResumeStore()
  const { personalInfo } = resumeData

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={personalInfo.fullName}
            onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="professionalTitle">Professional Title</Label>
          <Input
            id="professionalTitle"
            value={personalInfo.professionalTitle}
            onChange={(e) => updatePersonalInfo({ professionalTitle: e.target.value })}
            placeholder="Software Engineer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={personalInfo.email}
            onChange={(e) => updatePersonalInfo({ email: e.target.value })}
            placeholder="john@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={personalInfo.phone}
            onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={personalInfo.location}
            onChange={(e) => updatePersonalInfo({ location: e.target.value })}
            placeholder="New York, NY"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={personalInfo.website}
            onChange={(e) => updatePersonalInfo({ website: e.target.value })}
            placeholder="https://johndoe.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            value={personalInfo.linkedin}
            onChange={(e) => updatePersonalInfo({ linkedin: e.target.value })}
            placeholder="https://linkedin.com/in/johndoe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            value={personalInfo.github}
            onChange={(e) => updatePersonalInfo({ github: e.target.value })}
            placeholder="https://github.com/johndoe"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolio">Portfolio</Label>
        <Input
          id="portfolio"
          value={personalInfo.portfolio}
          onChange={(e) => updatePersonalInfo({ portfolio: e.target.value })}
          placeholder="https://portfolio.johndoe.com"
        />
      </div>
    </div>
  )
}
