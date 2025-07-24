"use client"

import { useState } from "react"
import Sidebar from "./sidebar"
import MobileHeader from "./mobile-header"
import DashboardTabs from "./dashboard-tabs"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        {isMobile && <MobileHeader activeTab={activeTab} setActiveTab={setActiveTab} setSidebarOpen={setSidebarOpen} />}

        {/* Dashboard content */}
        <main className="flex-1 overflow-hidden">
          <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </main>
      </div>
    </div>
  )
}
