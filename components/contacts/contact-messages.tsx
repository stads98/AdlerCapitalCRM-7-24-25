"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getMessagesByContactId } from "@/lib/mock-data"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ContactMessagesProps {
  contactId: string
}

export default function ContactMessages({ contactId }: ContactMessagesProps) {
  const [messages, setMessages] = useState(getMessagesByContactId(contactId))
  const [newMessage, setNewMessage] = useState("")
  const { toast } = useToast()

  // Refresh messages when contactId changes
  useEffect(() => {
    setMessages(getMessagesByContactId(contactId))
  }, [contactId])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      // Create a new message
      const newMsg = {
        id: `msg-${Date.now()}`,
        contactId,
        text: newMessage,
        timestamp: new Date().toISOString(),
        isInbound: false,
      }

      // In a real app, this would send the message via API
      // For now, we'll just update the local state
      setMessages([...messages, newMsg])
      setNewMessage("")

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>No messages yet</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.isInbound ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[75%] p-3 rounded-lg ${
                  message.isInbound ? "bg-gray-100 text-gray-900" : "bg-primary text-primary-foreground"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${message.isInbound ? "text-gray-500" : "text-primary-foreground/80"}`}>
                  {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          <Button type="submit" className="self-end" disabled={!newMessage.trim()}>
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  )
}
