/**
 * Example of how to integrate font controls into the resume builder
 * Add this to your resume builder sidebar or settings panel
 */

"use client"

import React from 'react'
import { FontSizeControls } from './font-size-controls'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChevronDown, Type } from 'lucide-react'

export function FontControlsIntegration() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button 
          variant="outline" 
          className="flex w-full justify-between items-center p-4 h-auto"
        >
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            <span className="font-medium">Font Sizes</span>
          </div>
          <ChevronDown 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-2">
        <FontSizeControls />
      </CollapsibleContent>
    </Collapsible>
  )
}

// Alternative: Always visible font controls
export function FontControlsAlwaysVisible() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Type className="w-5 h-5" />
        Font Customization
      </h3>
      <FontSizeControls />
    </div>
  )
}