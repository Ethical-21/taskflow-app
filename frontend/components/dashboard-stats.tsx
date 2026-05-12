"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertTriangle, TrendingUp, Users, FolderOpen, Target, Calendar, Loader2 } from "lucide-react"

import BASE_URL from "@/lib/api-config"

interface DashboardStatsProps {
  user: any
}

interface Stats {
  total: number
  completed: number
  inprogress: number
  review: number
  todo: number
  overdue: number
  teamMembers?: number
  completionRate: number
}

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : ""
  return { Authorization: `Bearer ${token}` }
}

export default function DashboardStats({ user }: DashboardStatsProps) {
  const [stats, setStats] = useState<Stats>({
    total: 0, completed: 0, inprogress: 0, review: 0, todo: 0, overdue: 0, teamMembers: 0, completionRate: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  // Fix #5 - Fetch real stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        // Fetch task stats
        const statsRes = await fetch(`${BASE_URL}/api/tasks/stats/summary`, { headers: getAuthHeaders() })
        let taskStats = { total: 0, completed: 0, inprogress: 0, review: 0, todo: 0, overdue: 0 }
        if (statsRes.ok) {
          taskStats = await statsRes.json()
        }

        // Fetch team member count for Admin/Manager
        let teamMembers = 0
        if (user.role === "Admin" || user.role === "Manager") {
          const usersRes = await fetch(`${BASE_URL}/api/auth/users`, { headers: getAuthHeaders() })
          if (usersRes.ok) {
            const allUsers = await usersRes.json()
            teamMembers = allUsers.length
          }
        }

        const completionRate = taskStats.total > 0
          ? Math.round((taskStats.completed / taskStats.total) * 100)
          : 0

        setStats({ ...taskStats, teamMembers, completionRate })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [user.role])

  const getRoleSpecificStats = () => {
    if (user.role === "Admin") {
      return [
        { title: "Total Projects", value: stats.total, icon: FolderOpen, color: "text-blue-600", bgColor: "bg-blue-50", description: "All tasks in system" },
        { title: "Team Members", value: stats.teamMembers ?? 0, icon: Users, color: "text-green-600", bgColor: "bg-green-50", description: "Registered users" },
        { title: "Completion Rate", value: `${stats.completionRate}%`, icon: TrendingUp, color: "text-purple-600", bgColor: "bg-purple-50", description: "Overall progress" },
        { title: "Overdue Tasks", value: stats.overdue, icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-50", description: "Need attention" },
      ]
    } else if (user.role === "Manager") {
      return [
        { title: "Total Tasks", value: stats.total, icon: FolderOpen, color: "text-blue-600", bgColor: "bg-blue-50", description: "Active tasks" },
        { title: "Team Members", value: stats.teamMembers ?? 0, icon: Users, color: "text-green-600", bgColor: "bg-green-50", description: "Your team size" },
        { title: "Tasks Assigned", value: stats.total - stats.completed, icon: Target, color: "text-orange-600", bgColor: "bg-orange-50", description: "In progress" },
        { title: "Pending Review", value: stats.review, icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-50", description: "Awaiting approval" },
      ]
    } else {
      return [
        { title: "Assigned Tasks", value: stats.total, icon: Target, color: "text-blue-600", bgColor: "bg-blue-50", description: "Total assigned to you" },
        { title: "Completed", value: stats.completed, icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50", description: "Tasks finished" },
        { title: "In Progress", value: stats.inprogress, icon: Clock, color: "text-orange-600", bgColor: "bg-orange-50", description: "Currently working" },
        { title: "Overdue", value: stats.overdue, icon: Calendar, color: "text-red-600", bgColor: "bg-red-50", description: "Past due date" },
      ]
    }
  }

  const roleStats = getRoleSpecificStats()

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {getGreeting()}, {user.name}! 👋
            </h2>
            <p className="text-gray-600">
              {user.role === "Admin"
                ? "Here's your organization overview for today"
                : user.role === "Manager"
                  ? "Here's your team's progress overview"
                  : "Here's your task summary for today"}
            </p>
          </div>
          <Badge variant="secondary" className="hidden md:flex bg-gradient-to-r from-orange-400 to-red-500 text-white border-0 px-4 py-2">
            {user.role}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roleStats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
                    <span className="text-gray-300 text-sm">Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Status Breakdown */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Task Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
              </div>
            ) : stats.total === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No tasks yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  {user.role === "Team Member"
                    ? "Your assigned tasks will appear here"
                    : "Create tasks in the Kanban board"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "To Do",       value: stats.todo,      color: "bg-slate-400",   pct: stats.total > 0 ? (stats.todo / stats.total) * 100 : 0 },
                  { label: "In Progress", value: stats.inprogress, color: "bg-blue-500",    pct: stats.total > 0 ? (stats.inprogress / stats.total) * 100 : 0 },
                  { label: "In Review",   value: stats.review,    color: "bg-amber-500",   pct: stats.total > 0 ? (stats.review / stats.total) * 100 : 0 },
                  { label: "Completed",   value: stats.completed, color: "bg-emerald-500", pct: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0 },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">{item.label}</span>
                      <span className="text-gray-500">{item.value} task{item.value !== 1 ? "s" : ""} ({Math.round(item.pct)}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`${item.color} h-2.5 rounded-full transition-all duration-500`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Overview */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Quick Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Tasks</span>
                <Badge variant="outline" className="text-xs font-semibold">{stats.total}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 font-semibold">{stats.completed}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overdue</span>
                <Badge variant="outline" className={`text-xs font-semibold ${stats.overdue > 0 ? "bg-red-50 text-red-700 border-red-200" : ""}`}>
                  {stats.overdue}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <Badge variant="outline" className={`text-xs font-semibold ${stats.completionRate >= 70 ? "bg-green-50 text-green-700 border-green-200" : stats.completionRate >= 40 ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                  {stats.completionRate}%
                </Badge>
              </div>

              {/* Completion progress ring */}
              <div className="pt-4 flex flex-col items-center">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke="url(#grad)" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${stats.completionRate} ${100 - stats.completionRate}`}
                      strokeDashoffset="0"
                    />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-800">
                    {stats.completionRate}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
