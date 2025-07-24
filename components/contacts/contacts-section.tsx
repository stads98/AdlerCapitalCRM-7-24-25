"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import ContactsList from "./contacts-list"
import ContactFilters from "./contact-filters"
import AddContactDialog from "./add-contact-dialog"
import EditContactDialog from "./edit-contact-dialog"
import ContactDetails from "./contact-details" // Import ContactDetails
import { useContacts } from "@/lib/context/contacts-context"
import type { Contact } from "@/lib/types"
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

export default function ContactsSection() {
  const { contacts, addContact, updateContact, deleteContact } = useContacts()
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [contactToDelete, setContactToDelete] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null) // State for selected contact
  const [filters, setFilters] = useState({
    minValue: undefined as number | undefined,
    maxValue: undefined as number | undefined,
    minEquity: undefined as number | undefined,
    maxEquity: undefined as number | undefined,
    propertyTypes: [] as string[],
  })

  // Filter contacts based on search term and filters
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        searchTerm === "" ||
        `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchLower) ||
        (contact.phone && contact.phone.includes(searchTerm)) ||
        (contact.propertyAddress && contact.propertyAddress.toLowerCase().includes(searchLower)) ||
        (contact.email && contact.email.toLowerCase().includes(searchLower))

      const propertyValue = contact.propertyValue || 0
      const matchesMinValue = filters.minValue === undefined || propertyValue >= filters.minValue
      const matchesMaxValue = filters.maxValue === undefined || propertyValue <= filters.maxValue

      const equity = (contact.propertyValue || 0) - (contact.debtOwed || 0)
      const matchesMinEquity = filters.minEquity === undefined || equity >= filters.minEquity
      const matchesMaxEquity = filters.maxEquity === undefined || equity <= filters.maxEquity

      const matchesPropertyType =
        filters.propertyTypes.length === 0 ||
        (contact.propertyType && filters.propertyTypes.includes(contact.propertyType))

      return (
        matchesSearch &&
        matchesMinValue &&
        matchesMaxValue &&
        matchesMinEquity &&
        matchesMaxEquity &&
        matchesPropertyType
      )
    })
  }, [contacts, searchTerm, filters])

  const handleDeleteContact = (contactId: string) => {
    setContactToDelete(contactId)
    setShowDeleteDialog(true)
  }

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact)
    setShowEditDialog(true)
  }

  const confirmDelete = () => {
    if (contactToDelete) {
      deleteContact(contactToDelete)
      setContactToDelete(null)
      setShowDeleteDialog(false)
      if (selectedContact?.id === contactToDelete) {
        setSelectedContact(null) // Clear selected contact if it was deleted
      }
    }
  }

  const handleAddContact = (newContactData: Omit<Contact, "id" | "createdAt">) => {
    const newContact: Contact = {
      ...newContactData,
      id: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }
    addContact(newContact)
    setShowAddDialog(false)
  }

  const handleUpdateContact = (id: string, updates: Partial<Contact>) => {
    updateContact(id, updates)
    setShowEditDialog(false)
    setEditingContact(null)
    if (selectedContact?.id === id) {
      setSelectedContact((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact)
  }

  const handleBackToList = () => {
    setSelectedContact(null)
  }

  const hasActiveFilters =
    filters.minValue !== undefined ||
    filters.maxValue !== undefined ||
    filters.minEquity !== undefined ||
    filters.maxEquity !== undefined ||
    filters.propertyTypes.length > 0

  if (selectedContact) {
    return <ContactDetails contact={selectedContact} onBack={handleBackToList} />
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Contacts</h1>
            <p className="text-gray-600">View, filter, and manage your property contacts</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Add Contact
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Collapsible Filters */}
      <ContactFilters filters={filters} onFiltersChange={setFilters} />

      {/* Results Summary */}
      <div className="px-6 py-2 bg-gray-50 border-b text-sm text-gray-600">
        Showing {filteredContacts.length} of {contacts.length} contacts
        {hasActiveFilters && <span className="ml-2 text-blue-600">(filtered)</span>}
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm || hasActiveFilters ? (
              <div>
                <p className="mb-2">No contacts found matching your criteria</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setFilters({
                      minValue: undefined,
                      maxValue: undefined,
                      minEquity: undefined,
                      maxEquity: undefined,
                      propertyTypes: [],
                    })
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div>
                <p className="mb-4">No contacts yet</p>
                <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
                  <Plus size={16} />
                  Add your first contact
                </Button>
              </div>
            )}
          </div>
        ) : (
          <ContactsList
            contacts={filteredContacts}
            onDeleteContact={handleDeleteContact}
            onEditContact={handleEditContact}
            onContactSelect={handleContactSelect} // Pass the handler here
          />
        )}
      </div>

      {/* Add Contact Dialog */}
      <AddContactDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAddContact={handleAddContact} />

      {/* Edit Contact Dialog */}
      {editingContact && ( // Ensure editingContact is not null before rendering
        <EditContactDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          contact={editingContact}
          onUpdateContact={handleUpdateContact}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
