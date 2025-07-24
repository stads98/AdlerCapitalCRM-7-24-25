"use client"

import type React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Edit,
  Trash2,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  CalendarDays,
  Landmark,
  DollarSign,
  Home,
  Briefcase,
  Plus,
} from "lucide-react"
import type { Contact } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ContactMessages from "./contact-messages"
import ContactCalls from "./contact-calls"
import ContactEmails from "./contact-emails"
import ContactNotes from "./contact-notes"
import ContactActivities from "./contact-activities"
import { ActivityTimeline } from "./activity-timeline"
import EditContactDialog from "./edit-contact-dialog"
import { useState } from "react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useActivities } from "@/lib/context/activities-context"
import { useContacts } from "@/lib/context/contacts-context"
import { useToast } from "@/hooks/use-toast"
import type { ActivityType } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ContactDetailsProps {
  contact: Contact
  onBack: () => void
}

const ContactDetails: React.FC<ContactDetailsProps> = ({ contact, onBack }) => {
  const [showQuickTaskDialog, setShowQuickTaskDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [taskTitle, setTaskTitle] = useState("")
  const [taskType, setTaskType] = useState<ActivityType>("task")
  const [taskDueDate, setTaskDueDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [taskDueTime, setTaskDueTime] = useState("09:00")
  const [taskDescription, setTaskDescription] = useState("")

  const { addActivity } = useActivities()
  const { updateContact, deleteContact } = useContacts()
  const { toast } = useToast()

  if (!contact) {
    return (
      <div className="p-8 text-center text-gray-500">
        Contact not found. Please go back and select a contact.
        <Button onClick={onBack} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    )
  }

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "N/A"
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
  }

  const calculateEquity = () => {
    if (contact.propertyValue === undefined || contact.debtOwed === undefined) return undefined
    return contact.propertyValue - contact.debtOwed
  }

  const equity = calculateEquity()

  const handleQuickTaskSave = () => {
    if (!taskTitle.trim()) return

    const dueDateObj = new Date(`${taskDueDate}T${taskDueTime}:00`)

    const newActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      contactId: contact.id,
      type: taskType,
      title: taskTitle,
      description: taskDescription || undefined,
      dueDate: dueDateObj.toISOString(),
      status: "planned" as const,
      createdAt: new Date().toISOString(),
    }

    addActivity(newActivity)

    toast({
      title: "Task added",
      description: `New ${taskType} "${taskTitle}" has been added for ${contact.firstName} ${contact.lastName}`,
    })

    // Reset form
    setTaskTitle("")
    setTaskDescription("")
    setTaskType("task")
    setTaskDueDate(format(new Date(), "yyyy-MM-dd"))
    setTaskDueTime("09:00")
    setShowQuickTaskDialog(false)
  }

  const handleUpdateContact = (id: string, updates: Partial<Contact>) => {
    updateContact(id, updates)
    setShowEditDialog(false)
    toast({
      title: "Contact updated",
      description: `${contact.firstName} ${contact.lastName} has been updated successfully.`,
    })
  }

  const handleDeleteContact = () => {
    deleteContact(contact.id)
    setShowDeleteDialog(false)
    toast({
      title: "Contact deleted",
      description: `${contact.firstName} ${contact.lastName} has been deleted.`,
    })
    onBack() // Go back to the list after deletion
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <header className="bg-white p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
        <Button onClick={onBack} variant="outline" size="sm" className="flex items-center gap-2">
          <ArrowLeft size={16} />
          Back to List
        </Button>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowEditDialog(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Edit size={16} />
            Edit
          </Button>
          <Button
            onClick={() => setShowDeleteDialog(true)}
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </Button>
          <Button
            onClick={() => setShowQuickTaskDialog(true)}
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Task
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  {contact.firstName} {contact.lastName}
                </CardTitle>
                {contact.company && <p className="text-sm text-gray-600">{contact.company}</p>}
              </div>
              {contact.dnc && (
                <Badge variant="destructive" className="text-xs">
                  DNC
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-gray-500" />
              <span className="text-gray-700">{contact.phone || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-gray-500" />
              <span className="text-gray-700">{contact.email || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 col-span-1 md:col-span-2">
              <Home size={16} className="text-gray-500" />
              <span className="text-gray-700">{contact.propertyAddress || "N/A"}</span>
            </div>
            {contact.tags && contact.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 col-span-1 md:col-span-2">
                {contact.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className={`bg-${tag.color}-100 text-${tag.color}-800 border-${tag.color}-200`}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Landmark size={20} /> Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-gray-500" />
              <span className="text-gray-700">
                Type: {contact.propertyType ? contact.propertyType.replace("-", " ") : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-gray-500" />
              <span className="text-gray-700">Value: {formatCurrency(contact.propertyValue)}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-gray-500" />
              <span className="text-gray-700">Debt: {formatCurrency(contact.debtOwed)}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-green-600" />
              <span className="text-gray-700 font-medium">Equity: {formatCurrency(equity)}</span>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="timeline">
              <CalendarDays className="mr-1 h-4 w-4 md:hidden" />
              <span className="hidden md:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="activities">
              <CalendarDays className="mr-1 h-4 w-4 md:hidden" />
              <span className="hidden md:inline">Activities</span>
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="mr-1 h-4 w-4 md:hidden" />
              <span className="hidden md:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="calls">
              <Phone className="mr-1 h-4 w-4 md:hidden" />
              <span className="hidden md:inline">Calls</span>
            </TabsTrigger>
            <TabsTrigger value="emails">
              <Mail className="mr-1 h-4 w-4 md:hidden" />
              <span className="hidden md:inline">Emails</span>
            </TabsTrigger>
            <TabsTrigger value="notes">
              <FileText className="mr-1 h-4 w-4 md:hidden" />
              <span className="hidden md:inline">Notes</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="timeline" className="mt-4">
            <ActivityTimeline contactId={contact.id} />
          </TabsContent>
          <TabsContent value="activities" className="mt-4">
            <ContactActivities contact={contact} />
          </TabsContent>
          <TabsContent value="messages" className="mt-4">
            <ContactMessages contactId={contact.id} />
          </TabsContent>
          <TabsContent value="calls" className="mt-4">
            <ContactCalls contactId={contact.id} />
          </TabsContent>
          <TabsContent value="emails" className="mt-4">
            <ContactEmails contactId={contact.id} />
          </TabsContent>
          <TabsContent value="notes" className="mt-4">
            <ContactNotes contact={contact} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Contact Dialog */}
      <EditContactDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        contact={contact}
        onUpdateContact={handleUpdateContact}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {contact.firstName} {contact.lastName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContact} className="bg-red-600 hover:bg-red-700">
              Delete Contact
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quick Add Task Dialog */}
      <Dialog open={showQuickTaskDialog} onOpenChange={setShowQuickTaskDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Add Task for {contact.firstName} {contact.lastName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-type">Task Type</Label>
              <Select value={taskType} onValueChange={(value) => setTaskType(value as ActivityType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select task type" />
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
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-description">Description (Optional)</Label>
              <Textarea
                id="task-description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Add details about this task"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-due-date">Due Date</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-due-time">Due Time</Label>
                <Input
                  id="task-due-time"
                  type="time"
                  value={taskDueTime}
                  onChange={(e) => setTaskDueTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuickTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleQuickTaskSave} disabled={!taskTitle.trim()}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ContactDetails
