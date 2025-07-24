"use client"

import { useState, useEffect } from "react"
import type { Contact, Activity, ActivityType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus, Check, X, Trash2, Edit } from "lucide-react"
import { format, isPast, isToday } from "date-fns"
import { useActivities } from "@/lib/context/activities-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface ContactActivitiesProps {
  contact: Contact
}

export default function ContactActivities({ contact }: ContactActivitiesProps) {
  const { getContactActivities, addActivity, updateActivity, deleteActivity } = useActivities()
  const { toast } = useToast()
  const [showAddActivity, setShowAddActivity] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [filter, setFilter] = useState<"all" | "planned" | "completed">("all")
  const [activities, setActivities] = useState<Activity[]>([])

  // Form state
  const [activityType, setActivityType] = useState<ActivityType>("task")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [dueTime, setDueTime] = useState("09:00")

  // Refresh activities when contact changes
  useEffect(() => {
    setActivities(getContactActivities(contact.id))
  }, [contact.id, getContactActivities])

  const filteredActivities = activities
    .filter((activity) => {
      if (filter === "all") return true
      if (filter === "planned") return activity.status === "planned"
      if (filter === "completed") return activity.status === "completed"
      return true
    })
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())

  const handleAddActivity = () => {
    setActivityType("task")
    setTitle("")
    setDescription("")
    setDueDate(format(new Date(), "yyyy-MM-dd"))
    setDueTime("09:00")
    setShowAddActivity(true)
    setEditingActivity(null)
  }

  const handleEditActivity = (activity: Activity) => {
    setActivityType(activity.type)
    setTitle(activity.title)
    setDescription(activity.description || "")

    const activityDate = new Date(activity.dueDate)
    setDueDate(format(activityDate, "yyyy-MM-dd"))
    setDueTime(format(activityDate, "HH:mm"))

    setShowAddActivity(true)
    setEditingActivity(activity)
  }

  const handleSaveActivity = () => {
    // Combine date and time
    const dueDateObj = new Date(`${dueDate}T${dueTime}:00`)

    if (editingActivity) {
      updateActivity(editingActivity.id, {
        type: activityType,
        title,
        description: description || undefined,
        dueDate: dueDateObj.toISOString(),
      })

      toast({
        title: "Activity updated",
        description: "The activity has been updated successfully",
      })
    } else {
      const newActivity: Activity = {
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        contactId: contact.id,
        type: activityType,
        title,
        description: description || undefined,
        dueDate: dueDateObj.toISOString(),
        status: "planned",
        createdAt: new Date().toISOString(),
      }

      addActivity(newActivity)

      toast({
        title: "Activity added",
        description: "New activity has been added successfully",
      })
    }

    setShowAddActivity(false)
    // Refresh activities
    setActivities(getContactActivities(contact.id))
  }

  const handleCompleteActivity = (activity: Activity) => {
    updateActivity(activity.id, {
      status: "completed",
      completedAt: new Date().toISOString(),
    })

    toast({
      title: "Activity completed",
      description: "The activity has been marked as completed",
    })

    // Refresh activities
    setActivities(getContactActivities(contact.id))
  }

  const handleCancelActivity = (activity: Activity) => {
    updateActivity(activity.id, {
      status: "canceled",
    })

    toast({
      title: "Activity canceled",
      description: "The activity has been canceled",
    })

    // Refresh activities
    setActivities(getContactActivities(contact.id))
  }

  const handleDeleteActivity = (activity: Activity) => {
    deleteActivity(activity.id)

    toast({
      title: "Activity deleted",
      description: "The activity has been deleted",
    })

    // Refresh activities
    setActivities(getContactActivities(contact.id))
  }

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "call":
        return <span className="bg-blue-100 text-blue-800 p-1 rounded">📞</span>
      case "meeting":
        return <span className="bg-purple-100 text-purple-800 p-1 rounded">👥</span>
      case "email":
        return <span className="bg-green-100 text-green-800 p-1 rounded">✉️</span>
      case "text":
        return <span className="bg-indigo-100 text-indigo-800 p-1 rounded">💬</span>
      case "task":
        return <span className="bg-amber-100 text-amber-800 p-1 rounded">✓</span>
      case "note":
        return <span className="bg-gray-100 text-gray-800 p-1 rounded">📝</span>
    }
  }

  const getActivityStatusBadge = (activity: Activity) => {
    if (activity.status === "completed") {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          Completed
        </Badge>
      )
    }

    if (activity.status === "canceled") {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
          Canceled
        </Badge>
      )
    }

    const dueDate = new Date(activity.dueDate)

    if (isPast(dueDate) && !isToday(dueDate)) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          Overdue
        </Badge>
      )
    }

    if (isToday(dueDate)) {
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
          Today
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
        Upcoming
      </Badge>
    )
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Activities & Tasks</h3>
        <Button onClick={handleAddActivity} className="flex items-center gap-2">
          <Plus size={16} className="mr-1" />
          Add Activity
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
          All
        </Button>
        <Button variant={filter === "planned" ? "default" : "outline"} size="sm" onClick={() => setFilter("planned")}>
          Planned
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("completed")}
        >
          Completed
        </Button>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No activities found</p>
          <Button variant="outline" className="mt-4" onClick={handleAddActivity}>
            Add your first activity
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <Card key={activity.id} className="p-4 hover:bg-muted/10">
              <div className="flex items-start gap-3">
                <div className="mt-1">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{activity.title}</h4>
                    <div className="flex items-center gap-1">{getActivityStatusBadge(activity)}</div>
                  </div>

                  {activity.description && <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>}

                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{format(new Date(activity.dueDate), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{format(new Date(activity.dueDate), "h:mm a")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1">
                  {activity.status === "planned" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Complete"
                        onClick={() => handleCompleteActivity(activity)}
                      >
                        <Check size={16} className="text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Cancel"
                        onClick={() => handleCancelActivity(activity)}
                      >
                        <X size={16} className="text-gray-500" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Edit"
                    onClick={() => handleEditActivity(activity)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Delete"
                    onClick={() => handleDeleteActivity(activity)}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Activity Dialog */}
      <Dialog open={showAddActivity} onOpenChange={setShowAddActivity}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingActivity ? "Edit Activity" : "Add New Activity"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="activity-type">Activity Type</Label>
              <Select value={activityType} onValueChange={(value) => setActivityType(value as ActivityType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="text">Text Message</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Activity title" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details about this activity"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due-time">Due Time</Label>
                <Input id="due-time" type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddActivity(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveActivity} disabled={!title || !dueDate}>
              {editingActivity ? "Update Activity" : "Add Activity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
