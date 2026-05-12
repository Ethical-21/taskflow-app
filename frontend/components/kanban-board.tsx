"use client"

import { useState, useEffect, useCallback } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Calendar, User, AlertCircle, MoreHorizontal, Filter, Inbox, RefreshCw, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import TaskModal from "@/components/task-modal"
import { useNotifications } from "@/contexts/notification-context"

import BASE_URL from "@/lib/api-config"

interface Task {
  id: string
  title: string
  description: string
  assignee: string
  priority: "Low" | "Medium" | "High"
  dueDate: string
  project: string
  status: string
  tags: string[]
  createdBy: string
}

interface Column {
  id: string
  title: string
  tasks: Task[]
  color: string
  headerColor: string
}

const COLUMN_DEFINITIONS = [
  { id: "todo",       title: "To Do",       color: "bg-slate-50",  headerColor: "bg-slate-200 text-slate-700" },
  { id: "inprogress", title: "In Progress", color: "bg-blue-50",   headerColor: "bg-blue-200 text-blue-800"  },
  { id: "review",     title: "Review",      color: "bg-amber-50",  headerColor: "bg-amber-200 text-amber-800"},
  { id: "done",       title: "Done",        color: "bg-emerald-50",headerColor: "bg-emerald-200 text-emerald-800"},
]

interface KanbanBoardProps {
  user: any
}

// Helper — get auth headers from localStorage
const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : ""
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

// Convert a MongoDB task document to our frontend Task shape
const mapTask = (t: any): Task => ({
  id: t._id || t.id,
  title: t.title || "",
  description: t.description || "",
  assignee: t.assignee || "",
  priority: (t.priority as "Low" | "Medium" | "High") || "Medium",
  dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : "",
  project: t.project || "",
  status: t.status || "todo",
  tags: t.tags || [],
  createdBy: t.createdBy || "",
})

