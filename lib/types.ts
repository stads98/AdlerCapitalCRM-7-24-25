export type Contact = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  propertyAddress: string
  cityState?: string
  city?: string
  state?: string
  propertyType?: string
  propertyValue?: number
  debtOwed?: number
  dealStatus: string
  tags: Tag[]
  notes: string
  createdAt: string
  llcName?: string
  avatarUrl?: string
  dnc?: boolean
  dncReason?: string
}

export type Conversation = {
  id: string
  contact: {
    id: string
    name: string
    phoneNumber: string
    propertyAddress: string
    cityState: string
    propertyType: string
    llcName?: string
    avatarUrl?: string
  }
  messages: Message[]
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  hasReplied: boolean
}

export type ActivityType = "call" | "meeting" | "email" | "text" | "task" | "note"

export type Message = {
  id: string
  contactId: string
  text: string
  timestamp: string
  isInbound: boolean
  read?: boolean
  isInitial?: boolean
}

export type Call = {
  id: string
  contactId: string
  duration: number
  timestamp: string
  status: string
  notes: string
}

export type Email = {
  id: string
  contactId: string
  subject: string
  body: string
  timestamp: string
  isInbound: boolean
}

export type Activity = {
  id: string
  contactId: string
  dealId?: string
  type: ActivityType
  title: string
  description?: string
  dueDate: string
  status: "planned" | "completed" | "canceled"
  createdAt: string
  completedAt?: string
  duration?: number
}

export type DealStage =
  | "lead"
  | "credit_run"
  | "appraisal_fee"
  | "document_collection"
  | "processing"
  | "underwriting"
  | "closing"
  | "funded"
  | "lost"

export type DealDocument = {
  id: string
  name: string
  type: string
  uploadedAt: string
  status: string
}

export type Deal = {
  id: string
  title: string
  contactId: string
  value: number
  stage: DealStage
  createdAt: string
  updatedAt: string
  expectedCloseDate?: string
  stageHistory: {
    stageId: DealStage
    enteredAt: string
    exitedAt?: string
    durationInDays?: number
  }[]
  notes: string
  tags: Tag[]
  loanType: string
  interestRate?: number
  loanTerm?: number
  propertyAddress: string
  propertyType?: string
  appraisalValue?: number
  ltv?: number
  creditScore?: number
  documents: DealDocument[]
}
