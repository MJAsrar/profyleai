/**
 * Font Size Controls - UI for adjusting font sizes dynamically
 */

"use client"

import React, { useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { RotateCcw, Type } from 'lucide-react'
import { useFontConfig, useUpdateFontSize, useApplyPreset, useResetToDefaults, getPresetName } from '@/lib/font-config-store'
import { FontSizeConfig, FONT_SIZE_RANGES, FONT_SIZE_PRESETS } from '@/lib/font-config'

export function FontSizeControls() {
  const fontConfig = useFontConfig()
  
  // Use individual selectors for stable function references
  const updateFontSize = useUpdateFontSize()
  const applyPreset = useApplyPreset()
  const resetToDefaults = useResetToDefaults()
  
  // Memoize preset name to prevent infinite re-renders
  const currentPreset = useMemo(() => getPresetName(fontConfig), [fontConfig])

  // Memoize font control configuration to prevent recreation
  const fontControls = useMemo((): Array<{
    key: keyof FontSizeConfig
    label: string
    description: string
    category: 'main' | 'headers' | 'content'
    syncNote?: string
  }> => [
    // Main elements
    { key: 'name', label: 'Name', description: 'Person\'s name', category: 'main' },
    { key: 'sectionHeaders', label: 'Section Headers', description: 'Experience, Education, etc.', category: 'main' },
    
    // Headers within sections - all titles, names, and dates
    { key: 'jobTitle', label: 'Headers', description: 'Job titles, project names, certification names, dates', category: 'headers', syncNote: 'Controls all titles, names, dates, and verification URLs' },
    { key: 'company', label: 'Organizations', description: 'Company names, universities, certification issuers', category: 'headers' },
    
    // Content - descriptions and skills only
    { key: 'content', label: 'Main Body Text', description: 'All descriptions and skills', category: 'content', syncNote: 'Controls summary, experience descriptions, project descriptions, certification descriptions, and all skills content' },
    { key: 'contact', label: 'Contact Info', description: 'Email, phone, address', category: 'content' },
  ], [])

  const handleSliderChange = useCallback((key: keyof FontSizeConfig, value: number[]) => {
    const newSize = value[0]
    updateFontSize(key, newSize)
    
    // Headers: Controls all titles, names, dates, and verification URLs
    if (key === 'jobTitle') {
      updateFontSize('dates', newSize)
      updateFontSize('projectTitle', newSize)
      updateFontSize('certificationName', newSize)
      updateFontSize('certificationDate', newSize)
      updateFontSize('projectLink', newSize) // Verification URLs
    }
    
    // Organizations: Controls company names, universities, certification issuers
    else if (key === 'company') {
      updateFontSize('certificationIssuer', newSize)
    }
    
    // Main Body Text: Controls only descriptions and skills content
    else if (key === 'content') {
      updateFontSize('summary', newSize)
      updateFontSize('bulletPoints', newSize)
      updateFontSize('skillCategory', newSize)
      updateFontSize('skillItems', newSize)
      updateFontSize('projectDescription', newSize)
      updateFontSize('certificationDetails', newSize)
    }
  }, [updateFontSize])

  const handlePresetChange = useCallback((preset: string) => {
    if (preset === 'none') return // Don't do anything for custom/none selection
    applyPreset(preset as keyof typeof FONT_SIZE_PRESETS)
  }, [applyPreset])

  const groupedControls = useMemo(() => ({
    main: fontControls.filter(c => c.category === 'main'),
    headers: fontControls.filter(c => c.category === 'headers'),
    content: fontControls.filter(c => c.category === 'content'),
  }), [fontControls])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            <CardTitle>Font Sizes</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {currentPreset && (
              <Badge variant="secondary" className="text-xs">
                {currentPreset}
              </Badge>
            )}
            {!currentPreset && (
              <Badge variant="outline" className="text-xs">
                Custom
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Preset Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Presets</Label>
          <Select 
            value={currentPreset || 'none'} 
            onValueChange={handlePresetChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a preset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="large">Large</SelectItem>
              <SelectItem value="none">Custom (Manual)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Elements */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-blue-600">Main Elements</Label>
          {groupedControls.main.map(control => (
            <FontSizeSlider
              key={control.key}
              label={control.label}
              description={control.description}
              value={fontConfig[control.key]}
              onChange={(value) => handleSliderChange(control.key, [value])}
              syncNote={control.syncNote}
            />
          ))}
        </div>

        {/* Section Headers */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-green-600">Headers Within Sections</Label>
          {groupedControls.headers.map(control => (
            <FontSizeSlider
              key={control.key}
              label={control.label}
              description={control.description}
              value={fontConfig[control.key]}
              onChange={(value) => handleSliderChange(control.key, [value])}
              syncNote={control.syncNote}
            />
          ))}
        </div>

        {/* Content */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-purple-600">Body Text</Label>
          {groupedControls.content.map(control => (
            <FontSizeSlider
              key={control.key}
              label={control.label}
              description={control.description}
              value={fontConfig[control.key]}
              onChange={(value) => handleSliderChange(control.key, [value])}
              syncNote={control.syncNote}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface FontSizeSliderProps {
  label: string
  description: string
  value: number
  onChange: (value: number) => void
  syncNote?: string
}

const FontSizeSlider = React.memo<FontSizeSliderProps>(({ label, description, value, onChange, syncNote }) => {
  const handleChange = useCallback((values: number[]) => {
    onChange(values[0])
  }, [onChange])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          <p className="text-xs text-muted-foreground">{description}</p>
          {syncNote && (
            <p className="text-xs text-blue-600 font-medium mt-1">
              🔗 {syncNote}
            </p>
          )}
        </div>
        <Badge variant="outline" className="text-xs">
          {value}pt
        </Badge>
      </div>
      <Slider
        value={[value]}
        onValueChange={handleChange}
        min={FONT_SIZE_RANGES.min}
        max={FONT_SIZE_RANGES.max}
        step={FONT_SIZE_RANGES.step}
        className="w-full"
      />
    </div>
  )
})

FontSizeSlider.displayName = 'FontSizeSlider'