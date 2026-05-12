"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, FolderOpen, Calendar, Users, CheckCircle, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useNotifications } from "@/contexts/notification-context"
import ProjectModal from "@/components/project-modal"

interface Project {
  id: string
  name: string
  description: string
  status: "Planning" | "In Progress" | "Review" | "Completed"
  progress: number
  dueDate: string
  teamMembers: { id: string; name: string }[]
  tasksCompleted: number
  totalTasks: number
  createdBy: string
}

interface ProjectOverviewProps {
  user: any
}

export default function ProjectOverview({ user }: ProjectOverviewProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const { addNotification } = useNotifications()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planning":
        return "bg-blue-100 text-blue-800"
      case "In Progress":
        return "bg-yellow-100 text-yellow-800"
      case "Review":
        return "bg-purple-100 text-purple-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCreateProject = () => {
    setSelectedProject(null)
    setIsProjectModalOpen(true)
  }

  const handleEditProject = (project: Project) => {
    setSelectedProject(project)
    setIsProjectModalOpen(true)
  }

  const handleProjectSave = (projectData: any) => {
    if (selectedProject) {
      // Update existing project
      const updatedProjects = projects.map((project) =>
        project.id === selectedProject.id ? { ...project, ...projectData } : project,
      )
      setProjects(updatedProjects)

      addNotification({
        title: "Project Updated",
        message: `Project "${projectData.name}" has been updated by ${user.name}`,
        type: "project",
      })
    } else {
      // Create new project
      const newProject: Project = {
        id: Date.now().toString(),
        ...projectData,
        progress: 0,
        tasksCompleted: 0,
        totalTasks: 0,
        createdBy: user.name,
      }
      // Ensure teamMembers have id and name
      if (newProject.teamMembers && newProject.teamMembers.length > 0) {
        newProject.teamMembers = newProject.teamMembers.map((member: any) => {
          if (typeof member === "string") {
            return { id: member, name: "" } // Name will be resolved later
          }
          return member
        })
      } else {
        newProject.teamMembers = [{ id: user.id, name: user.firstName + " " + user.lastName }]
      }
      setProjects([...projects, newProject])

      addNotification({
        title: "New Project Created",
        message: `Project "${projectData.name}" has been created by ${user.name}`,
        type: "project",
      })
    }
    setIsProjectModalOpen(false)
    setSelectedProject(null)
  }

  const handleDeleteProject = (projectId: string) => {
    const projectToDelete = projects.find((p) => p.id === projectId)
    const updatedProjects = projects.filter((project) => project.id !== projectId)
    setProjects(updatedProjects)

    if (projectToDelete) {
      addNotification({
        title: "Project Deleted",
        message: `Project "${projectToDelete.name}" has been deleted by ${user.name}`,
        type: "project",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Projects Overview</h2>
          <p className="text-gray-600">Manage and track your project progress</p>
        </div>
        {(user.role === "Admin" || user.role === "Manager") && (
          <Button
            onClick={handleCreateProject}
            className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <Card className="p-12">
          <CardContent className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Create your first project to start organizing tasks and collaborating with your team.
            </p>
            {(user.role === "Admin" || user.role === "Manager") && (
              <Button
                onClick={handleCreateProject}
                className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Project Stats - Only show when there are projects */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                <p className="text-sm text-gray-600">Total Projects</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {projects.filter((p) => p.status === "In Progress").length}
                </p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {projects.filter((p) => p.status === "Completed").length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {projects.length > 0
                    ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)
                    : 0}
                  %
                </p>
                <p className="text-sm text-gray-600">Avg Progress</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleEditProject(project)}>Edit Project</DropdownMenuItem>
                        {(user.role === "Admin" || project.createdBy === user.name) && (
                          <DropdownMenuItem onClick={() => handleDeleteProject(project.id)} className="text-red-600">
                            Delete Project
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {project.tasksCompleted}/{project.totalTasks} tasks
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(project.dueDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    {project.teamMembers.length} members
                  </div>
                  <div className="flex -space-x-2">
                    {project.teamMembers.slice(0, 3).map((member, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white text-white"
                      >
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                    ))}
                    {project.teamMembers.length > 3 && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white">
                        +{project.teamMembers.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleProjectSave}
        project={selectedProject}
        user={user}
      />
    </div>
  )
}
