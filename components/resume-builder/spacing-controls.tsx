/**
 * Spacing Controls - UI for adjusting spacing and gaps dynamically
 * Based on font-size-controls.tsx pattern
 */

"use client"

import React, { useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { RotateCcw, Move } from 'lucide-react'
import { 
  useSpacingConfig, 
  useUpdateSpacing, 
  useApplySpacingPreset, 
  useResetSpacingToDefaults, 
  useSpacingPresetName 
} from '@/lib/spacing-config-store'
import { 
  SpacingConfig, 
  SPACING_RANGES, 
  SPACING_PRESETS, 
  SPACING_DESCRIPTIONS,
  SpacingPresetName 
} from '@/lib/spacing-config'

export function SpacingControls() {
  const spacingConfig = useSpacingConfig()
  
  // Use individual selectors for stable function references
  const updateSpacing = useUpdateSpacing()
  const applyPreset = useApplySpacingPreset()
  const resetToDefaults = useResetSpacingToDefaults()
  
  // Memoize preset name to prevent infinite re-renders
  const currentPreset = useSpacingPresetName()

  // Memoize spacing control configuration to prevent recreation
  const spacingControls = useMemo((): Array<{
    key: keyof SpacingConfig
    label: string
    description: string
    category: 'header' | 'sections' | 'content'
    unit: string
  }> => [
    // Header spacing
    { key: 'nameToTitle', label: 'Name to Title', description: SPACING_DESCRIPTIONS.nameToTitle, category: 'header', unit: 'pt' },
    { key: 'titleToContact', label: 'Title to Contact', description: SPACING_DESCRIPTIONS.titleToContact, category: 'header', unit: 'pt' },
    { key: 'headerToContent', label: 'Header to Content', description: SPACING_DESCRIPTIONS.headerToContent, category: 'header', unit: 'pt' },
    
    // Section spacing
    { key: 'sectionGaps', label: 'Section Gaps', description: SPACING_DESCRIPTIONS.sectionGaps, category: 'sections', unit: 'pt' },
    { key: 'sectionTitleGaps', label: 'Section Title Gaps', description: SPACING_DESCRIPTIONS.sectionTitleGaps, category: 'sections', unit: 'pt' },
    
    // Content spacing
    { key: 'itemSpacing', label: 'Item Spacing', description: SPACING_DESCRIPTIONS.itemSpacing, category: 'content', unit: 'pt' },
    { key: 'bulletSpacing', label: 'Bullet Spacing', description: SPACING_DESCRIPTIONS.bulletSpacing, category: 'content', unit: 'pt' },
    { key: 'lineHeight', label: 'Line Height', description: SPACING_DESCRIPTIONS.lineHeight, category: 'content', unit: 'x' },
  ], [])

  const handleSliderChange = useCallback((key: keyof SpacingConfig, value: number[]) => {
    const newValue = value[0]
    updateSpacing(key, newValue)
  }, [updateSpacing])

  const handlePresetChange = useCallback((preset: string) => {
    if (preset === 'custom') return // Don't do anything for custom selection
    applyPreset(preset as SpacingPresetName)
  }, [applyPreset])

  const groupedControls = useMemo(() => ({
    header: spacingControls.filter(c => c.category === 'header'),
    sections: spacingControls.filter(c => c.category === 'sections'),
    content: spacingControls.filter(c => c.category === 'content'),
  }), [spacingControls])

  return (
    <CollapsibleSection
      title="Spacing Controls"
      icon={<Move className="h-5 w-5 text-purple-600" />}
      defaultExpanded={true}
      className="w-full"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              {currentPreset ? currentPreset.charAt(0).toUpperCase() + currentPreset.slice(1).replace('-', ' ') : 'Custom'}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="flex items-center gap-1 text-xs"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>
        
        {/* Preset Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Presets</Label>
          <Select value={currentPreset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select spacing preset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ultra-compact">Ultra Compact</SelectItem>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="spacious">Spacious</SelectItem>
              <SelectItem value="ultra-spacious">Ultra Spacious</SelectItem>
              {currentPreset === 'custom' && (
                <SelectItem value="custom">Custom</SelectItem>
              )}
            </SelectContent>
          </Select>
          {currentPreset === 'custom' && (
            <p className="text-xs text-muted-foreground">
              Custom spacing configuration detected
            </p>
          )}
        </div>
        {/* Header Spacing */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-blue-600">Header Spacing</Label>
          {groupedControls.header.map(control => (
            <SpacingSlider
              key={control.key}
              label={control.label}
              description={control.description}
              value={spacingConfig[control.key]}
              onChange={(value) => handleSliderChange(control.key, [value])}
              min={SPACING_RANGES[control.key].min}
              max={SPACING_RANGES[control.key].max}
              step={SPACING_RANGES[control.key].step}
              unit={control.unit}
            />
          ))}
        </div>

        {/* Section Spacing */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-green-600">Section Spacing</Label>
          {groupedControls.sections.map(control => (
            <SpacingSlider
              key={control.key}
              label={control.label}
              description={control.description}
              value={spacingConfig[control.key]}
              onChange={(value) => handleSliderChange(control.key, [value])}
              min={SPACING_RANGES[control.key].min}
              max={SPACING_RANGES[control.key].max}
              step={SPACING_RANGES[control.key].step}
              unit={control.unit}
            />
          ))}
        </div>

        {/* Content Spacing */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-purple-600">Content Spacing</Label>
          {groupedControls.content.map(control => (
            <SpacingSlider
              key={control.key}
              label={control.label}
              description={control.description}
              value={spacingConfig[control.key]}
              onChange={(value) => handleSliderChange(control.key, [value])}
              min={SPACING_RANGES[control.key].min}
              max={SPACING_RANGES[control.key].max}
              step={SPACING_RANGES[control.key].step}
              unit={control.unit}
            />
          ))}
        </div>
      </div>
    </CollapsibleSection>
  )
}

interface SpacingSliderProps {
  label: string
  description: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  unit: string
}

const SpacingSlider = React.memo<SpacingSliderProps>(({ 
  label, 
  description, 
  value, 
  onChange, 
  min, 
  max, 
  step, 
  unit 
}) => {
  const handleChange = useCallback((values: number[]) => {
    onChange(values[0])
  }, [onChange])

  const displayValue = unit === 'x' ? value.toFixed(1) : Math.round(value * 10) / 10

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {displayValue}{unit}
        </Badge>
      </div>
      <Slider
        value={[value]}
        onValueChange={handleChange}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  )
})

SpacingSlider.displayName = 'SpacingSlider'
