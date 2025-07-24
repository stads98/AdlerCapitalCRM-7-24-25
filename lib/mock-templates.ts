export const mockTemplates = [
  {
    id: "template1",
    name: "Property Refinance Offer",
    content:
      "Hi {firstName}, I'm a private lender. I can refinance {propertyAddress} or fund a purchase under 7%. Are you free to chat later today?",
    variables: ["firstName", "propertyAddress"],
    subject: "Property Refinance Opportunity",
  },
  {
    id: "template2",
    name: "Local Lender Introduction",
    content:
      "Hi {firstName}, I'm a private lender working on a {propertyType} in {cityState} that's similar to your property at {propertyAddress}. Any interest in refinancing?",
    variables: ["firstName", "propertyType", "cityState", "propertyAddress"],
    subject: "Local Lending Services",
  },
  {
    id: "template3",
    name: "Competitive Rate Offer",
    content:
      "Hi {firstName}, I just funded a cashout refi in {cityState} at 6.7%. I'll match or beat your best quote on {propertyAddress}. Call me (917) 963-0181.",
    variables: ["firstName", "cityState", "propertyAddress"],
    subject: "Competitive Refinance Rates Available",
  },
  {
    id: "template4",
    name: "LLC Refinance Inquiry",
    content:
      "Hi {firstName}, I'm a private lender. I can beat any quote to guarantee the lowest rate for {propertyAddress}. Any interest in refinancing into an LLC?",
    variables: ["firstName", "propertyAddress"],
    subject: "LLC Refinance Options",
  },
]

// Export templates as an alias of mockTemplates for compatibility
export const templates = mockTemplates
