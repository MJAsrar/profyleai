/**
 * Font configuration store for managing dynamic font sizes
 * Uses Zustand for state management
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FontSizeConfig, DEFAULT_FONT_SIZES, createFontConfig, FONT_SIZE_PRESETS } from './font-config'

interface FontConfigState {
  // Current font configuration
  fontConfig: FontSizeConfig
  
  // Actions
  updateFontSize: (element: keyof FontSizeConfig, size: number) => void
  updateAllFontSizes: (config: Partial<FontSizeConfig>) => void
  resetToDefaults: () => void
  applyPreset: (preset: keyof typeof FONT_SIZE_PRESETS) => void
  
  // Utility getters
  getFontSize: (element: keyof FontSizeConfig) => number
}

export const useFontConfigStore = create<FontConfigState>()(
  persist(
    (set, get) => ({
      // Initial state
      fontConfig: DEFAULT_FONT_SIZES,
      
      // Update a single font size with syncing logic
      updateFontSize: (element: keyof FontSizeConfig, size: number) => 
        set((state) => {
          const newConfig = { ...state.fontConfig }
          
          // Apply the primary change
          newConfig[element] = size
          
          // Sync related elements based on user requirements
          if (element === 'jobTitle') {
            // Job titles and dates should scale together
            const ratio = size / state.fontConfig.jobTitle
            newConfig.dates = Math.round(state.fontConfig.dates * ratio)
          } else if (element === 'dates') {
            // If dates are changed, scale job titles proportionally
            const ratio = size / state.fontConfig.dates
            newConfig.jobTitle = Math.round(state.fontConfig.jobTitle * ratio)
          } 
          // Note: Content elements now map directly to 'content' in CSS engine, 
          // so no manual syncing needed for summary, skills, bulletPoints, etc.
          
          return { fontConfig: newConfig }
        }),
      
      // Update multiple font sizes at once
      updateAllFontSizes: (config: Partial<FontSizeConfig>) =>
        set((state) => ({
          fontConfig: createFontConfig({
            ...state.fontConfig,
            ...config
          })
        })),
      
      // Reset to default font sizes
      resetToDefaults: () =>
        set({ fontConfig: DEFAULT_FONT_SIZES }),
      
      // Apply a preset configuration
      applyPreset: (preset: keyof typeof FONT_SIZE_PRESETS) =>
        set({ fontConfig: { ...FONT_SIZE_PRESETS[preset] } as FontSizeConfig }),
      
      // Get a specific font size
      getFontSize: (element: keyof FontSizeConfig) => 
        get().fontConfig[element],
    }),
    {
      name: 'font-config-storage',
      version: 1,
      partialize: (state) => ({ fontConfig: state.fontConfig }),
    }
  )
)

// Memoized selector for font config to prevent unnecessary re-renders
const fontConfigSelector = (state: FontConfigState) => state.fontConfig

// Hook for easy access to just the font config
export const useFontConfig = () => useFontConfigStore(fontConfigSelector)

// Individual selectors for stable function references
export const useUpdateFontSize = () => useFontConfigStore((state) => state.updateFontSize)
export const useUpdateAllFontSizes = () => useFontConfigStore((state) => state.updateAllFontSizes)
export const useResetToDefaults = () => useFontConfigStore((state) => state.resetToDefaults)
export const useApplyPreset = () => useFontConfigStore((state) => state.applyPreset)
export const useGetFontSize = () => useFontConfigStore((state) => state.getFontSize)

// Helper function to check if current config matches a preset
export function getPresetName(fontConfig: FontSizeConfig): string | null {
  // Check each preset for exact match
  for (const [name, preset] of Object.entries(FONT_SIZE_PRESETS)) {
    const presetConfig = preset as FontSizeConfig
    const isMatch = Object.keys(preset).every(
      key => fontConfig[key as keyof FontSizeConfig] === presetConfig[key as keyof FontSizeConfig]
    )
    if (isMatch) return name
  }
  
  return null // Custom configuration
}