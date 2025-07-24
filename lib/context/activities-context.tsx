"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Activity } from "@/lib/types"

interface ActivitiesContextType {
  activities: Activity[]
  addActivity: (activity: Activity) => void
  updateActivity: (id: string, updates: Partial<Activity>) => void
  deleteActivity: (id: string) => void
  getContactActivities: (contactId: string) => Activity[]
  getUpcomingActivities: (days?: number) => Activity[]
}

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined)

export function ActivitiesProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([])

  // Load activities from localStorage on initial render
  useEffect(() => {
    const storedActivities = localStorage.getItem("activities")
    if (storedActivities) {
      setActivities(JSON.parse(storedActivities))
    }
  }, [])

  // Save activities to localStorage whenever they change
  useEffect(() => {
    if (activities.length > 0) {
      localStorage.setItem("activities", JSON.stringify(activities))
    }
  }, [activities])

  const addActivity = (activity: Activity) => {
    setActivities((prev) => [...prev, activity])
  }

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    setActivities((prev) => prev.map((activity) => (activity.id === id ? { ...activity, ...updates } : activity)))
  }

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((activity) => activity.id !== id))
  }

  const getContactActivities = (contactId: string) => {
    return activities.filter((activity) => activity.contactId === contactId)
  }

  const getUpcomingActivities = (days = 7) => {
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(now.getDate() + days)

    return activities
      .filter((activity) => {
        if (activity.status !== "planned") return false

        const dueDate = new Date(activity.dueDate)
        return dueDate >= now && dueDate <= futureDate
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }

  return (
    <ActivitiesContext.Provider
      value={{
        activities,
        addActivity,
        updateActivity,
        deleteActivity,
        getContactActivities,
        getUpcomingActivities,
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  )
}

export function useActivities() {
  const context = useContext(ActivitiesContext)
  if (context === undefined) {
    throw new Error("useActivities must be used within an ActivitiesProvider")
  }
  return context
}
