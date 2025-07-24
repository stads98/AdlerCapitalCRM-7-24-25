"use client"

import { useState, useEffect } from "react"
import { getEmailsByContactId } from "@/lib/mock-data"
import { formatDistanceToNow, format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Mail, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface ContactEmailsProps {
  contactId: string
}

export default function ContactEmails({ contactId }: ContactEmailsProps) {
  const [emails, setEmails] = useState(getEmailsByContactId(contactId))
  const [showComposeDialog, setShowComposeDialog] = useState(false)
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const { toast } = useToast()

  // Refresh emails when contactId changes
  useEffect(() => {
    setEmails(getEmailsByContactId(contactId))
  }, [contactId])

  const handleSendEmail = () => {
    if (!subject.trim() || !body.trim()) return

    // In a real app, this would send the email via API
    const newEmail = {
      id: `email-${Date.now()}`,
      contactId,
      subject,
      body,
      timestamp: new Date().toISOString(),
      isInbound: false,
    }

    setEmails([newEmail, ...emails])
    setShowComposeDialog(false)
    setSubject("")
    setBody("")

    toast({
      title: "Email sent",
      description: "Your email has been sent successfully",
    })
  }

  const handleReply = (emailId: string) => {
    const originalEmail = emails.find((email) => email.id === emailId)
    if (!originalEmail) return

    setSubject(`Re: ${originalEmail.subject}`)
    setBody(`\n\n-------- Original Message --------\n${originalEmail.body}`)
    setShowComposeDialog(true)
  }

  const handleForward = (emailId: string) => {
    const originalEmail = emails.find((email) => email.id === emailId)
    if (!originalEmail) return

    setSubject(`Fwd: ${originalEmail.subject}`)
    setBody(`\n\n-------- Forwarded Message --------\n${originalEmail.body}`)
    setShowComposeDialog(true)
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Email History</h3>
        <Button onClick={() => setShowComposeDialog(true)}>
          <Mail size={16} className="mr-2" />
          Compose Email
        </Button>
      </div>

      {emails.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No email history</p>
        </div>
      ) : (
        <div className="space-y-4">
          {emails.map((email) => (
            <div key={email.id} className="border rounded-md p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  {email.isInbound ? (
                    <ArrowDownLeft size={18} className="text-blue-500 mr-2" />
                  ) : (
                    <ArrowUpRight size={18} className="text-green-500 mr-2" />
                  )}
                  <span className="font-medium">{email.subject}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {format(new Date(email.timestamp), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>

              <div className="text-sm text-gray-500 mb-3 flex items-center">
                <span>
                  {email.isInbound ? "From" : "To"}: {email.isInbound ? "Contact" : "You"}
                </span>
                <span className="mx-2">•</span>
                <span>{formatDistanceToNow(new Date(email.timestamp), { addSuffix: true })}</span>
              </div>

              <div className="bg-gray-50 p-3 rounded-md mb-3">
                <p className="text-sm whitespace-pre-line">{email.body}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleReply(email.id)}>
                  Reply
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleForward(email.id)}>
                  Forward
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compose Email Dialog */}
      <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-body">Message</Label>
                <Textarea
                  id="email-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your email here..."
                  rows={10}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComposeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={!subject.trim() || !body.trim()}>
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
