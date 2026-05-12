"use client"

import type React from "react"
import BASE_URL from "@/lib/api-config"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit3, CheckCircle, Circle, Inbox } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface PersonalTask {
  id: string
  title: string
  description: string
  completed: boolean
  createdAt: Date
  priority: "Low" | "Medium" | "High"
}

interface PersonalTodoProps {
  user: any
}

export default function PersonalTodo({ user }: PersonalTodoProps) {
  const [tasks, setTasks] = useState<PersonalTask[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<PersonalTask | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium" as "Low" | "Medium" | "High",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("authToken")
      const res = await fetch(`${BASE_URL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error("Failed to fetch tasks")
      const data = await res.json()
      // Map backend tasks to PersonalTask interface
      const mappedTasks = data.map((task: any) => ({
        id: task._id,
        title: task.title,
        description: task.description || "",
        completed: task.status === "completed",
        createdAt: new Date(task.createdAt),
        priority: "Medium" as "Low" | "Medium" | "High", // Default priority as backend does not have it
      }))
      setTasks(mappedTasks)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const addTask = async () => {
    if (!formData.title.trim()) return
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("authToken")
      if (!token) throw new Error("User not authenticated")
      const res = await fetch(`${BASE_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: formData.title, description: formData.description, status: "pending" }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to add task")
      }
      const newTask = await res.json()
      const mappedTask: PersonalTask = {
        id: newTask._id,
        title: newTask.title,
        description: newTask.description || "",
        completed: newTask.status === "completed",
        createdAt: new Date(newTask.createdAt),
        priority: formData.priority,
      }
      setTasks((prev) => [...prev, mappedTask])
      setFormData({ title: "", description: "", priority: "Medium" })
      setIsModalOpen(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateTask = async (task: PersonalTask) => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("authToken")
      const res = await fetch(`${BASE_URL}/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          status: task.completed ? "completed" : "pending",
        }),
      })
      if (!res.ok) throw new Error("Failed to update task")
      const updatedTask = await res.json()
      setTasks((prev) =>
        prev.map((t) =>
          t.id === updatedTask._id
            ? {
                id: updatedTask._id,
                title: updatedTask.title,
                description: updatedTask.description || "",
                completed: updatedTask.status === "completed",
                createdAt: new Date(updatedTask.createdAt),
                priority: t.priority,
              }
            : t,
        ),
      )
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("authToken")
      const res = await fetch(`${BASE_URL}/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error("Failed to delete task")
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    const updatedTask = { ...task, completed: !task.completed }
    updateTask(updatedTask)
  }

  const editTask = (task: PersonalTask) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
    })
    setIsModalOpen(true)
  }

  const openNewTaskModal = () => {
    setEditingTask(null)
    setFormData({ title: "", description: "", priority: "Medium" })
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingTask) {
      // Update existing task
      const updatedTask: PersonalTask = {
        id: editingTask.id,
        title: formData.title,
        description: formData.description,
        completed: editingTask.completed,
        createdAt: editingTask.createdAt,
        priority: formData.priority,
      }
      updateTask(updatedTask)
    } else {
      // Add new task
      addTask()
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const completedTasks = tasks.filter((task) => task.completed).length
  const pendingTasks = tasks.filter((task) => !task.completed).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Personal To-Do List</h2>
          <p className="text-gray-600">Manage your personal tasks and reminders</p>
        </div>
        <Button
          onClick={openNewTaskModal}
          className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Personal Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Circle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-50 p-2 rounded-lg">
                <Circle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-50 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Your Personal Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Inbox className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No personal tasks yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Create your first personal task to keep track of your to-dos, reminders, and personal goals.
              </p>
              <Button
                onClick={openNewTaskModal}
                className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Task
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center space-x-4 p-4 rounded-lg border transition-all duration-200 ${
                    task.completed
                      ? "bg-gray-50 border-gray-200"
                      : "bg-white border-gray-200 hover:border-orange-200 hover:shadow-sm"
                  }`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-medium ${task.completed ? "text-gray-500 line-through" : "text-gray-900"}`}>
                        {task.title}
                      </h4>
                      <Badge className={`${getPriorityColor(task.priority)} text-xs border`}>{task.priority}</Badge>
                    </div>
                    {task.description && (
                      <p className={`text-sm ${task.completed ? "text-gray-400" : "text-gray-600"}`}>
                        {task.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Created {task.createdAt.toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => editTask(task)}
                      className="h-8 w-8 text-gray-400 hover:text-gray-600"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask(task.id)}
                      className="h-8 w-8 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Personal Task" : "Add Personal Task"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description (optional)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as "Low" | "Medium" | "High" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
              >
                {editingTask ? "Update Task" : "Add Task"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
