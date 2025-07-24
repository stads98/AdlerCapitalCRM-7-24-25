"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { contacts, tags } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Send, Filter, Users, X, Play, Pause, Phone, Plus, Edit, Trash2, Copy, Save } from "lucide-react"
import { mockTemplates } from "@/lib/mock-templates"
import { useProcesses } from "@/lib/context/process-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Template {
  id: string
  name: string
  content: string
  variables: string[]
  subject?: string
}

export default function TextBlast() {
  const [message, setMessage] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [senderNumbers, setSenderNumbers] = useState<string[]>(["+17867458508", "+19548720835", "+13054885278"])
  const [newSenderNumber, setNewSenderNumber] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [sentCount, setSentCount] = useState(0)
  const [delayMin, setDelayMin] = useState(8)
  const [delayMax, setDelayMax] = useState(12)
  const [currentProcessId, setCurrentProcessId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined)
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [templateName, setTemplateName] = useState("")
  const [templateContent, setTemplateContent] = useState("")
  const [activeTemplateTab, setActiveTemplateTab] = useState("select")

  const { toast } = useToast()
  const { addProcess, updateProcess, pauseProcess, resumeProcess } = useProcesses()

  // Property types
  const propertyTypes = [
    { id: "single-family", label: "Single-Family" },
    { id: "duplex", label: "Duplex" },
    { id: "triplex", label: "Triplex" },
    { id: "quadplex", label: "Quadplex" },
    { id: "multi-family", label: "Multi-Family" },
  ]

  // Filter contacts based on selected filters
  const filteredContacts = contacts.filter((contact) => {
    // Search in contact details and tags
    const searchLower = searchQuery?.toLowerCase() || ""
    const searchMatch =
      !searchQuery ||
      contact.name?.toLowerCase().includes(searchLower) ||
      contact.phoneNumber?.includes(searchLower) ||
      contact.propertyAddress?.toLowerCase().includes(searchLower) ||
      (contact.tags &&
        contact.tags.some((tag) =>
          typeof tag === "object"
            ? tag.name.toLowerCase().includes(searchLower)
            : String(tag).toLowerCase().includes(searchLower),
        ))

    // Filter by tags
    const tagMatch =
      selectedTags.length === 0 ||
      contact.tags.some((tag) => selectedTags.includes(typeof tag === "object" ? tag.name : String(tag)))

    // Filter by property type
    const propertyTypeMatch =
      selectedPropertyTypes.length === 0 ||
      (contact.propertyType && selectedPropertyTypes.includes(contact.propertyType))

    return searchMatch && tagMatch && propertyTypeMatch
  })

  const handleTagChange = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId))
    } else {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  const handlePropertyTypeChange = (type: string) => {
    if (selectedPropertyTypes.includes(type)) {
      setSelectedPropertyTypes(selectedPropertyTypes.filter((t) => t !== type))
    } else {
      setSelectedPropertyTypes([...selectedPropertyTypes, type])
    }
  }

  const addSenderNumber = () => {
    if (newSenderNumber.trim() && !senderNumbers.includes(newSenderNumber.trim())) {
      setSenderNumbers([...senderNumbers, newSenderNumber.trim()])
      setNewSenderNumber("")
    }
  }

  const removeSenderNumber = (number: string) => {
    setSenderNumbers(senderNumbers.filter((n) => n !== number))
  }

  const handleSelectTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setMessage(template.content)
    }
  }

  const formatMessage = (template: string, contact: any) => {
    let formattedMessage = template

    if (contact.firstName) {
      formattedMessage = formattedMessage.replace(/\{firstName\}/g, contact.firstName)
    }

    if (contact.lastName) {
      formattedMessage = formattedMessage.replace(/\{lastName\}/g, contact.lastName)
    }

    if (contact.propertyAddress) {
      formattedMessage = formattedMessage.replace(/\{propertyAddress\}/g, contact.propertyAddress)
    }

    if (contact.propertyType) {
      formattedMessage = formattedMessage.replace(/\{propertyType\}/g, contact.propertyType)
    }

    return formattedMessage
  }

  const handleSendBlast = async () => {
    if (!message.trim() || filteredContacts.length === 0 || senderNumbers.length === 0) {
      toast({
        title: "Cannot send messages",
        description: "Please select contacts, a message template, and add sender numbers",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    setIsPaused(false)
    setSentCount(0)
    setProgress(0)

    // Add to global process tracking
    const processId = addProcess({
      type: "text",
      label: `Text Blast (${filteredContacts.length} contacts)`,
      progress: 0,
      total: filteredContacts.length,
      isPaused: false,
    })

    setCurrentProcessId(processId)

    toast({
      title: "Text Blast Started",
      description: `Sending messages to ${filteredContacts.length} contacts`,
    })

    // Simulate sending messages
    for (let i = 0; i < filteredContacts.length; i++) {
      if (isPaused) {
        // Wait until unpaused
        await new Promise<void>((resolve) => {
          const checkPaused = () => {
            if (!isPaused) {
              resolve()
            } else {
              setTimeout(checkPaused, 500)
            }
          }
          checkPaused()
        })
      }

      const contact = filteredContacts[i]
      const senderNumber = senderNumbers[i % senderNumbers.length]
      const formattedMessage = formatMessage(message, contact)

      // Simulate API call to send message
      console.log(`Sending to ${contact.phone} from ${senderNumber}: ${formattedMessage}`)

      // Update progress
      setSentCount(i + 1)
      setProgress(Math.round(((i + 1) / filteredContacts.length) * 100))

      // Update global process state
      if (currentProcessId) {
        updateProcess(currentProcessId, { progress: i + 1 })
      }

      // Add random delay between messages
      const delay = Math.floor(Math.random() * (delayMax - delayMin + 1) + delayMin)
      await new Promise((resolve) => setTimeout(resolve, delay * 100)) // Using 100ms instead of 1000ms for demo
    }

    setIsSending(false)

    toast({
      title: "Bulk messaging complete",
      description: `Successfully sent ${filteredContacts.length} messages`,
    })
  }

  const handlePauseBlast = () => {
    setIsPaused(true)
    if (currentProcessId) {
      pauseProcess(currentProcessId)
      toast({
        title: "Text Blast Paused",
        description: "Message sending has been paused",
      })
    }
  }

  const handleResumeBlast = () => {
    setIsPaused(false)
    if (currentProcessId) {
      resumeProcess(currentProcessId)
      toast({
        title: "Text Blast Resumed",
        description: "Message sending has been resumed",
      })
    }
  }

  // Template management functions
  const handleCreateTemplate = () => {
    setEditingTemplate(null)
    setTemplateName("")
    setTemplateContent("")
    setShowTemplateDialog(true)
    setActiveTemplateTab("create")
  }

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template)
    setTemplateName(template.name)
    setTemplateContent(template.content)
    setShowTemplateDialog(true)
    setActiveTemplateTab("create")
  }

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter((t) => t.id !== templateId))
    if (selectedTemplate === templateId) {
      setSelectedTemplate(null)
    }
    toast({
      title: "Template deleted",
      description: "The message template has been deleted",
    })
  }

  const handleDuplicateTemplate = (template: Template) => {
    const newId = `template-${Date.now()}`
    const duplicatedTemplate = {
      ...template,
      id: newId,
      name: `${template.name} (Copy)`,
    }

    setTemplates([...templates, duplicatedTemplate])
    toast({
      title: "Template duplicated",
      description: "A copy of the template has been created",
    })
  }

  const handleSaveTemplate = () => {
    if (!templateName.trim() || !templateContent.trim()) {
      toast({
        title: "Error",
        description: "Template name and content are required",
        variant: "destructive",
      })
      return
    }

    // Extract variables from content (format: {variableName})
    const variableRegex = /\{([^}]+)\}/g
    const matches = Array.from(templateContent.matchAll(variableRegex))
    const variables: string[] = []

    for (const match of matches) {
      if (match[1] && !variables.includes(match[1])) {
        variables.push(match[1])
      }
    }

    if (editingTemplate) {
      setTemplates(
        templates.map((t) =>
          t.id === editingTemplate.id
            ? {
                ...t,
                name: templateName,
                content: templateContent,
                variables,
              }
            : t,
        ),
      )

      toast({
        title: "Template updated",
        description: "The message template has been updated",
      })
    } else {
      const newId = `template-${Date.now()}`
      setTemplates([
        ...templates,
        {
          id: newId,
          name: templateName,
          content: templateContent,
          variables,
        },
      ])

      toast({
        title: "Template created",
        description: "New message template has been created",
      })
    }

    setShowTemplateDialog(false)
    setEditingTemplate(null)
    setTemplateName("")
    setTemplateContent("")
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Text Blast</h3>
        <p className="text-sm text-gray-500 mb-4">Send a text message to multiple contacts at once.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Recipients</h4>
                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                  <Filter size={16} className="mr-2" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
              </div>

              {showFilters && (
                <div className="space-y-4 p-4 border rounded-md mb-4">
                  <div>
                    <h5 className="text-sm font-medium mb-2">Filter by Tags</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {tags.map((tag) => (
                        <div key={tag.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag.id}`}
                            checked={selectedTags.includes(tag.id)}
                            onCheckedChange={() => handleTagChange(tag.id)}
                          />
                          <Label htmlFor={`tag-${tag.id}`} className="text-sm cursor-pointer">
                            {tag.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-2">Filter by Property Type</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {propertyTypes.map((type) => (
                        <div key={type.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type.id}`}
                            checked={selectedPropertyTypes.includes(type.id)}
                            onCheckedChange={() => handlePropertyTypeChange(type.id)}
                          />
                          <Label htmlFor={`type-${type.id}`} className="text-sm">
                            {type.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md mb-4">
                <Users size={18} className="text-muted-foreground" />
                <span>
                  {filteredContacts.length} contact{filteredContacts.length !== 1 ? "s" : ""} selected
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Message Templates</CardTitle>
                <Button variant="outline" size="sm" onClick={handleCreateTemplate}>
                  <Plus size={16} className="mr-2" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`border rounded-md p-4 cursor-pointer hover:border-primary transition-colors ${
                      selectedTemplate === template.id ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">{template.name}</h5>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditTemplate(template)
                          }}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDuplicateTemplate(template)
                          }}
                        >
                          <Copy size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTemplate(template.id)
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{template.content}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[150px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You can use {"{firstName}"}, {"{lastName}"}, {"{propertyAddress}"}, and {"{propertyType}"} as
                    placeholders.
                  </p>
                </div>

                {isSending && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress:</span>
                      <span>
                        {sentCount} of {filteredContacts.length}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                <div className="flex justify-end">
                  {isSending ? (
                    <div className="flex gap-2">
                      {isPaused ? (
                        <Button onClick={handleResumeBlast} className="flex items-center gap-2">
                          <Play size={16} />
                          Resume Sending
                        </Button>
                      ) : (
                        <Button onClick={handlePauseBlast} variant="outline" className="flex items-center gap-2">
                          <Pause size={16} />
                          Pause Sending
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={handleSendBlast}
                      disabled={!message.trim() || filteredContacts.length === 0 || senderNumbers.length === 0}
                      className="flex items-center gap-2"
                    >
                      <Send size={16} />
                      Send to {filteredContacts.length} Contact{filteredContacts.length !== 1 ? "s" : ""}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-medium mb-4">Sender Phone Numbers</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Messages will be sent using these numbers in rotation
              </p>

              <div className="space-y-2 mb-4">
                {senderNumbers.map((number, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{number}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeSenderNumber(number)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {senderNumbers.length === 0 && <p className="text-sm text-muted-foreground">No sender numbers added</p>}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add phone number"
                  value={newSenderNumber}
                  onChange={(e) => setNewSenderNumber(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSenderNumber()
                    }
                  }}
                />
                <Button onClick={addSenderNumber}>Add</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h4 className="font-medium mb-4">Message Delay Settings</h4>
              <p className="text-sm text-muted-foreground mb-4">Set the delay between messages (in seconds)</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delay-min">Minimum Delay</Label>
                  <Input
                    id="delay-min"
                    type="number"
                    min="1"
                    max="60"
                    value={delayMin}
                    onChange={(e) => setDelayMin(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delay-max">Maximum Delay</Label>
                  <Input
                    id="delay-max"
                    type="number"
                    min="1"
                    max="60"
                    value={delayMax}
                    onChange={(e) => setDelayMax(Number(e.target.value))}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                A random delay between {delayMin} and {delayMax} seconds will be applied between messages to avoid rate
                limits
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Create New Template"}</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTemplateTab} onValueChange={setActiveTemplateTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="select">Select Template</TabsTrigger>
              <TabsTrigger value="create">Create/Edit Template</TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="space-y-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-1 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEditTemplate(template)}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleDuplicateTemplate(template)}
                            >
                              <Copy size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{template.content}</p>
                        {template.variables.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-muted-foreground">Variables:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {template.variables.map((variable) => (
                                <span key={variable} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                  {variable}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            handleSelectTemplate(template.id)
                            setShowTemplateDialog(false)
                          }}
                        >
                          Use Template
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              <Button variant="outline" onClick={() => setActiveTemplateTab("create")} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create New Template
              </Button>
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    placeholder="Enter template name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-content">Message Content</Label>
                  <Textarea
                    id="template-content"
                    placeholder="Enter your message template. Use {firstName}, {propertyAddress}, etc. for variables."
                    rows={10}
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use curly braces to add variables: {"{firstName}"}, {"{propertyAddress}"}, {"{cityState}"}, etc.
                  </p>
                </div>

                <div className="pt-2">
                  <h5 className="text-sm font-medium mb-2">Available Variables</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-muted/30 rounded-md">
                    <div className="text-sm">
                      <span className="font-medium">{"{firstName}"}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{"{lastName}"}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{"{propertyAddress}"}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{"{cityState}"}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{"{propertyType}"}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{"{llcName}"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            {activeTemplateTab === "create" ? (
              <>
                <Button variant="outline" onClick={() => setShowTemplateDialog(false)} className="mr-2">
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingTemplate ? "Update Template" : "Save Template"}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
