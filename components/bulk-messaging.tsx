"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Filter, Send, Check, AlertCircle, Phone, Pause, Play, Trash2, Users } from "lucide-react"
import { mockContacts } from "@/lib/mock-contacts"
import { mockTemplates } from "@/lib/mock-templates"
import type { Contact } from "@/lib/types"
import { useProcesses } from "@/lib/context/process-context"

export default function BulkMessaging() {
  const [contacts, setContacts] = useState(mockContacts)
  const [templates, setTemplates] = useState(mockTemplates)
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [senderNumbers, setSenderNumbers] = useState<string[]>([
    "+17867458508",
    "+19548720835",
    "+13054885278",
    "+17868404856",
    "+13054885284",
    "+15615714429",
  ])
  const [newSenderNumber, setNewSenderNumber] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [sentCount, setSentCount] = useState(0)
  const [delayMin, setDelayMin] = useState(8)
  const [delayMax, setDelayMax] = useState(12)
  const [currentProcessId, setCurrentProcessId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const { toast } = useToast()
  const { addProcess, updateProcess, pauseProcess, resumeProcess } = useProcesses()

  // Get all unique tags, property types, and cities
  const allTags = Array.from(new Set(contacts.flatMap((contact) => contact.tags || [])))
  const allPropertyTypes = Array.from(
    new Set(contacts.map((contact) => contact.propertyType).filter(Boolean) as string[]),
  )
  const allCities = Array.from(new Set(contacts.map((contact) => contact.cityState).filter(Boolean) as string[]))

  // Filter contacts based on selected filters
  const filteredContacts = contacts.filter((contact) => {
    // Search in contact details and tags
    const searchLower = searchQuery.toLowerCase()
    const searchMatch =
      !searchQuery ||
      contact.name?.toLowerCase().includes(searchLower) ||
      contact.phoneNumber?.includes(searchLower) ||
      contact.propertyAddress?.toLowerCase().includes(searchLower) ||
      contact.cityState?.toLowerCase().includes(searchLower) ||
      contact.propertyType?.toLowerCase().includes(searchLower) ||
      (contact.tags && contact.tags.some((tag) => tag.name.toLowerCase().includes(searchLower)))

    // Tag filter
    const tagMatch =
      selectedTags.length === 0 || (contact.tags && selectedTags.some((tag) => contact.tags?.includes(tag)))

    // Property type filter
    const propertyTypeMatch =
      selectedPropertyTypes.length === 0 || selectedPropertyTypes.includes(contact.propertyType || "")

    // City filter
    const cityMatch = selectedCities.length === 0 || selectedCities.includes(contact.cityState || "")

    return searchMatch && tagMatch && propertyTypeMatch && cityMatch
  })

  const toggleContactSelection = (contactId: string) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter((id) => id !== contactId))
    } else {
      setSelectedContacts([...selectedContacts, contactId])
    }
  }

  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(filteredContacts.map((contact) => contact.id))
    }
  }

  const handleTagFilter = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handlePropertyTypeFilter = (type: string) => {
    if (selectedPropertyTypes.includes(type)) {
      setSelectedPropertyTypes(selectedPropertyTypes.filter((t) => t !== type))
    } else {
      setSelectedPropertyTypes([...selectedPropertyTypes, type])
    }
  }

  const handleCityFilter = (city: string) => {
    if (selectedCities.includes(city)) {
      setSelectedCities(selectedCities.filter((c) => c !== city))
    } else {
      setSelectedCities([...selectedCities, city])
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

  const getSelectedContactsCount = () => {
    return selectedContacts.length
  }

  const getSelectedTemplate = () => {
    return templates.find((t) => t.id === selectedTemplate)
  }

  const formatMessage = (template: string, contact: Contact) => {
    let message = template

    // Replace variables with contact data
    if (contact.name) {
      const nameParts = contact.name.split(" ")
      const firstName = nameParts[0]
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""

      message = message.replace(/\{firstName\}/g, firstName)
      message = message.replace(/\{lastName\}/g, lastName)
    }

    message = message.replace(/\{propertyAddress\}/g, contact.propertyAddress || "")
    message = message.replace(/\{cityState\}/g, contact.cityState || "")
    message = message.replace(/\{propertyType\}/g, contact.propertyType || "")
    message = message.replace(/\{llcName\}/g, contact.llcName || "")

    return message
  }

  const startSending = async () => {
    if (selectedContacts.length === 0 || !selectedTemplate) {
      toast({
        title: "Cannot send messages",
        description: "Please select contacts and a message template",
        variant: "destructive",
      })
      return
    }

    if (senderNumbers.length === 0) {
      toast({
        title: "Cannot send messages",
        description: "Please add at least one sender phone number",
        variant: "destructive",
      })
      return
    }

    const template = templates.find((t) => t.id === selectedTemplate)
    if (!template) return

    setIsSending(true)
    setIsPaused(false)
    setSentCount(0)
    setProgress(0)

    // Add to global process tracking
    const processId = addProcess({
      type: "text",
      label: `Text Blast (${selectedContacts.length} contacts)`,
      progress: 0,
      total: selectedContacts.length,
      isPaused: false,
    })

    setCurrentProcessId(processId)

    toast({
      title: "Text Blast Started",
      description: `Sending messages to ${selectedContacts.length} contacts`,
    })

    const selectedContactsData = contacts.filter((c) => selectedContacts.includes(c.id))
    const totalContacts = selectedContactsData.length

    // Simulate sending messages with rotating numbers
    for (let i = 0; i < selectedContactsData.length; i++) {
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

      const contact = selectedContactsData[i]
      const senderNumber = senderNumbers[i % senderNumbers.length]
      const message = formatMessage(template.content, contact)

      // Simulate API call to send message
      console.log(`Sending to ${contact.phoneNumber} from ${senderNumber}: ${message}`)

      // In a real app, you would call your SMS API here
      // await sendSMS(contact.phoneNumber, senderNumber, message);

      // Update progress
      setSentCount(i + 1)
      setProgress(Math.round(((i + 1) / totalContacts) * 100))

      // Update global process state
      if (currentProcessId) {
        updateProcess(currentProcessId, { progress: i + 1 })
      }

      // Add random delay between messages
      const delay = Math.floor(Math.random() * (delayMax - delayMin + 1) + delayMin)
      await new Promise((resolve) => setTimeout(resolve, delay * 1000))
    }

    setIsSending(false)

    toast({
      title: "Bulk messaging complete",
      description: `Successfully sent ${selectedContactsData.length} messages`,
    })
  }

  const pauseSending = () => {
    setIsPaused(true)

    // Update global process state
    if (currentProcessId) {
      pauseProcess(currentProcessId)
      toast({
        title: "Text Blast Paused",
        description: "Message sending has been paused",
      })
    }
  }

  const resumeSending = () => {
    setIsPaused(false)

    // Update global process state
    if (currentProcessId) {
      resumeProcess(currentProcessId)
      toast({
        title: "Text Blast Resumed",
        description: "Message sending has been resumed",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Bulk Messaging</h2>
        <p className="text-muted-foreground mb-4">Send messages to multiple contacts using rotating phone numbers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Select Contacts</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {(selectedTags.length > 0 || selectedPropertyTypes.length > 0 || selectedCities.length > 0) && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedTags.length + selectedPropertyTypes.length + selectedCities.length}
                    </Badge>
                  )}
                </Button>
              </div>

              {showFilters ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md bg-muted/30">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Tags</h4>
                    <ScrollArea className="h-[150px]">
                      <div className="space-y-2 pr-4">
                        {allTags.map((tag) => (
                          <div key={tag} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tag-${tag}`}
                              checked={selectedTags.includes(tag)}
                              onCheckedChange={() => handleTagFilter(tag)}
                            />
                            <Label htmlFor={`tag-${tag}`} className="text-sm">
                              {tag}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Property Types</h4>
                    <ScrollArea className="h-[150px]">
                      <div className="space-y-2 pr-4">
                        {allPropertyTypes.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`type-${type}`}
                              checked={selectedPropertyTypes.includes(type)}
                              onCheckedChange={() => handlePropertyTypeFilter(type)}
                            />
                            <Label htmlFor={`type-${type}`} className="text-sm">
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Locations</h4>
                    <ScrollArea className="h-[150px]">
                      <div className="space-y-2 pr-4">
                        {allCities.map((city) => (
                          <div key={city} className="flex items-center space-x-2">
                            <Checkbox
                              id={`city-${city}`}
                              checked={selectedCities.includes(city)}
                              onCheckedChange={() => handleCityFilter(city)}
                            />
                            <Label htmlFor={`city-${city}`} className="text-sm">
                              {city}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md mb-4">
                  <Users size={18} className="text-muted-foreground" />
                  <span>
                    {filteredContacts.length} contact{filteredContacts.length !== 1 ? "s" : ""} selected
                  </span>
                </div>
              )}

              <div className="border rounded-md">
                <div className="flex items-center p-3 border-b bg-muted/50">
                  <div className="flex items-center space-x-2 w-10">
                    <Checkbox
                      id="select-all"
                      checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </div>
                  <div className="grid grid-cols-4 flex-1 gap-4 text-sm font-medium">
                    <div>Name</div>
                    <div>Phone</div>
                    <div>Property Address</div>
                    <div>Property Type</div>
                  </div>
                </div>

                <ScrollArea className="h-[300px]">
                  {filteredContacts.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground">No contacts found</p>
                    </div>
                  ) : (
                    filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className={`flex items-center p-3 border-b hover:bg-muted/50 ${
                          selectedContacts.includes(contact.id) ? "bg-muted/50" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-2 w-10">
                          <Checkbox
                            id={`select-${contact.id}`}
                            checked={selectedContacts.includes(contact.id)}
                            onCheckedChange={() => toggleContactSelection(contact.id)}
                          />
                        </div>
                        <div className="grid grid-cols-4 flex-1 gap-4 text-sm">
                          <div>{contact.name}</div>
                          <div>{contact.phoneNumber}</div>
                          <div>{contact.propertyAddress}</div>
                          <div>{contact.propertyType}</div>
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </div>

              <div className="text-sm text-muted-foreground">
                {selectedContacts.length} of {filteredContacts.length} contacts selected
              </div>
              <Input
                type="search"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-4"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-medium">Select Message Template</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`border rounded-md p-4 cursor-pointer hover:border-primary transition-colors ${
                      selectedTemplate === template.id ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      {selectedTemplate === template.id && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{template.content}</p>
                  </div>
                ))}

                {templates.length === 0 && (
                  <div className="col-span-2 p-8 text-center border rounded-md">
                    <p className="text-muted-foreground">No templates available</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        /* Navigate to templates tab */
                      }}
                    >
                      Create a template
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-medium">Sender Phone Numbers</h3>
              <p className="text-sm text-muted-foreground">Messages will be sent using these numbers in rotation</p>

              <div className="space-y-2">
                {senderNumbers.map((number, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{number}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeSenderNumber(number)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {senderNumbers.length === 0 && <p className="text-sm text-muted-foreground">No sender numbers added</p>}
              </div>

              <div className="flex gap-2 mt-2">
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
            <CardContent className="p-6 space-y-4">
              <h3 className="font-medium">Message Delay Settings</h3>
              <p className="text-sm text-muted-foreground">Set the delay between messages (in seconds)</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="delay-min">Minimum Delay</Label>
                  <Input
                    id="delay-min"
                    type="number"
                    min="1"
                    max="60"
                    value={delayMin}
                    onChange={(e) => setDelayMin(Number.parseInt(e.target.value))}
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
                    onChange={(e) => setDelayMax(Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                A random delay between {delayMin} and {delayMax} seconds will be applied between messages to avoid rate
                limits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-medium">Messaging Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Selected Contacts:</span>
                  <span className="font-medium">{getSelectedContactsCount()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">Template:</span>
                  <span className="font-medium">{getSelectedTemplate()?.name || "None"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">Sender Numbers:</span>
                  <span className="font-medium">{senderNumbers.length}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">Estimated Time:</span>
                  <span className="font-medium">
                    {getSelectedContactsCount() > 0
                      ? `~${Math.ceil((getSelectedContactsCount() * ((delayMin + delayMax) / 2)) / 60)} minutes`
                      : "N/A"}
                  </span>
                </div>
              </div>

              {isSending && (
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress:</span>
                    <span>
                      {sentCount} of {getSelectedContactsCount()}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {isSending ? (
                <div className="flex gap-2">
                  {isPaused ? (
                    <Button onClick={resumeSending} className="flex-1 flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Resume Sending
                    </Button>
                  ) : (
                    <Button onClick={pauseSending} className="flex-1 flex items-center gap-2">
                      <Pause className="h-4 w-4" />
                      Pause Sending
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  onClick={startSending}
                  className="w-full flex items-center gap-2"
                  disabled={getSelectedContactsCount() === 0 || !selectedTemplate || senderNumbers.length === 0}
                >
                  <Send className="h-4 w-4" />
                  Start Sending Messages
                </Button>
              )}

              {(getSelectedContactsCount() === 0 || !selectedTemplate || senderNumbers.length === 0) && (
                <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Cannot send messages</p>
                    <ul className="list-disc list-inside mt-1 text-xs">
                      {getSelectedContactsCount() === 0 && <li>Select at least one contact</li>}
                      {!selectedTemplate && <li>Select a message template</li>}
                      {senderNumbers.length === 0 && <li>Add at least one sender phone number</li>}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
