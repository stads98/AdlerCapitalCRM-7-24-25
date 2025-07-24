"use client"

import { useState, useEffect } from "react"
import { getCallsByContactId } from "@/lib/mock-data"
import { formatDistanceToNow, format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Phone, PhoneOff, VoicemailIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface ContactCallsProps {
  contactId: string
}

export default function ContactCalls({ contactId }: ContactCallsProps) {
  const [calls, setCalls] = useState(getCallsByContactId(contactId))
  const [showCallDialog, setShowCallDialog] = useState(false)
  const [callInProgress, setCallInProgress] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [callNotes, setCallNotes] = useState("")
  const [showNotesDialog, setShowNotesDialog] = useState(false)
  const { toast } = useToast()

  // Refresh calls when contactId changes
  useEffect(() => {
    setCalls(getCallsByContactId(contactId))
  }, [contactId])

  // Timer for call duration
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (callInProgress) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [callInProgress])

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "0:00"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleStartCall = () => {
    setCallDuration(0)
    setCallInProgress(true)
    setShowCallDialog(true)

    toast({
      title: "Call started",
      description: "Call has been initiated",
    })
  }

  const handleEndCall = () => {
    setCallInProgress(false)
    setCallNotes("")
    setShowNotesDialog(true)
  }

  const handleSaveCallNotes = () => {
    // In a real app, this would save the call record via API
    const newCall = {
      id: `call-${Date.now()}`,
      contactId,
      duration: callDuration,
      timestamp: new Date().toISOString(),
      status: "completed",
      notes: callNotes,
    }

    setCalls([newCall, ...calls])
    setShowNotesDialog(false)

    toast({
      title: "Call completed",
      description: "Call notes have been saved",
    })
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Call History</h3>
        <Button onClick={handleStartCall}>
          <Phone size={16} className="mr-2" />
          Call Now
        </Button>
      </div>

      {calls.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No call history</p>
        </div>
      ) : (
        <div className="space-y-4">
          {calls.map((call) => (
            <div key={call.id} className="border rounded-md p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  {call.status === "completed" && <Phone size={18} className="text-green-500 mr-2" />}
                  {call.status === "no_answer" && <PhoneOff size={18} className="text-red-500 mr-2" />}
                  {call.status === "voicemail" && <VoicemailIcon size={18} className="text-amber-500 mr-2" />}
                  <span className="font-medium">{format(new Date(call.timestamp), "MMM d, yyyy 'at' h:mm a")}</span>
                </div>
                <Badge
                  className={`
                  ${call.status === "completed" ? "bg-green-100 text-green-800 border-green-200" : ""}
                  ${call.status === "no_answer" ? "bg-red-100 text-red-800 border-red-200" : ""}
                  ${call.status === "voicemail" ? "bg-amber-100 text-amber-800 border-amber-200" : ""}
                  ${call.status === "in_progress" ? "bg-blue-100 text-blue-800 border-blue-200" : ""}
                `}
                >
                  {call.status.replace("_", " ")}
                </Badge>
              </div>

              <div className="flex justify-between text-sm text-gray-500 mb-3">
                <span>Duration: {formatDuration(call.duration)}</span>
                <span>{formatDistanceToNow(new Date(call.timestamp), { addSuffix: true })}</span>
              </div>

              {call.notes && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm">{call.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Active Call Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Call in Progress</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="text-3xl font-bold mb-4">{formatDuration(callDuration)}</div>
            <div className="flex justify-center gap-4">
              <Button variant="destructive" onClick={handleEndCall}>
                <PhoneOff size={16} className="mr-2" />
                End Call
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Call Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Call Notes</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="call-notes">Notes</Label>
                <Textarea
                  id="call-notes"
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Add notes about this call..."
                  rows={5}
                />
              </div>
              <div className="text-sm text-gray-500">Call duration: {formatDuration(callDuration)}</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCallNotes}>Save Notes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
