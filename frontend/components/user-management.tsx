"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import BASE_URL from "@/lib/api-config"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Plus, Search, Mail, Phone, Users, MoreHorizontal, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useNotifications } from "@/contexts/notification-context"
import UserInviteModal from "@/components/user-invite-modal"

interface MappedUser {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  role: "Admin" | "Manager" | "Team Member"
  status: "Active" | "Inactive"
  avatar: string
  phone: string
  joinDate: string
  tasksAssigned: number
  tasksCompleted: number
}

interface UserManagementProps {
  user: any
}

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : ""
  return { Authorization: `Bearer ${token}` }
}

// Fix #1/#15 - Map any user doc to our standard shape
function mapUserDoc(doc: any): MappedUser {
  const firstName = doc.firstName || doc.userId?.firstName || ""
  const lastName  = doc.lastName  || doc.userId?.lastName  || ""
  const name = (firstName && lastName)
    ? `${firstName} ${lastName}`
    : doc.name || doc.userId?.name || doc.email || "Unknown User"

  return {
    id:             doc._id || doc.id || doc.userId?._id || "",
    name,
    firstName,
    lastName,
    email:          doc.email || doc.userId?.email || "",
    role:           (doc.role || doc.userId?.role || "Team Member") as MappedUser["role"],
    status:         "Active" as const,
    avatar:         doc.avatar || doc.userId?.avatar || "",
    phone:          doc.phone || doc.userId?.phone || "",
    joinDate:       doc.createdAt || doc.userId?.createdAt || new Date().toISOString(),
    tasksAssigned:  0,
    tasksCompleted: 0,
  }
}

export default function UserManagement({ user }: UserManagementProps) {
  const [users, setUsers] = useState<MappedUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { addNotification } = useNotifications()

  const filteredUsers = users.filter(
    (u) =>
      (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
  )

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true)
      try {
        if (user.role === "Manager" || user.role === "Admin") {
          // Fix #14 - Use /api/auth/users which returns ALL users across Admin, Manager, Team Member
          const response = await fetch(`${BASE_URL}/api/auth/users`, {
            headers: getAuthHeaders(),
          })
          if (!response.ok) throw new Error("Failed to fetch users")
          const data = await response.json()
          const mapped = data.map(mapUserDoc)
          setUsers(mapped)
        }
      } catch (error) {
        console.error("Error fetching users:", error)
        // Fallback: try active sessions
        try {
          const response = await fetch(`${BASE_URL}/api/auth/active-sessions`, {
            headers: getAuthHeaders(),
          })
          if (response.ok) {
            const sessions = await response.json()
            const mapped = sessions.map(mapUserDoc)
            setUsers(mapped)
          }
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchUsers()
  }, [user.role])

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":       return "bg-red-100 text-red-800"
      case "Manager":     return "bg-blue-100 text-blue-800"
      case "Team Member": return "bg-green-100 text-green-800"
      default:            return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":   return "bg-green-100 text-green-800"
      case "Inactive": return "bg-gray-100 text-gray-800"
      default:         return "bg-gray-100 text-gray-800"
    }
  }

  const handleInviteUser = (userData: any) => {
    const newUser: MappedUser = {
      id: Date.now().toString(),
      name: userData.name || `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email || "",
      role: userData.role || "Team Member",
      status: "Active",
      avatar: "",
      phone: userData.phone || "",
      joinDate: new Date().toISOString().split("T")[0],
      tasksAssigned: 0,
      tasksCompleted: 0,
    }

    setUsers([...users, newUser])
    setIsInviteModalOpen(false)
    addNotification({
      title: "New Team Member",
      message: `${newUser.name} has joined the team as ${newUser.role}`,
      type: "team",
    })
  }

  const handleChangeUserRole = (userId: string, newRole: string) => {
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, role: newRole as MappedUser["role"] } : u,
    )
    setUsers(updatedUsers)

    const updatedUser = updatedUsers.find((u) => u.id === userId)
    if (updatedUser) {
      addNotification({
        title: "Role Updated",
        message: `${updatedUser.name}'s role has been changed to ${newRole}`,
        type: "team",
      })
    }
  }

  const handleDeactivateUser = (userId: string) => {
    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, status: "Inactive" as const } : u))
    setUsers(updatedUsers)

    const deactivatedUser = updatedUsers.find((u) => u.id === userId)
    if (deactivatedUser) {
      addNotification({
        title: "User Deactivated",
        message: `${deactivatedUser.name} has been deactivated`,
        type: "team",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-3 text-gray-600">Loading team members...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-gray-600">Manage your team members and their roles</p>
        </div>
        {user.role === "Admin" && (
          <Button
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Team Stats — Fix #5 role stats now accurate */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-gray-600">Total Members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{users.filter((u) => u.status === "Active").length}</p>
              <p className="text-sm text-gray-600">Active Members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{users.filter((u) => u.role === "Manager").length}</p>
              <p className="text-sm text-gray-600">Managers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {users.filter((u) => u.role === "Team Member").length}
              </p>
              <p className="text-sm text-gray-600">Team Members</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <Card className="p-8">
          <CardContent className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No team members yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Start collaborating by inviting team members to join your workspace
            </p>
            {user.role === "Admin" && (
              <Button
                size="sm"
                onClick={() => setIsInviteModalOpen(true)}
                className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Invite Team Members
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((userData) => (
          <Card key={userData.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={userData.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-orange-400 to-red-500 text-white font-semibold">
                      {/* Fix #1 - Always compute initials from name */}
                      {userData.name
                        .split(" ")
                        .filter(Boolean)
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{userData.name}</CardTitle>
                    <p className="text-sm text-gray-600 truncate max-w-[180px]">{userData.email}</p>
                  </div>
                </div>
                {user.role === "Admin" && userData.id !== (user.id || user._id) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleChangeUserRole(userData.id, "Admin")}>
                        Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChangeUserRole(userData.id, "Manager")}>
                        Make Manager
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChangeUserRole(userData.id, "Team Member")}>
                        Make Team Member
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeactivateUser(userData.id)} className="text-red-600">
                        Deactivate User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Badge className={getRoleColor(userData.role)}>{userData.role}</Badge>
                <Badge className={getStatusColor(userData.status)}>{userData.status}</Badge>
              </div>

              <div className="space-y-2">
                {userData.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {userData.phone}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  Joined {userData.joinDate ? new Date(userData.joinDate).toLocaleDateString() : "—"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">{userData.tasksAssigned}</p>
                  <p className="text-xs text-gray-600">Tasks Assigned</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-green-600">{userData.tasksCompleted}</p>
                  <p className="text-xs text-gray-600">Tasks Completed</p>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Completion Rate</span>
                  <span>
                    {userData.tasksAssigned > 0
                      ? Math.round((userData.tasksCompleted / userData.tasksAssigned) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${userData.tasksAssigned > 0 ? (userData.tasksCompleted / userData.tasksAssigned) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <UserInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInviteUser}
        user={user}
      />
    </div>
  )
}
