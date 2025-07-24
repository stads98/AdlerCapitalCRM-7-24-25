"use client"

import { useState, useEffect } from "react"
import { useContacts } from "@/lib/context/contacts-context"
import TextConversationsList from "@/components/text/text-conversations-list"
import TextConversation from "@/components/text/text-conversation"
import TextBlast from "@/components/text/text-blast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMediaQuery } from "@/hooks/use-media-query"
import { MessageSquare, Send } from "lucide-react"
import type { Contact } from "@/lib/types"

export default function TextCenter() {
  const { contacts } = useContacts()
  const [activeTab, setActiveTab] = useState("conversations")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showConversation, setShowConversation] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Reset selected contact when changing tabs
  useEffect(() => {
    setSelectedContact(null)
    setShowConversation(false)
  }, [activeTab])

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact)
    if (isMobile) {
      setShowConversation(true)
    }
  }

  const handleBackToList = () => {
    setShowConversation(false)
  }

  if (isMobile && showConversation && selectedContact) {
    return <TextConversation contact={selectedContact} onBack={handleBackToList} />
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Text Center</h2>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="conversations" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Conversations</span>
            </TabsTrigger>
            <TabsTrigger value="blast" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              <span>Text Blast</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="conversations" className="m-0">
              <div className="flex h-[calc(100vh-180px)]">
                <div className={`${isMobile ? "w-full" : "w-1/3 border-r"}`}>
                  <TextConversationsList
                    contacts={contacts}
                    selectedContactId={selectedContact?.id}
                    onSelectContact={handleSelectContact}
                  />
                </div>
                {!isMobile && (
                  <div className="w-2/3">
                    {selectedContact ? (
                      <TextConversation contact={selectedContact} />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <p>Select a conversation to start messaging</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="blast" className="m-0">
              <TextBlast />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
