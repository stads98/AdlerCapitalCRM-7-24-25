"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import type { Contact } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Phone } from "lucide-react"

interface ContactsListProps {
  contacts: Contact[]
  onContactSelect: (contact: Contact) => void
  onEditContact: (contact: Contact) => void
  onDeleteContact: (contactId: string) => void
}

const ContactsList: React.FC<ContactsListProps> = ({ contacts, onContactSelect, onEditContact, onDeleteContact }) => {
  return (
    <div>
      {contacts.map((contact) => (
        <div key={contact.id} className="relative group">
          <Card className="hover:shadow-lg transition-shadow duration-150 ease-in-out">
            <button
              onClick={() => onContactSelect(contact)}
              className="block w-full text-left p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
              aria-label={`View details for ${contact.firstName} ${contact.lastName}`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-primary truncate group-hover:underline">
                    {contact.firstName} {contact.lastName}
                  </h3>
                  {contact.dnc && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      DNC
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{contact.phone}</p>
                <address className="text-sm text-muted-foreground not-italic">{contact.propertyAddress}</address>
                {contact.tags && contact.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {contact.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className={`bg-${tag.color}-100 text-${tag.color}-800 border-${tag.color}-200`}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </button>
          </Card>
          <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-in-out z-10">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-green-600 hover:bg-green-100"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                // Create and click a temporary anchor element instead of using window.open
                const a = document.createElement("a")
                a.href = `tel:${contact.phone}`
                a.setAttribute("target", "_blank")
                a.click()
              }}
              title="Call Contact"
            >
              <Phone size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600 hover:bg-blue-100"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onEditContact(contact)
              }}
              title="Edit Contact"
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:bg-red-100"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onDeleteContact(contact.id)
              }}
              title="Delete Contact"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ContactsList
