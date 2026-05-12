"use client"

import React from "react"
import BASE_URL from "@/lib/api-config"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import KanbanBoard from "@/components/kanban-board"
import ProjectOverview from "@/components/project-overview"
import UserManagement from "@/components/user-management"
import DashboardStats from "@/components/dashboard-stats"
import PersonalTodo from "@/components/personal-todo"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

type User = {
  id?: string
  _id?: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  role: string
}

export default function DashboardPage() {
  const [user, setUser] = React.useState<User | null>(null)
  const [activeTab, setActiveTab] = React.useState("overview")
  const router = useRouter()

  React.useEffect(() => {
    const fetchUserProfile = async () => {
      const savedUser = localStorage.getItem("currentUser")
      const token = localStorage.getItem("authToken")

      if (!savedUser || !token) {
        // Fix #6 - redirect to "/" not "/signin"
        router.push("/")
        return
      }

      const parsedUser = JSON.parse(savedUser)
      const userId = parsedUser.id || parsedUser._id

      try {
        const response = await fetch(
          `${BASE_URL}/api/auth/user/profile?userId=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!response.ok) throw new Error("Failed to fetch user profile")

        const userProfile = await response.json()
        // Ensure name field always exists (Fix #1)
        const enrichedProfile = {
          ...userProfile,
          name: userProfile.name || `${userProfile.firstName} ${userProfile.lastName}`,
        }
        setUser(enrichedProfile)
        localStorage.setItem("currentUser", JSON.stringify(enrichedProfile))
      } catch (error) {
        console.error("Error fetching user profile:", error)
        // Fallback: use saved user (ensure name is set)
        const fallback = {
          ...parsedUser,
          name: parsedUser.name || `${parsedUser.firstName || ""} ${parsedUser.lastName || ""}`.trim(),
        }
        setUser(fallback)
      }
    }
    fetchUserProfile()
  }, [router])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <Card className="p-8 border-0 shadow-xl">
          <CardContent className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className="text-gray-600 font-medium">Loading your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
              <p className="text-orange-100">
                {user.role === "Admin"
                  ? "Manage your team and oversee all projects"
                  : user.role === "Manager"
                  ? "Track your team's progress and assign new tasks"
                  : "Stay on top of your tasks and collaborate with your team"}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-4xl">🚀</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className={`grid w-full ${user.role === "Team Member" ? "grid-cols-3" : "grid-cols-4"} lg:w-[550px] bg-white shadow-sm`}
          >
            <TabsTrigger value="overview" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="kanban" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              {user.role === "Team Member" ? "My Tasks" : "Kanban"}
            </TabsTrigger>
            {user.role === "Team Member" && (
              <TabsTrigger value="personal" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                Personal
              </TabsTrigger>
            )}
            {(user.role === "Admin" || user.role === "Manager") && (
              <TabsTrigger value="projects" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                Projects
              </TabsTrigger>
            )}
            {(user.role === "Admin" || user.role === "Manager") && (
              <TabsTrigger value="users" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                Team
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <DashboardStats user={user} />
          </TabsContent>

          <TabsContent value="kanban" className="mt-6">
            <KanbanBoard user={user} />
          </TabsContent>

          {user.role === "Team Member" && (
            <TabsContent value="personal" className="mt-6">
              <PersonalTodo user={user} />
            </TabsContent>
          )}

          {(user.role === "Admin" || user.role === "Manager") && (
            <TabsContent value="projects" className="mt-6">
              <ProjectOverview user={user} />
            </TabsContent>
          )}

          {(user.role === "Admin" || user.role === "Manager") && (
            <TabsContent value="users" className="mt-6">
              <UserManagement user={user} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
