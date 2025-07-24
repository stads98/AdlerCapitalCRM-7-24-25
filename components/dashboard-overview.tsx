"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useContacts } from "@/lib/context/contacts-context"
import { useActivities } from "@/lib/context/activities-context"
import { Users, MessageSquare, Phone, Mail, Plus, Search, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, isToday, isPast, addDays, addMonths, isBefore } from "date-fns"
import type { ActivityType, Contact } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import AddContactDialog from "@/components/contacts/add-contact-dialog"

type TaskFilter = "overdue-today" | "next-7-days" | "next-month" | "all-time"

export function DashboardOverview() {
  const { contacts } = useContacts()
  const { activities, addActivity } = useActivities()
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddActivity, setShowAddActivity] = useState(false)
  const [showAddContact, setShowAddContact] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("overdue-today")

  // Form state
  const [activityType, setActivityType] = useState<ActivityType>("task")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [dueTime, setDueTime] = useState("09:00")

  // Get all tasks (activities of type "task")
  const allTasks = activities.filter(
    (activity) => activity.type === "task" || activity.type === "meeting" || activity.type === "call",
  )

  // Filter tasks based on selected time period
  const getFilteredTasks = () => {
    const now = new Date()
    const nextWeek = addDays(now, 7)
    const nextMonth = addMonths(now, 1)

    switch (taskFilter) {
      case "overdue-today":
        return allTasks.filter((task) => {
          const dueDate = new Date(task.dueDate)
          return isPast(dueDate) || isToday(dueDate)
        })
      case "next-7-days":
        return allTasks.filter((task) => {
          const dueDate = new Date(task.dueDate)
          return !isPast(dueDate) && !isToday(dueDate) && isBefore(dueDate, nextWeek)
        })
      case "next-month":
        return allTasks.filter((task) => {
          const dueDate = new Date(task.dueDate)
          return isBefore(dueDate, nextMonth) && !isBefore(dueDate, nextWeek)
        })
      case "all-time":
        return allTasks
      default:
        return allTasks
    }
  }

  const filteredTasks = getFilteredTasks()

  // Get task title
  const getTaskTitle = (taskFilter: TaskFilter) => {
    switch (taskFilter) {
      case "overdue-today":
        return "Overdue & Today's Tasks"
      case "next-7-days":
        return "Upcoming Week Tasks"
      case "next-month":
        return "Next Month Tasks"
      case "all-time":
        return "All Tasks"
      default:
        return "Tasks"
    }
  }

  // Get contact by ID
  const getContactById = (contactId: string) => {
    return contacts.find((contact) => contact.id === contactId) || null
  }

  // Filter tasks by search query
  const searchFilteredTasks = filteredTasks.filter((task) => {
    const contact = getContactById(task.contactId)
    if (!contact) return false

    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase()
    const query = searchQuery.toLowerCase()

    return (
      fullName.includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.phone.includes(query) ||
      (contact.propertyAddress && contact.propertyAddress.toLowerCase().includes(query)) ||
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query)) ||
      contact.tags.some((tag) => tag.name.toLowerCase().includes(query))
    )
  })

  const handleAddActivity = (contact: Contact) => {
    setSelectedContact(contact)
    setActivityType("task")
    setTitle("")
    setDescription("")
    setDueDate(format(new Date(), "yyyy-MM-dd"))
    setDueTime("09:00")
    setShowAddActivity(true)
  }

  const handleSaveActivity = () => {
    if (!selectedContact) return

    // Combine date and time
    const dueDateObj = new Date(`${dueDate}T${dueTime}:00`)

    const newActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      contactId: selectedContact.id,
      type: activityType,
      title,
      description: description || undefined,
      dueDate: dueDateObj.toISOString(),
      status: "planned",
      createdAt: new Date().toISOString(),
    }

    addActivity(newActivity)
    setShowAddActivity(false)
  }

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) {
      return `Today at ${format(date, "h:mm a")}`
    }
    return format(date, "MMM d, yyyy 'at' h:mm a")
  }

  const isOverdue = (dateString: string) => {
    const date = new Date(dateString)
    return isPast(date) && !isToday(date)
  }

  return (
    <div className="p-6 h-full overflow-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Contacts</p>
              <p className="text-3xl font-bold">{contacts.length}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Messages Sent</p>
              <p className="text-3xl font-bold">24</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Calls Made</p>
              <p className="text-3xl font-bold">12</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Emails Sent</p>
              <p className="text-3xl font-bold">8</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-full">
              <Mail className="h-6 w-6 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-md font-medium">{getTaskTitle(taskFilter)}</CardTitle>
            <div className="flex items-center gap-4">
              <Select value={taskFilter} onValueChange={(value) => setTaskFilter(value as TaskFilter)}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Filter tasks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overdue-today">Overdue & Today's Tasks</SelectItem>
                  <SelectItem value="next-7-days">Next 7 Days</SelectItem>
                  <SelectItem value="next-month">Next Month</SelectItem>
                  <SelectItem value="all-time">All Time</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="divide-y">
                {searchFilteredTasks.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">No tasks found</div>
                ) : (
                  searchFilteredTasks.map((task) => {
                    const contact = getContactById(task.contactId)
                    if (!contact) return null

                    return (
                      <div key={task.id} className="p-4 hover:bg-muted/20">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Avatar className="mt-0.5">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {contact.firstName[0]}
                                {contact.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">
                                {contact.firstName} {contact.lastName}
                              </h3>
                              <p className="text-sm text-muted-foreground">{contact.phone}</p>
                              {contact.propertyAddress && (
                                <p className="text-sm text-muted-foreground">{contact.propertyAddress}</p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-1">
                                {contact.tags.slice(0, 3).map((tag) => (
                                  <Badge
                                    key={tag.id}
                                    variant="outline"
                                    className={`bg-${tag.color}-100 text-${tag.color}-800 border-${tag.color}-200 text-xs`}
                                  >
                                    {tag.name}
                                  </Badge>
                                ))}
                                {contact.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{contact.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                              <div className="mt-2 p-2 bg-muted/30 rounded-md">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{task.title}</span>
                                  <Badge
                                    variant="outline"
                                    className={`${isOverdue(task.dueDate) ? "bg-red-100 text-red-800 border-red-200" : "bg-blue-100 text-blue-800 border-blue-200"} text-xs`}
                                  >
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatDueDate(task.dueDate)}
                                  </Badge>
                                </div>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => handleAddActivity(contact)}
                            >
                              <Plus size={14} />
                              Task
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Add Activity Dialog */}
      <Dialog open={showAddActivity} onOpenChange={setShowAddActivity}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Add Activity for {selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : ""}
            </DialogTitle>
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
              Add Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Contact Dialog */}
      <AddContactDialog open={showAddContact} onOpenChange={setShowAddContact} />
    </div>
  )
}

// Add default export to support both import styles
export default DashboardOverview
