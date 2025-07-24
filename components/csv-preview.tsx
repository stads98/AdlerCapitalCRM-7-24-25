"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrency } from "@/lib/utils"

interface CsvPreviewProps {
  contacts: any[]
  tags: string[]
}

export default function CsvPreview({ contacts, tags }: CsvPreviewProps) {
  if (contacts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            No contacts to preview. Upload a CSV file to see a preview.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview ({contacts.length} contacts)</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="divide-y">
            {contacts.map((contact, index) => (
              <div key={index} className="p-4 hover:bg-muted/20">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">
                    {contact.firstName} {contact.lastName}
                  </h3>
                  {contact.phone && <span className="text-sm text-muted-foreground">{contact.phone}</span>}
                </div>

                {contact.email && <p className="text-sm text-muted-foreground mb-2">{contact.email}</p>}

                {contact.propertyAddress && (
                  <p className="text-sm mb-2">
                    <span className="text-xs text-muted-foreground mr-1">Full Address:</span>
                    {contact.propertyAddress}
                  </p>
                )}

                {(contact.city || contact.state) && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {[contact.city, contact.state].filter(Boolean).join(", ")}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-2">
                  {contact.propertyType && (
                    <Badge variant="outline" className="text-xs">
                      {contact.propertyType}
                    </Badge>
                  )}

                  {contact.propertyValue && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      Value: {formatCurrency(contact.propertyValue)}
                    </Badge>
                  )}

                  {contact.debtOwed && (
                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                      Debt: {formatCurrency(contact.debtOwed)}
                    </Badge>
                  )}

                  {contact.llcName && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      LLC: {contact.llcName}
                    </Badge>
                  )}
                </div>

                {tags.length > 0 && (
                  <div className="mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="mr-1 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
