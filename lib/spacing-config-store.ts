/**
 * Spacing Configuration Store
 * Zustand store for managing spacing configuration state
 * Based on font-config-store.ts pattern
 */

"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  SpacingConfig, 
  DEFAULT_SPACING, 
  SPACING_PRESETS, 
  SpacingPresetName, 
  createSpacingConfig,
  getSpacingPresetName 
} from './spacing-config'

interface SpacingConfigState {
  spacingConfig: SpacingConfig
  
  // Actions
  updateSpacing: (element: keyof SpacingConfig, value: number) => void
  updateAllSpacing: (config: Partial<SpacingConfig>) => void
  resetToDefaults: () => void
  applyPreset: (preset: SpacingPresetName) => void
  getSpacing: (element: keyof SpacingConfig) => number
}

export const useSpacingConfigStore = create<SpacingConfigState>()(
  persist(
    (set, get) => ({
      // Initial state
      spacingConfig: DEFAULT_SPACING,
      
      // Update a single spacing value
      updateSpacing: (element: keyof SpacingConfig, value: number) => 
        set((state) => {
          const newConfig = { ...state.spacingConfig }
          newConfig[element] = value
          
          return { spacingConfig: createSpacingConfig(newConfig) }
        }),
      
      // Update multiple spacing values at once
      updateAllSpacing: (config: Partial<SpacingConfig>) =>
        set((state) => ({
          spacingConfig: createSpacingConfig({
            ...state.spacingConfig,
            ...config
          })
        })),
      
      // Reset to default spacing values
      resetToDefaults: () =>
        set({ spacingConfig: DEFAULT_SPACING }),
      
      // Apply a preset configuration
      applyPreset: (preset: SpacingPresetName) =>
        set({ spacingConfig: { ...SPACING_PRESETS[preset] } }),
      
      // Get a specific spacing value
      getSpacing: (element: keyof SpacingConfig) => 
        get().spacingConfig[element],
    }),
    {
      name: 'spacing-config-storage',
      version: 1,
    }
  )
)

// Convenient hooks for components
export const useSpacingConfig = () => useSpacingConfigStore(state => state.spacingConfig)
export const useUpdateSpacing = () => useSpacingConfigStore(state => state.updateSpacing)
export const useUpdateAllSpacing = () => useSpacingConfigStore(state => state.updateAllSpacing)
export const useApplySpacingPreset = () => useSpacingConfigStore(state => state.applyPreset)
export const useResetSpacingToDefaults = () => useSpacingConfigStore(state => state.resetToDefaults)
export const useGetSpacing = () => useSpacingConfigStore(state => state.getSpacing)

// Hook to get current preset name (for UI display)
export const useSpacingPresetName = () => {
  const spacingConfig = useSpacingConfig()
  return getSpacingPresetName(spacingConfig)
}

// Hook to check if current config is default
export const useIsDefaultSpacing = () => {
  const spacingConfig = useSpacingConfig()
  return getSpacingPresetName(spacingConfig) === 'normal'
}
