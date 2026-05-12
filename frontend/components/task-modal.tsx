"use client"

import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import BASE_URL from "@/lib/api-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useState, useEffect } from "react"

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: any) => void
  task?: any
  user: any
}

interface TeamMember {
  id: string
  name: string
  role?: string
}

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : ""
  return { Authorization: `Bearer ${token}` }
}

export default function TaskModal({ isOpen, onClose, onSave, task, user }: TaskModalProps) {
  // Fix #1 - Use user.name (guaranteed to exist after auth fix)
  const currentUserName = user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim()

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignee: currentUserName,
    priority: "Medium",
    dueDate: "",
    project: "",
    tags: [] as string[],
  })
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch all users for assignee dropdown (Fix #14 — includes Admins & Managers)
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/auth/user/all-users`, {
          headers: getAuthHeaders(),
        })
        if (!response.ok) throw new Error("Failed to fetch users")
        const data = await response.json()
        setTeamMembers(data)
      } catch (error) {
        console.error("Error fetching team members:", error)
        // Fallback: just add current user
        setTeamMembers([{ id: "self", name: currentUserName }])
      }
    }
    fetchTeamMembers()
  }, [currentUserName])

  // Reset form when modal opens/task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        assignee: task.assignee || currentUserName,
        priority: task.priority || "Medium",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
        project: task.project || "",
        tags: task.tags || [],
      })
    } else {
      setFormData({
        title: "",
        description: "",
        assignee: currentUserName,
        priority: "Medium",
        dueDate: "",
        project: "",
        tags: [],
      })
    }
    setNewTag("")
  }, [task, isOpen, currentUserName])

  const isReadOnly = user.role === "Team Member" && !!task

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    setIsSubmitting(true)
    onSave(formData)
    // setIsSubmitting is reset by parent closing modal
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    const trimmed = newTag.trim()
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== tagToRemove) }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); addTag() }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {task
              ? isReadOnly ? "📋 Task Details" : "✏️ Edit Task"
              : "➕ Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter task title"
              required
              disabled={isReadOnly}
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe this task..."
              rows={3}
              disabled={isReadOnly}
              className="mt-1"
            />
          </div>

          {/* Priority */}
          <div>
            <Label className="text-sm font-medium">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleInputChange("priority", value)}
              disabled={isReadOnly}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">🟢 Low</SelectItem>
                <SelectItem value="Medium">🟡 Medium</SelectItem>
                <SelectItem value="High">🔴 High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignee & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Assignee</Label>
              <Select
                value={formData.assignee}
                onValueChange={(value) => handleInputChange("assignee", value)}
                disabled={isReadOnly}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name}
                      {member.role && member.role !== "Team Member" && (
                        <span className="text-xs text-gray-400 ml-1">({member.role})</span>
                      )}
                    </SelectItem>
                  ))}
                  {teamMembers.length === 0 && (
                    <SelectItem value={currentUserName}>{currentUserName}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dueDate" className="text-sm font-medium">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                required
                disabled={isReadOnly}
                className="mt-1"
              />
            </div>
          </div>

          {/* Project */}
          <div>
            <Label htmlFor="project" className="text-sm font-medium">Project</Label>
            <Input
              id="project"
              value={formData.project}
              onChange={(e) => handleInputChange("project", e.target.value)}
              placeholder="Project name (optional)"
              disabled={isReadOnly}
              className="mt-1"
            />
          </div>

          {/* Tags */}
          <div>
            <Label className="text-sm font-medium">Tags</Label>
            <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                  {tag}
                  {!isReadOnly && (
                    <Button type="button" variant="ghost" size="icon"
                      className="h-3 w-3 p-0 hover:bg-transparent ml-1"
                      onClick={() => removeTag(tag)}>
                      <X className="h-2.5 w-2.5" />
                    </Button>
                  )}
                </Badge>
              ))}
            </div>
            {!isReadOnly && (
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a tag and press Enter"
                  className="flex-1 text-sm"
                />
                <Button type="button" variant="outline" onClick={addTag} size="sm">Add</Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            {!isReadOnly && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
              >
                {task ? "Update Task" : "Create Task"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
