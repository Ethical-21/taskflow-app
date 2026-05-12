"use client"

import type React from "react"
import BASE_URL from "@/lib/api-config"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Settings, User, LogOut, Menu, X } from "lucide-react"
import { useNotifications } from "@/contexts/notification-context"

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  clearAll: () => void;
}
import ProfileSettingsModal from "@/components/profile-settings-modal"
import PreferencesModal from "@/components/preferences-modal"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: any
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(user)
  const { notifications, markAsRead } = useNotifications()

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleSignOut = async () => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
      const userId = savedUser.id || savedUser._id
      if (userId) {
        await fetch(`${BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        })
      }
    } catch (e) {
      // Silent fail on logout API call
    } finally {
      localStorage.removeItem("currentUser")
      localStorage.removeItem("authToken")
      window.location.href = "/"
    }
  }

  const handleUserUpdate = (updatedUser: any) => {
    setCurrentUser(updatedUser)
  }

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id)
    // Handle navigation based on notification type
    if (notification.actionUrl) {
      // Navigate to the specific page
      console.log("Navigate to:", notification.actionUrl)
    }
  }

  // Helper function to get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  // Fix #1 - Compute display name safely
  const displayName = currentUser?.name ||
    (currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : currentUser?.firstName || "User")
  const firstName = displayName.split(" ")[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Mobile Menu */}
             <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
                  <p className="text-xs text-gray-500">Corporate Task Management</p>
                </div>
              </div>
            </div>

            {/* Right Side - Notifications and Profile */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className="p-3 cursor-pointer hover:bg-gray-50"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start space-x-3 w-full">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 ${notification.read ? "bg-gray-300" : "bg-orange-500"}`}
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm ${notification.read ? "text-gray-600" : "text-gray-900 font-medium"}`}
                              >
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                              {/* Removed createdAt display due to type error */}
                              {/* <p className="text-xs text-gray-400 mt-1">
                                {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : ""}
                              </p> */}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 px-3 py-2 h-auto">
                    <Avatar className="h-8 w-8">
                      {currentUser.avatar ? (
                        <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={displayName} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-sm">
                          {displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{currentUser.email || ""}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {/* User Info Header */}
                  <div className="p-3 border-b">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        {currentUser.avatar ? (
                          <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
                          {currentUser.name
                              ? currentUser.name.split(" ").map((n: string) => n[0]).join("")
                              : ""}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name || ""}</p>
                        <p className="text-xs text-gray-500 truncate">{currentUser.email || ""}</p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {currentUser.role || ""}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <DropdownMenuItem
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center space-x-2 p-3 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setIsPreferencesModalOpen(true)}
                    className="flex items-center space-x-2 p-3 cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Preferences</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 p-3 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">{children}</main>

      {/* Modals */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onUserUpdate={handleUserUpdate}
      />

      <PreferencesModal
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
        user={currentUser}
      />
    </div>
  )
}
