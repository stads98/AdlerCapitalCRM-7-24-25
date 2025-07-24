import type { Contact, Message, Call, Email, Tag, Conversation } from "@/lib/types"

// Generate random dates within the last 30 days
const getRandomDate = () => {
  const now = new Date()
  const daysAgo = Math.floor(Math.random() * 30)
  now.setDate(now.getDate() - daysAgo)
  return now.toISOString()
}

// Tags for contacts
export const tags: Tag[] = [
  { id: "tag1", name: "Hot Lead", color: "red" },
  { id: "tag2", name: "Cold Lead", color: "blue" },
  { id: "tag3", name: "Investor", color: "green" },
  { id: "tag4", name: "Owner", color: "purple" },
  { id: "tag5", name: "Multi-Family", color: "orange" },
  { id: "tag6", name: "Single-Family", color: "teal" },
  { id: "tag7", name: "Commercial", color: "indigo" },
  { id: "tag8", name: "Follow-up", color: "pink" },
  { id: "tag9", name: "New Contact", color: "yellow" },
  { id: "tag10", name: "VIP", color: "emerald" },
]

// Mock contacts data
export const contacts: Contact[] = [
  {
    id: "contact1",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    propertyAddress: "123 Main St, New York, NY 10001",
    dealStatus: "new",
    tags: [tags[0], tags[3]], // Hot Lead, Owner
    notes: "Interested in selling his property in the next 3 months.",
    createdAt: getRandomDate(),
  },
  {
    id: "contact2",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@example.com",
    phone: "+1 (555) 987-6543",
    propertyAddress: "456 Park Ave, Los Angeles, CA 90001",
    dealStatus: "negotiation",
    tags: [tags[2], tags[5]], // Investor, Single-Family
    notes: "Looking for investment properties in LA area. Budget: $500K-$1M.",
    createdAt: getRandomDate(),
  },
  {
    id: "contact3",
    firstName: "Michael",
    lastName: "Brown",
    email: "mbrown@example.com",
    phone: "+1 (555) 456-7890",
    propertyAddress: "789 Oak St, Chicago, IL 60007",
    dealStatus: "closed",
    tags: [tags[4], tags[9]], // Multi-Family, VIP
    notes: "Closed deal on a 12-unit apartment building. Looking for more properties.",
    createdAt: getRandomDate(),
  },
]

// Mock messages data
export const messages: Message[] = [
  {
    id: "msg1",
    contactId: "contact1",
    text: "Hi John, I saw your property at 123 Main St and I'm interested in discussing potential opportunities. Would you be available for a call this week?",
    timestamp: getRandomDate(),
    isInbound: false,
  },
  {
    id: "msg2",
    contactId: "contact1",
    text: "Yes, I'd be interested in discussing. How about Thursday at 2pm?",
    timestamp: getRandomDate(),
    isInbound: true,
  },
  {
    id: "msg3",
    contactId: "contact1",
    text: "Thursday at 2pm works great. I'll give you a call then. Looking forward to it!",
    timestamp: getRandomDate(),
    isInbound: false,
  },
  {
    id: "msg4",
    contactId: "contact2",
    text: "Hello Sarah, I have some new investment properties in LA that match your criteria. Would you like me to send you the details?",
    timestamp: getRandomDate(),
    isInbound: false,
  },
  {
    id: "msg5",
    contactId: "contact2",
    text: "That would be great! Please send them over when you have a chance.",
    timestamp: getRandomDate(),
    isInbound: true,
  },
]

// Mock calls data
export const calls: Call[] = [
  {
    id: "call1",
    contactId: "contact1",
    duration: 720, // 12 minutes in seconds
    timestamp: getRandomDate(),
    status: "completed",
    notes: "Discussed property value and potential timeline for selling. John is looking to move within 3 months.",
  },
  {
    id: "call2",
    contactId: "contact2",
    duration: 540, // 9 minutes
    timestamp: getRandomDate(),
    status: "completed",
    notes:
      "Reviewed investment opportunities in LA. Sarah is particularly interested in properties with rental income.",
  },
]

// Mock emails data
export const emails: Email[] = [
  {
    id: "email1",
    contactId: "contact1",
    subject: "Property Valuation for 123 Main St",
    body: "Hi John,\n\nThank you for our call today. As discussed, I've attached a detailed valuation report for your property at 123 Main St.\n\nBased on recent comparable sales in your area, I estimate your property value between $750,000 and $800,000. With some minor improvements, we could potentially list at the higher end of this range.\n\nLet me know if you have any questions or if you'd like to discuss this further.\n\nBest regards,\nYour Agent",
    timestamp: getRandomDate(),
    isInbound: false,
  },
  {
    id: "email2",
    contactId: "contact1",
    subject: "Re: Property Valuation for 123 Main St",
    body: "Thanks for the detailed report. The valuation is higher than I expected, which is great news. I'd like to discuss those minor improvements you mentioned. What specifically would give us the best ROI?\n\nRegards,\nJohn",
    timestamp: getRandomDate(),
    isInbound: true,
  },
]

export const getContactById = (id: string): Contact | undefined => {
  return contacts.find((contact) => contact.id === id)
}

export const getMessagesByContactId = (contactId: string): Message[] => {
  return messages.filter((message) => message.contactId === contactId)
}

export const getCallsByContactId = (contactId: string): Call[] => {
  return calls.filter((call) => call.contactId === contactId)
}

export const getEmailsByContactId = (contactId: string): Email[] => {
  return emails.filter((email) => email.contactId === contactId)
}

export const getActiveConversations = (): Conversation[] => {
  // Group messages by contact ID
  const contactMessages = new Map<string, Message[]>()

  messages.forEach((message) => {
    const contactId = message.contactId
    if (!contactMessages.has(contactId)) {
      contactMessages.set(contactId, [])
    }
    contactMessages.get(contactId)?.push(message)
  })

  // Create conversations from grouped messages
  const conversations: Conversation[] = []

  contactMessages.forEach((msgs, contactId) => {
    const contact = getContactById(contactId)
    if (contact) {
      // Sort messages by timestamp
      const sortedMessages = [...msgs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

      // Get the latest message
      const lastMessage = sortedMessages[sortedMessages.length - 1]

      // Check if there are any inbound messages (replies)
      const hasReplied = sortedMessages.some((msg) => msg.isInbound)

      // Count unread messages
      const unreadCount = sortedMessages.filter((msg) => msg.isInbound && !msg.read).length

      conversations.push({
        id: `conv-${contactId}`,
        contact: {
          id: contact.id,
          name: `${contact.firstName} ${contact.lastName}`,
          phoneNumber: contact.phone,
          propertyAddress: contact.propertyAddress,
          cityState: contact.propertyAddress.split(",").slice(1).join(",").trim(),
          propertyType: contact.propertyType || "",
          llcName: contact.llcName || "",
          avatarUrl: undefined,
        },
        messages: sortedMessages,
        lastMessage: lastMessage.text,
        lastMessageTime: lastMessage.timestamp,
        unreadCount,
        hasReplied,
      })
    }
  })

  // Sort conversations by most recent message first
  return conversations.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
}
