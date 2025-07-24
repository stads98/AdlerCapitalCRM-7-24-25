"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Contact } from "@/lib/types"

interface EditContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: Contact | null
  onUpdateContact?: (id: string, updates: Partial<Contact>) => void
}

export default function EditContactDialog({ open, onOpenChange, contact, onUpdateContact }: EditContactDialogProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    propertyAddress: "",
    city: "",
    state: "",
    propertyType: "single-family",
    propertyValue: "",
    debtOwed: "",
    dealStatus: "new",
    notes: "",
  })

  // Update form data when contact changes
  useEffect(() => {
    if (contact) {
      setFormData({
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        email: contact.email || "",
        phone: contact.phone || "",
        propertyAddress: contact.propertyAddress || "",
        city: contact.city || "",
        state: contact.state || "",
        propertyType: contact.propertyType || "single-family",
        propertyValue: contact.propertyValue?.toString() || "",
        debtOwed: contact.debtOwed?.toString() || "",
        dealStatus: contact.dealStatus || "new",
        notes: contact.notes || "",
      })
    }
  }, [contact])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (onUpdateContact && contact) {
      const propertyValue = formData.propertyValue ? Number.parseInt(formData.propertyValue) : undefined
      const debtOwed = formData.debtOwed ? Number.parseInt(formData.debtOwed) : undefined

      onUpdateContact(contact.id, {
        ...formData,
        propertyValue,
        debtOwed,
        cityState: formData.city && formData.state ? `${formData.city}, ${formData.state}` : undefined,
      })
    }

    onOpenChange(false)
  }

  // Calculate equity if both values are present
  const propertyValue = formData.propertyValue ? Number.parseInt(formData.propertyValue) : 0
  const debtOwed = formData.debtOwed ? Number.parseInt(formData.debtOwed) : 0
  const hasEquityValues = formData.propertyValue && formData.debtOwed
  const equity = hasEquityValues ? propertyValue - debtOwed : null

  if (!contact) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name*</Label>
              <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name*</Label>
              <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number*</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyAddress">Property Address*</Label>
            <Input
              id="propertyAddress"
              name="propertyAddress"
              value={formData.propertyAddress}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" value={formData.city} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" value={formData.state} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyType">Property Type</Label>
            <Select value={formData.propertyType} onValueChange={(value) => handleSelectChange("propertyType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single-family">Single Family</SelectItem>
                <SelectItem value="duplex">Duplex</SelectItem>
                <SelectItem value="triplex">Triplex</SelectItem>
                <SelectItem value="quadplex">Quadplex</SelectItem>
                <SelectItem value="multi-family">Multi-Family</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyValue">Property Value ($)</Label>
              <Input
                id="propertyValue"
                name="propertyValue"
                type="number"
                value={formData.propertyValue}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debtOwed">Debt Owed ($)</Label>
              <Input id="debtOwed" name="debtOwed" type="number" value={formData.debtOwed} onChange={handleChange} />
            </div>
          </div>

          {hasEquityValues && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
              <p className="text-blue-700 font-medium">Equity: ${equity?.toLocaleString()}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="dealStatus">Deal Status</Label>
            <Select value={formData.dealStatus} onValueChange={(value) => handleSelectChange("dealStatus", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select deal status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Contact</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
