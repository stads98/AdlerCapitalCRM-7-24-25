"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import ContactsSection from "./contacts/contacts-section"
import TextCenter from "./text/text-center"
import DashboardOverview from "./dashboard-overview"

interface DashboardTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function DashboardTabs({ activeTab, setActiveTab }: DashboardTabsProps) {
  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="border-b border-gray-200 px-6 py-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              Overview
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              Contacts
              <Badge variant="secondary" className="ml-1">
                15
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="messaging" className="flex items-center gap-2">
              Text
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              Import
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="dashboard" className="h-full m-0 p-0">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="contacts" className="h-full m-0 p-0">
            <ContactsSection />
          </TabsContent>

          <TabsContent value="messaging" className="h-full m-0 p-0">
            <TextCenter />
          </TabsContent>

          <TabsContent value="import" className="h-full m-0 p-0">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Import Contacts</h2>
              <p className="text-muted-foreground">Upload CSV files to import contacts.</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