export default function KanbanBoard({ user }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>(
    COLUMN_DEFINITIONS.map((def) => ({ ...def, tasks: [] }))
  )
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addNotification } = useNotifications()

  // ─── Fix #4: Fetch all tasks from backend ─────────────────────────────────
  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${BASE_URL}/api/tasks`, { headers: getAuthHeaders() })
      if (!res.ok) throw new Error(`Failed to fetch tasks (${res.status})`)
      const data: any[] = await res.json()

      const newColumns = COLUMN_DEFINITIONS.map((def) => ({
        ...def,
        tasks: data.filter((t) => t.status === def.id).map(mapTask),
      }))
      setColumns(newColumns)
    } catch (err: any) {
      console.error("Fetch tasks error:", err)
      setError("Could not load tasks. Is the backend running on port 5000?")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // ─── Drag and drop ─────────────────────────────────────────────────────────
  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const sourceColumn = columns.find((col) => col.id === source.droppableId)
    const destColumn   = columns.find((col) => col.id === destination.droppableId)
    if (!sourceColumn || !destColumn) return

    const task = sourceColumn.tasks.find((t) => t.id === draggableId)
    if (!task) return

    // Optimistic UI update
    const newSourceTasks = sourceColumn.tasks.filter((t) => t.id !== draggableId)
    const newDestTasks   = [...destColumn.tasks]
    const updatedTask    = { ...task, status: destination.droppableId }
    newDestTasks.splice(destination.index, 0, updatedTask)

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === source.droppableId)      return { ...col, tasks: newSourceTasks }
        if (col.id === destination.droppableId) return { ...col, tasks: newDestTasks }
        return col
      })
    )

    // Persist status change to backend
    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${draggableId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: destination.droppableId }),
      })
      if (!res.ok) throw new Error("Failed to update task status")

      addNotification({
        title: "Task Moved",
        message: `"${task.title}" moved to ${destColumn.title}`,
        type: "task",
      })
    } catch (err) {
      console.error("Update task status error:", err)
      // Rollback optimistic update
      fetchTasks()
    }
  }

  // ─── Priority helpers ───────────────────────────────────────────────────────
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":   return "bg-red-100 text-red-800 border-red-200"
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":    return "bg-green-100 text-green green-800 border-green-200"
      default:       return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const isOverdue = (dueDate: string) => dueDate && new Date(dueDate) < new Date()

  // ─── Modal helpers ──────────────────────────────────────────────────────────
  const handleTaskClick    = (task: Task) => { setSelectedTask(task); setIsTaskModalOpen(true) }
  const handleCreateTask   = ()            => { setSelectedTask(null); setIsTaskModalOpen(true) }

  // ─── Save task (create or update) ──────────────────────────────────────────
  const handleTaskSave = async (taskData: any) => {
    setIsSaving(true)
    try {
      if (selectedTask) {
        // UPDATE
        const res = await fetch(`${BASE_URL}/api/tasks/${selectedTask.id}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ ...taskData, status: selectedTask.status }),
        })
        if (!res.ok) throw new Error("Failed to update task")
        const updated = await res.json()

        setColumns((prev) =>
          prev.map((col) => ({
            ...col,
            tasks: col.tasks.map((t) => (t.id === selectedTask.id ? mapTask(updated) : t)),
          }))
        )
        addNotification({ title: "Task Updated", message: `"${updated.title}" has been updated`, type: "task" })
      } else {
        // CREATE
        const userName = user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim()
        const res = await fetch(`${BASE_URL}/api/tasks`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ ...taskData, status: "todo", createdBy: userName }),
        })
        if (!res.ok) throw new Error("Failed to create task")
        const created = await res.json()
        const newTask = mapTask(created)

        setColumns((prev) =>
          prev.map((col) => (col.id === "todo" ? { ...col, tasks: [...col.tasks, newTask] } : col))
        )
        addNotification({ title: "Task Created", message: `New task "${created.title}" has been created`, type: "task" })

        if (taskData.assignee && taskData.assignee !== userName) {
          addNotification({
            title: "Task Assigned",
            message: `"${created.title}" has been assigned to ${taskData.assignee}`,
            type: "task",
          })
        }
      }
    } catch (err) {
      console.error("Save task error:", err)
      addNotification({ title: "Error", message: "Failed to save task. Please try again.", type: "system" })
      fetchTasks() // Refresh to stay in sync
    } finally {
      setIsSaving(false)
      setIsTaskModalOpen(false)
      setSelectedTask(null)
    }
  }

  // ─── Delete task ────────────────────────────────────────────────────────────
  const handleDeleteTask = async (taskId: string) => {
    const taskToDelete = columns.flatMap((col) => col.tasks).find((t) => t.id === taskId)

    // Optimistic remove
    setColumns((prev) =>
      prev.map((col) => ({ ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }))
    )

    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      if (!res.ok) throw new Error("Failed to delete task")

      if (taskToDelete) {
        addNotification({ title: "Task Deleted", message: `"${taskToDelete.title}" has been deleted`, type: "task" })
      }
    } catch (err) {
      console.error("Delete task error:", err)
      fetchTasks() // Rollback
    }
  }

  // ─── Filtered columns ───────────────────────────────────────────────────────
  const filteredColumns = columns.map((col) => ({
    ...col,
    tasks: filterPriority === "all" ? col.tasks : col.tasks.filter((t) => t.priority === filterPriority),
  }))

  const totalTasks = columns.reduce((acc, col) => acc + col.tasks.length, 0)

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kanban Board</h2>
          <p className="text-gray-500 text-sm mt-1">
            {isLoading ? "Loading tasks..." : `${totalTasks} task${totalTasks !== 1 ? "s" : ""} total · Drag and drop to change status`}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Refresh button */}
          <Button variant="outline" size="sm" onClick={fetchTasks} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {/* Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                {filterPriority === "all" ? "Filter" : `${filterPriority} Priority`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterPriority("all")}>All Priorities</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority("High")}>🔴 High Priority</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority("Medium")}>🟡 Medium Priority</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPriority("Low")}>🟢 Low Priority</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Task — Admin & Manager only */}
          {(user.role === "Admin" || user.role === "Manager") && (
            <Button
              onClick={handleCreateTask}
              className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
          <Button variant="ghost" size="sm" onClick={fetchTasks} className="ml-auto text-red-600">
            Retry
          </Button>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COLUMN_DEFINITIONS.map((col) => (
            <div key={col.id} className={`${col.color} rounded-xl p-4 min-h-[400px] animate-pulse`}>
              <div className="h-6 bg-white/60 rounded-lg w-24 mb-4" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg p-4 mb-3 h-28 opacity-50" />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && totalTasks === 0 && (
        <Card className="p-12 border-0 shadow-sm">
          <CardContent className="text-center">
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox className="h-12 w-12 text-orange-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {user.role === "Team Member"
                ? "No tasks have been assigned to you yet. Your manager will assign tasks soon."
                : "Get started by creating your first task on the Kanban board."}
            </p>
            {(user.role === "Admin" || user.role === "Manager") && (
              <Button
                onClick={handleCreateTask}
                className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Task
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Kanban Board */}
      {!isLoading && !error && totalTasks > 0 && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredColumns.map((column) => (
              <div key={column.id} className={`${column.color} rounded-xl p-4 min-h-[600px] border border-white/60`}>
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${column.headerColor}`}>
                    <span className="font-semibold text-sm">{column.title}</span>
                    <span className="text-xs font-bold bg-white/50 rounded-full px-2 py-0.5">
                      {column.tasks.length}
                    </span>
                  </div>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[500px] rounded-lg transition-colors duration-200 ${
                        snapshot.isDraggingOver ? "bg-white/40 ring-2 ring-orange-300 ring-dashed" : ""
                      }`}
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-pointer hover:shadow-md transition-all duration-200 bg-white border-0 shadow-sm ${
                                snapshot.isDragging ? "shadow-2xl rotate-2 scale-105" : ""
                              }`}
                              onClick={() => handleTaskClick(task)}
                            >
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  {/* Task Header */}
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-semibold text-gray-900 text-sm leading-tight flex-1">
                                      {task.title}
                                    </h4>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      {isOverdue(task.dueDate) && task.status !== "done" && (
                                        <AlertCircle className="h-4 w-4 text-red-500" title="Overdue!" />
                                      )}
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost" size="icon" className="h-6 w-6 text-gray-400"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <MoreHorizontal className="h-3 w-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleTaskClick(task) }}>
                                            {user.role === "Team Member" ? "View Task" : "Edit Task"}
                                          </DropdownMenuItem>
                                          {(user.role === "Admin" || user.role === "Manager" || task.createdBy === user.name) && (
                                            <DropdownMenuItem
                                              onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id) }}
                                              className="text-red-600"
                                            >
                                              Delete Task
                                            </DropdownMenuItem>
                                          )}
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>

                                  {/* Description */}
                                  {task.description && (
                                    <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
                                  )}

                                  {/* Project */}
                                  {task.project && (
                                    <p className="text-xs text-orange-600 font-medium truncate">📁 {task.project}</p>
                                  )}

                                  {/* Tags */}
                                  {task.tags && task.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {task.tags.map((tag, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs bg-gray-100 text-gray-600 px-2 py-0">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}

                                  {/* Priority & Due Date */}
                                  <div className="flex items-center justify-between">
                                    <Badge className={`${getPriorityColor(task.priority)} text-xs border px-2`}>
                                      {task.priority}
                                    </Badge>
                                    {task.dueDate && (
                                      <div className={`flex items-center text-xs gap-1 ${
                                        isOverdue(task.dueDate) && task.status !== "done"
                                          ? "text-red-500 font-medium"
                                          : "text-gray-400"
                                      }`}>
                                        <Calendar className="h-3 w-3" />
                                        {new Date(task.dueDate).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>

                                  {/* Assignee */}
                                  {task.assignee && (
                                    <div className="flex items-center justify-between border-t border-gray-50 pt-2">
                                      <div className="flex items-center text-xs text-gray-500 gap-1">
                                        <User className="h-3 w-3" />
                                        <span className="truncate max-w-[100px]">{task.assignee}</span>
                                      </div>
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs bg-gradient-to-r from-orange-400 to-red-500 text-white">
                                          {task.assignee.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                                        </AvatarFallback>
                                      </Avatar>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {/* Add task shortcut inside empty column */}
                      {column.tasks.length === 0 && (user.role === "Admin" || user.role === "Manager") && (
                        <button
                          onClick={handleCreateTask}
                          className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-xs hover:border-orange-300 hover:text-orange-400 transition-colors"
                        >
                          + Add task here
                        </button>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* Saving overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-black/10 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
            <span className="text-sm font-medium text-gray-700">Saving...</span>
          </div>
        </div>
      )}

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => { setIsTaskModalOpen(false); setSelectedTask(null) }}
        onSave={handleTaskSave}
        task={selectedTask}
        user={user}
      />
    </div>
  )
}
