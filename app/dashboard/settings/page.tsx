"use client"

import { SettingsHeader } from "@/components/settings/settings-header"
import { SettingsContent } from "@/components/settings/settings-content"

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4 overflow-x-hidden">
      <SettingsHeader />
      <SettingsContent />
    </div>
  )
}
