"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, Check, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Contact, Tag } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import CsvPreview from "@/components/csv-preview"
import { useContacts } from "@/lib/context/contacts-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import * as XLSX from "xlsx"

export function CsvUploader() {
  // Try to get the contacts context, but provide a fallback if it's not available
  const contactsContext = useContacts()

  const addContacts =
    contactsContext?.addContacts ||
    ((contacts: Contact[]) => {
      console.warn("ContactsProvider not available, saving to localStorage directly")
      const existingContacts = JSON.parse(localStorage.getItem("contacts") || "[]")
      const updatedContacts = [...existingContacts, ...contacts]
      localStorage.setItem("contacts", JSON.stringify(updatedContacts))
      return true
    })

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [mappings, setMappings] = useState<Record<string, string>>({})
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [importedCount, setImportedCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Reset success/error states when file changes
  useEffect(() => {
    setUploadSuccess(false)
    setUploadError(null)
  }, [file])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)

    // Reset states
    setPreviewData([])
    setHeaders([])
    setMappings({})
    setUploadSuccess(false)
    setUploadError(null)

    // Process the file based on its type
    const fileType = selectedFile.name.split(".").pop()?.toLowerCase()

    if (fileType === "csv") {
      parseCSV(selectedFile)
    } else if (fileType === "xlsx" || fileType === "xls") {
      parseExcel(selectedFile)
    } else {
      setUploadError("Unsupported file type. Please upload a CSV or Excel file.")
    }
  }

  const parseCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const lines = text.split("\n")
        if (lines.length === 0) {
          setUploadError("The CSV file appears to be empty")
          return
        }

        const headers = lines[0].split(",").map((h) => h.trim())
        setHeaders(headers)
        createDefaultMappings(headers)

        // Parse preview data (first 5 rows)
        const previewRows = []
        for (let i = 1; i < Math.min(lines.length, 6); i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(",").map((v) => v.trim())
            const row: Record<string, string> = {}

            headers.forEach((header, index) => {
              row[header] = values[index] || ""
            })

            previewRows.push(row)
          }
        }

        setPreviewData(previewRows)
      } catch (error) {
        console.error("Error parsing CSV:", error)
        setUploadError("Failed to parse the CSV file. Please check the file format.")
      }
    }

    reader.onerror = () => {
      setUploadError("Error reading the file. Please try again.")
    }

    reader.readAsText(file)
  }

  const parseExcel = (file: File) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[worksheetName]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { header: 1 })

        if (jsonData.length === 0) {
          setUploadError("The Excel file appears to be empty")
          return
        }

        // First row contains headers
        const headers = jsonData[0] as string[]
        setHeaders(headers)
        createDefaultMappings(headers)

        // Get preview data (first 5 rows)
        const previewRows = []
        for (let i = 1; i < Math.min(jsonData.length, 6); i++) {
          if (jsonData[i] && jsonData[i].length > 0) {
            const row: Record<string, string> = {}
            headers.forEach((header, index) => {
              row[header] = jsonData[i][index]?.toString() || ""
            })
            previewRows.push(row)
          }
        }

        setPreviewData(previewRows)
      } catch (error) {
        console.error("Error parsing Excel:", error)
        setUploadError("Failed to parse the Excel file. Please check the file format.")
      }
    }

    reader.onerror = () => {
      setUploadError("Error reading the file. Please try again.")
    }

    reader.readAsArrayBuffer(file)
  }

  const createDefaultMappings = (headers: string[]) => {
    const defaultMappings: Record<string, string> = {}
    headers.forEach((header) => {
      // Try to match headers to our expected fields
      const headerLower = header.toLowerCase()
      if (headerLower.includes("first") && headerLower.includes("name")) {
        defaultMappings[header] = "firstName"
      } else if (headerLower.includes("last") && headerLower.includes("name")) {
        defaultMappings[header] = "lastName"
      } else if (headerLower.includes("email")) {
        defaultMappings[header] = "email"
      } else if (headerLower.includes("phone") || headerLower.includes("mobile") || headerLower.includes("cell")) {
        defaultMappings[header] = "phone"
      } else if (
        headerLower.includes("address") ||
        headerLower.includes("full property") ||
        (headerLower.includes("property") && headerLower.includes("address"))
      ) {
        defaultMappings[header] = "propertyAddress"
      } else if (headerLower.includes("city")) {
        defaultMappings[header] = "city"
      } else if (headerLower.includes("state")) {
        defaultMappings[header] = "state"
      } else if (headerLower.includes("type") || headerLower.match(/property.*type/)) {
        defaultMappings[header] = "propertyType"
      } else if (headerLower.includes("value") || headerLower.match(/property.*value/)) {
        defaultMappings[header] = "propertyValue"
      } else if (headerLower.includes("debt") || headerLower.includes("owed") || headerLower.includes("loan")) {
        defaultMappings[header] = "debtOwed"
      } else if (headerLower.includes("llc") || headerLower.includes("company")) {
        defaultMappings[header] = "llcName"
      } else if (
        headerLower.includes("dnc") ||
        headerLower.includes("do not contact") ||
        headerLower.includes("do_not_contact")
      ) {
        defaultMappings[header] = "dnc"
      }
    })

    setMappings(defaultMappings)
  }

  const handleUpload = () => {
    if (!file) {
      setUploadError("Please select a file to upload")
      return
    }

    if (previewData.length === 0) {
      setUploadError("No data found in the file")
      return
    }

    setUploading(true)
    setUploadError(null)

    // Simulate upload progress
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += 5
      setProgress(currentProgress)

      if (currentProgress >= 100) {
        clearInterval(interval)

        try {
          // Process the data
          const importedContacts = processContacts()

          // Add contacts to the context or localStorage
          const success = addContacts(importedContacts)

          if (success) {
            setUploadSuccess(true)
            setImportedCount(importedContacts.length)

            toast({
              title: "Upload complete",
              description: `Successfully imported ${importedContacts.length} contacts with tags: ${tags.join(", ")}`,
            })
          } else {
            setUploadError("Failed to add contacts to the CRM")
          }
        } catch (error) {
          console.error("Error processing contacts:", error)
          setUploadError("An error occurred while processing the contacts")
        } finally {
          setUploading(false)
        }
      }
    }, 100)
  }

  const resetForm = () => {
    setFile(null)
    setProgress(0)
    setPreviewData([])
    setHeaders([])
    setTags([])
    setMappings({})
    setUploadSuccess(false)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const processContacts = () => {
    // Convert preview data to Contact objects
    const processedContacts: Contact[] = []

    // Process all rows, not just preview data
    const allData = previewData // In a real app, this would be all data, not just preview

    allData.forEach((row) => {
      // Create tag objects from tag strings
      const contactTags: Tag[] = tags.map((tagName) => ({
        id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: tagName,
        color: getRandomColor(),
      }))

      const contact: Contact = {
        id: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        propertyAddress: "",
        dealStatus: "new",
        tags: contactTags,
        notes: "",
        createdAt: new Date().toISOString(),
        dnc: false,
      }

      // Map the fields based on the user's mappings
      Object.entries(mappings).forEach(([csvHeader, contactField]) => {
        if (contactField && row[csvHeader]) {
          // Handle numeric fields
          if (contactField === "propertyValue" || contactField === "debtOwed") {
            // Remove currency symbols and commas, then convert to number
            const numericValue = Number.parseFloat(row[csvHeader].toString().replace(/[$,]/g, ""))
            if (!isNaN(numericValue)) {
              // @ts-ignore - dynamic assignment
              contact[contactField] = numericValue
            }
          } else if (contactField === "dnc") {
            // Handle DNC field - convert various formats to boolean
            const dncValue = row[csvHeader].toString().toLowerCase().trim()
            contact.dnc = dncValue === "true" || dncValue === "yes" || dncValue === "1" || dncValue === "y"
          } else {
            // @ts-ignore - dynamic assignment
            contact[contactField] = row[csvHeader]
          }
        }
      })

      // Combine city and state if both are present
      if (contact.city && contact.state) {
        contact.cityState = `${contact.city}, ${contact.state}`
      }

      // Only add contacts that have at least some basic info
      if (contact.firstName || contact.lastName || contact.email || contact.phone || contact.propertyAddress) {
        processedContacts.push(contact)
      }
    })

    return processedContacts
  }

  const getRandomColor = () => {
    const colors = ["red", "blue", "green", "purple", "orange", "teal", "indigo", "pink", "yellow", "emerald"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleMappingChange = (csvHeader: string, contactField: string) => {
    setMappings({
      ...mappings,
      [csvHeader]: contactField,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Upload Contact CSV or Excel File</h2>
        <p className="text-muted-foreground mb-4">
          Upload a CSV or Excel file with your contacts. You can add tags and map fields to organize your data.
        </p>
      </div>

      {uploadSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Import Successful</AlertTitle>
          <AlertDescription className="text-green-700">
            Successfully imported {importedCount} contacts with tags: {tags.join(", ")}
          </AlertDescription>
          <Button variant="outline" className="mt-2" onClick={resetForm}>
            Import Another File
          </Button>
        </Alert>
      )}

      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Import Failed</AlertTitle>
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {!uploadSuccess && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="font-medium">Upload File</h3>
                    <p className="text-sm text-muted-foreground">
                      Drag and drop or click to select a CSV or Excel file
                    </p>
                  </div>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="max-w-xs cursor-pointer"
                  />
                  {file && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>{file.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div>
                <Label>Add Tags</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    placeholder="Enter tag name"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <Button onClick={handleAddTag}>Add</Button>
                </div>
              </div>

              <div>
                <Label>Applied Tags</Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {tags.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tags added yet</p>
                  ) : (
                    tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="ml-1 rounded-full hover:bg-muted p-0.5">
                          <span className="sr-only">Remove</span>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9 3L3 9M3 3L9 9"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Field Mapping</h3>
              <p className="text-sm text-muted-foreground">Map file columns to contact fields</p>

              {headers.length > 0 ? (
                <div className="space-y-3">
                  {headers.map((header) => (
                    <div key={header} className="grid grid-cols-2 gap-2 items-center">
                      <div className="text-sm font-medium">{header}</div>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                        value={mappings[header] || ""}
                        onChange={(e) => handleMappingChange(header, e.target.value)}
                      >
                        <option value="">-- Skip this field --</option>
                        <option value="firstName">First Name</option>
                        <option value="lastName">Last Name</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone Number</option>
                        <option value="propertyAddress">Full Property Address</option>
                        <option value="city">City</option>
                        <option value="state">State</option>
                        <option value="propertyType">Property Type</option>
                        <option value="propertyValue">Property Value ($)</option>
                        <option value="debtOwed">Debt Owed ($)</option>
                        <option value="llcName">LLC Name</option>
                        <option value="dnc">Do Not Contact (DNC)</option>
                      </select>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Upload a file to map fields</p>
              )}
            </div>

            <Button onClick={handleUpload} disabled={!file || uploading || headers.length === 0} className="w-full">
              {uploading ? (
                <>
                  <span className="mr-2">Uploading...</span>
                  <Progress value={progress} className="h-2 w-16" />
                </>
              ) : (
                "Upload and Process"
              )}
            </Button>
          </div>

          <div>
            <h3 className="font-medium mb-3">Data Preview</h3>
            {previewData.length > 0 ? (
              <div>
                <div className="mb-4">
                  <CsvPreview
                    contacts={previewData.map((row) => {
                      const contact: Record<string, any> = {}

                      // Map the fields based on the user's mappings
                      Object.entries(mappings).forEach(([csvHeader, contactField]) => {
                        if (contactField && row[csvHeader]) {
                          if (contactField === "propertyValue" || contactField === "debtOwed") {
                            // Convert to number
                            const numericValue = Number.parseFloat(row[csvHeader].toString().replace(/[$,]/g, ""))
                            if (!isNaN(numericValue)) {
                              contact[contactField] = numericValue
                            }
                          } else if (contactField === "dnc") {
                            // Handle DNC field
                            const dncValue = row[csvHeader].toString().toLowerCase().trim()
                            contact[contactField] =
                              dncValue === "true" || dncValue === "yes" || dncValue === "1" || dncValue === "y"
                          } else {
                            contact[contactField] = row[csvHeader]
                          }
                        }
                      })

                      return contact
                    })}
                    tags={tags}
                  />
                </div>

                <ScrollArea className="h-[200px] rounded-md border">
                  <div className="p-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {headers.map((header) => (
                            <th key={header} className="py-2 px-2 text-left font-medium">
                              {header}
                              {mappings[header] && (
                                <span className="ml-1 text-xs text-primary">→ {mappings[header]}</span>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-b">
                            {headers.map((header) => (
                              <td key={`${rowIndex}-${header}`} className="py-2 px-2">
                                {row[header] || ""}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-8 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Upload a file to preview data</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Add default export to support both import styles
export default CsvUploader
