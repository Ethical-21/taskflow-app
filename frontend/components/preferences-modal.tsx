"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Palette, Bell, Globe, Mail, Smartphone, Volume2, Moon, Sun, Monitor } from "lucide-react"

interface PreferencesModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

interface Preferences {
  theme: "light" | "dark" | "system"
  language: string
  timezone: string
  emailNotifications: boolean
  pushNotifications: boolean
  soundNotifications: boolean
  weeklyReports: boolean
  taskReminders: boolean
  projectUpdates: boolean
  teamNotifications: boolean
}

export default function PreferencesModal({ isOpen, onClose, user }: PreferencesModalProps) {
  const [preferences, setPreferences] = useState<Preferences>({
    theme: "light",
    language: "en",
    timezone: "UTC-5",
    emailNotifications: true,
    pushNotifications: true,
    soundNotifications: false,
    weeklyReports: true,
    taskReminders: true,
    projectUpdates: true,
    teamNotifications: true,
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem(`preferences_${user.email}`)
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences))
    }
  }, [user.email])

  const handleSave = async () => {
    setIsLoading(true)

    try {
      // Save to localStorage
      localStorage.setItem(`preferences_${user.email}`, JSON.stringify(preferences))

      // Apply theme immediately
      if (preferences.theme === "dark") {
        document.documentElement.classList.add("dark")
      } else if (preferences.theme === "light") {
        document.documentElement.classList.remove("dark")
      } else {
        // System theme
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        if (systemDark) {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onClose()
    } catch (error) {
      console.error("Failed to save preferences:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updatePreference = (key: keyof Preferences, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "it", label: "Italiano" },
    { value: "pt", label: "Português" },
  ]

  const timezones = [
    { value: "UTC-12", label: "(UTC-12:00) International Date Line West" },
    { value: "UTC-8", label: "(UTC-08:00) Pacific Time" },
    { value: "UTC-5", label: "(UTC-05:00) Eastern Time" },
    { value: "UTC+0", label: "(UTC+00:00) Greenwich Mean Time" },
    { value: "UTC+1", label: "(UTC+01:00) Central European Time" },
    { value: "UTC+5:30", label: "(UTC+05:30) India Standard Time" },
    { value: "UTC+8", label: "(UTC+08:00) China Standard Time" },
    { value: "UTC+9", label: "(UTC+09:00) Japan Standard Time" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Palette className="h-5 w-5 text-orange-600" />
            </div>
            <span>Preferences</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Palette className="h-5 w-5 text-orange-600" />
                <span>Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={preferences.theme}
                  onValueChange={(value: "light" | "dark" | "system") => updatePreference("theme", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center space-x-2">
                        <Sun className="h-4 w-4" />
                        <span>Light</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center space-x-2">
                        <Moon className="h-4 w-4" />
                        <span>Dark</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center space-x-2">
                        <Monitor className="h-4 w-4" />
                        <span>System</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Localization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <span>Localization</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={preferences.language} onValueChange={(value) => updatePreference("language", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={preferences.timezone} onValueChange={(value) => updatePreference("timezone", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Bell className="h-5 w-5 text-green-600" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => updatePreference("emailNotifications", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                  </div>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => updatePreference("pushNotifications", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Volume2 className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label htmlFor="soundNotifications">Sound Notifications</Label>
                    <p className="text-sm text-gray-500">Play sound for notifications</p>
                  </div>
                </div>
                <Switch
                  id="soundNotifications"
                  checked={preferences.soundNotifications}
                  onCheckedChange={(checked) => updatePreference("soundNotifications", checked)}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Notification Types</h4>

                <div className="flex items-center justify-between">
                  <Label htmlFor="taskReminders">Task Reminders</Label>
                  <Switch
                    id="taskReminders"
                    checked={preferences.taskReminders}
                    onCheckedChange={(checked) => updatePreference("taskReminders", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="projectUpdates">Project Updates</Label>
                  <Switch
                    id="projectUpdates"
                    checked={preferences.projectUpdates}
                    onCheckedChange={(checked) => updatePreference("projectUpdates", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="teamNotifications">Team Notifications</Label>
                  <Switch
                    id="teamNotifications"
                    checked={preferences.teamNotifications}
                    onCheckedChange={(checked) => updatePreference("teamNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="weeklyReports">Weekly Reports</Label>
                  <Switch
                    id="weeklyReports"
                    checked={preferences.weeklyReports}
                    onCheckedChange={(checked) => updatePreference("weeklyReports", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
          >
            {isLoading ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
