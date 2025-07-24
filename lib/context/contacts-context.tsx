"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import type { Contact } from "@/lib/types"
import { mockContacts } from "@/lib/mock-contacts"

interface ContactsContextType {
  contacts: Contact[]
  addContact: (contact: Contact) => void
  addContacts: (contacts: Contact[]) => void
  updateContact: (id: string, updates: Partial<Contact>) => void
  deleteContact: (id: string) => void
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined)

export function ContactsProvider({ children }: { children: React.ReactNode }) {
  // Initialize with mock contacts
  const [contacts, setContacts] = useState<Contact[]>(mockContacts)

  // Load contacts from localStorage on initial render
  useEffect(() => {
    const storedContacts = localStorage.getItem("telnyx-contacts")
    if (storedContacts) {
      try {
        const parsed = JSON.parse(storedContacts)
        setContacts(parsed)
      } catch (error) {
        console.error("Error parsing stored contacts:", error)
        setContacts(mockContacts)
      }
    } else {
      // If no stored contacts, use mock data
      setContacts(mockContacts)
      localStorage.setItem("telnyx-contacts", JSON.stringify(mockContacts))
    }
  }, [])

  // Save contacts to localStorage whenever they change
  useEffect(() => {
    if (contacts.length > 0) {
      localStorage.setItem("telnyx-contacts", JSON.stringify(contacts))
    }
  }, [contacts])

  const addContact = (contact: Contact) => {
    setContacts((prev) => [contact, ...prev])
  }

  const addContacts = (newContacts: Contact[]) => {
    setContacts((prev) => [...prev, ...newContacts])
  }

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts((prev) => prev.map((contact) => (contact.id === id ? { ...contact, ...updates } : contact)))
  }

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id))
  }

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        addContact,
        addContacts,
        updateContact,
        deleteContact,
      }}
    >
      {children}
    </ContactsContext.Provider>
  )
}

export function useContacts() {
  const context = useContext(ContactsContext)
  if (context === undefined) {
    throw new Error("useContacts must be used within a ContactsProvider")
  }
  return context
}
