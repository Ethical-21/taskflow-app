"use client"

import type React from "react"
import BASE_URL from "@/lib/api-config"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface User {
  id: string
  name: string
}

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (project: any) => void
  project?: any
  user: any
}

export default function ProjectModal({ isOpen, onClose, onSave, project, user }: ProjectModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Planning",
    dueDate: "",
    teamMembers: [{ id: user.id || user._id, name: user.name || `${user.firstName} ${user.lastName}` }] as User[],
  })

  const [teamMembers, setTeamMembers] = useState<User[]>([])

  useEffect(() => {
    async function populateTeamMembers() {
      if (project && project.teamMembers && project.teamMembers.length > 0) {
        setFormData({
          name: project.name || "",
          description: project.description || "",
          status: project.status || "Planning",
          dueDate: project.dueDate || "",
          teamMembers: project.teamMembers,
        })
      } else {
        setFormData({
          name: project?.name || "",
          description: project?.description || "",
          status: project?.status || "Planning",
          dueDate: project?.dueDate || "",
          teamMembers: [{ id: user.id || user._id, name: user.name || `${user.firstName} ${user.lastName}` }],
        })
      }
    }
    populateTeamMembers()
  }, [project, user.id, user.name])

  useEffect(() => {
    async function fetchTeamMembers() {
      if (isOpen) {
        try {
          const response = await fetch(`${BASE_URL}/api/auth/user/all-users`)
          if (!response.ok) {
            throw new Error("Failed to fetch team members")
          }
          const data = await response.json()
          console.log("Fetched team members data raw:", data)
          // Map to User objects with id and name
          const members = data.map((member: any) => ({
            id: member.id || member._id,
            name: member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim(),
          }))
          setTeamMembers(members)
        } catch (error) {
          console.error("Error fetching team members:", error)
          setTeamMembers([])
        }
      }
    }
    fetchTeamMembers()
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addTeamMember = (memberId: string) => {
    const memberToAdd = teamMembers.find((member) => member.id === memberId)
    if (memberToAdd && !formData.teamMembers.some((m) => m.id === memberId)) {
      setFormData((prev) => ({ ...prev, teamMembers: [...prev.teamMembers, memberToAdd] }))
    }
  }

  const removeTeamMember = (memberToRemove: User) => {
    if (memberToRemove.id !== user.id) {
      // Don't allow removing the current user
      setFormData((prev) => ({
        ...prev,
        teamMembers: prev.teamMembers.filter((member) => member.id !== memberToRemove.id),
      }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Create New Project"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter project description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="teamMembers">Team Members</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.teamMembers.map((member) => (
                <Badge key={member.id} variant="secondary" className="flex items-center gap-1">
                  {member.name}
                  {member.id !== user.id && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeTeamMember(member)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </Badge>
              ))}
            </div>
            <Select onValueChange={addTeamMember}>
              <SelectTrigger>
                <SelectValue placeholder="Add team member" />
              </SelectTrigger>
              <>
                {console.log("Rendering teamMembers for dropdown:", teamMembers)}
                <SelectContent>
                  {teamMembers
                    .filter((member) => !formData.teamMembers.some((m) => m.id === member.id))
                    .map((member) => {
                      console.log("Dropdown member:", member)
                      return (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      )
                    })}
                </SelectContent>
              </>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
            >
              {project ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
