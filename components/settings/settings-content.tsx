"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserProfileSettings } from "./user-profile-settings"
import { AccountSettings } from "./account-settings"
import { PreferencesSettings } from "./preferences-settings"
import { SecuritySettings } from "./security-settings"
import { DataSettings } from "./data-settings"
import { User, Shield, Settings, Database, Sliders } from "lucide-react"

export function SettingsContent() {
  const [activeTab, setActiveTab] = useState("profile")

  const settingsTabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      description: "Manage your personal information and preferences"
    },
    {
      id: "account",
      label: "Account",
      icon: Settings,
      description: "Account settings and subscription details"
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      description: "Password and security settings"
    },
    {
      id: "preferences",
      label: "Preferences",
      icon: Sliders,
      description: "Application preferences and defaults"
    },
    {
      id: "data",
      label: "Data & Privacy",
      icon: Database,
      description: "Manage your data and privacy settings"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and set application preferences.
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="space-y-4">
          {/* Mobile Tab List - Scrollable */}
          <div className="block sm:hidden">
            <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
              {settingsTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Desktop Tab List - Grid */}
          <div className="hidden sm:block">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {settingsTabs.map((tab) => (
                <Card
                  key={tab.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    activeTab === tab.id 
                      ? 'ring-2 ring-primary shadow-md' 
                      : 'hover:border-muted-foreground/50'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <CardContent className="p-4 text-center">
                    <tab.icon className={`h-8 w-8 mx-auto mb-2 ${
                      activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <h3 className="font-medium text-sm">{tab.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-tight">
                      {tab.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="min-h-[500px]">
          <TabsContent value="profile" className="space-y-6 mt-0">
            <UserProfileSettings />
          </TabsContent>

          <TabsContent value="account" className="space-y-6 mt-0">
            <AccountSettings />
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-0">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6 mt-0">
            <PreferencesSettings />
          </TabsContent>

          <TabsContent value="data" className="space-y-6 mt-0">
            <DataSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
