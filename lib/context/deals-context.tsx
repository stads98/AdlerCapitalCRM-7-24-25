"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Deal, DealStage } from "@/lib/types"
import { mockDeals } from "@/lib/mock-deals"
import { useActivities } from "./activities-context"

interface DealsContextType {
  deals: Deal[]
  addDeal: (deal: Omit<Deal, "id" | "createdAt" | "updatedAt" | "stageHistory">) => Deal
  updateDeal: (id: string, updates: Partial<Deal>) => void
  deleteDeal: (id: string) => void
  moveDealToStage: (dealId: string, newStage: DealStage) => void
  getDealsByStage: (stage: DealStage) => Deal[]
  getDealsByContact: (contactId: string) => Deal[]
  getDealById: (id: string) => Deal | undefined
  getDealsValueByStage: (stage: DealStage) => number
  getDealsCountByStage: (stage: DealStage) => number
  getTotalDealsValue: () => number
  getRecentlyMovedDeals: (days?: number) => Deal[]
  getStuckDeals: (daysInStage?: number) => Deal[]
}

const DealsContext = createContext<DealsContextType | undefined>(undefined)

export function DealsProvider({ children }: { children: React.ReactNode }) {
  const [deals, setDeals] = useState<Deal[]>([])
  const { addActivity } = useActivities()

  // Load deals from localStorage on initial render or use mock data
  useEffect(() => {
    const storedDeals = localStorage.getItem("deals")
    if (storedDeals) {
      setDeals(JSON.parse(storedDeals))
    } else {
      setDeals(mockDeals)
    }
  }, [])

  // Save deals to localStorage whenever they change
  useEffect(() => {
    if (deals.length > 0) {
      localStorage.setItem("deals", JSON.stringify(deals))
    }
  }, [deals])

  const addDeal = (dealData: Omit<Deal, "id" | "createdAt" | "updatedAt" | "stageHistory">) => {
    const now = new Date().toISOString()
    const newDeal: Deal = {
      id: `deal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
      stageHistory: [
        {
          stageId: dealData.stage,
          enteredAt: now,
        },
      ],
      ...dealData,
    }

    setDeals((prevDeals) => [...prevDeals, newDeal])

    // Create an activity for the new deal
    addActivity({
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      contactId: dealData.contactId,
      dealId: newDeal.id,
      type: "note",
      title: `Deal created: ${dealData.title}`,
      description: `New deal created in ${dealData.stage} stage`,
      dueDate: now,
      status: "completed",
      createdAt: now,
      completedAt: now,
    })

    return newDeal
  }

  const updateDeal = (id: string, updates: Partial<Deal>) => {
    setDeals((prevDeals) =>
      prevDeals.map((deal) => {
        if (deal.id === id) {
          return {
            ...deal,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
        }
        return deal
      }),
    )
  }

  const deleteDeal = (id: string) => {
    setDeals((prevDeals) => prevDeals.filter((deal) => deal.id !== id))
  }

  const moveDealToStage = (dealId: string, newStage: DealStage) => {
    const now = new Date().toISOString()

    setDeals((prevDeals) =>
      prevDeals.map((deal) => {
        if (deal.id === dealId) {
          // Find the current stage history entry and update its exitedAt
          const updatedStageHistory = [...deal.stageHistory]
          const currentStageIndex = updatedStageHistory.findIndex(
            (history) => history.stageId === deal.stage && !history.exitedAt,
          )

          if (currentStageIndex !== -1) {
            const enteredAt = new Date(updatedStageHistory[currentStageIndex].enteredAt)
            const exitedAt = new Date(now)
            const durationInDays = Math.ceil((exitedAt.getTime() - enteredAt.getTime()) / (1000 * 60 * 60 * 24))

            updatedStageHistory[currentStageIndex] = {
              ...updatedStageHistory[currentStageIndex],
              exitedAt: now,
              durationInDays,
            }
          }

          // Add a new stage history entry
          updatedStageHistory.push({
            stageId: newStage,
            enteredAt: now,
          })

          // Create an activity for the stage change
          addActivity({
            id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            contactId: deal.contactId,
            dealId: deal.id,
            type: "note",
            title: `Deal moved to ${newStage.replace("_", " ")}`,
            description: `Deal "${deal.title}" moved from ${deal.stage.replace("_", " ")} to ${newStage.replace("_", " ")}`,
            dueDate: now,
            status: "completed",
            createdAt: now,
            completedAt: now,
          })

          return {
            ...deal,
            stage: newStage,
            updatedAt: now,
            stageHistory: updatedStageHistory,
          }
        }
        return deal
      }),
    )
  }

  const getDealsByStage = (stage: DealStage) => {
    return deals.filter((deal) => deal.stage === stage)
  }

  const getDealsByContact = (contactId: string) => {
    return deals.filter((deal) => deal.contactId === contactId)
  }

  const getDealById = (id: string) => {
    return deals.find((deal) => deal.id === id)
  }

  const getDealsValueByStage = (stage: DealStage) => {
    return getDealsByStage(stage).reduce((total, deal) => total + deal.value, 0)
  }

  const getDealsCountByStage = (stage: DealStage) => {
    return getDealsByStage(stage).length
  }

  const getTotalDealsValue = () => {
    return deals.reduce((total, deal) => total + deal.value, 0)
  }

  const getRecentlyMovedDeals = (days = 7) => {
    const now = new Date()
    const cutoffDate = new Date(now)
    cutoffDate.setDate(now.getDate() - days)

    return deals.filter((deal) => {
      const updatedAt = new Date(deal.updatedAt)
      return updatedAt >= cutoffDate
    })
  }

  const getStuckDeals = (daysInStage = 14) => {
    const now = new Date()

    return deals.filter((deal) => {
      // Find the current stage history entry
      const currentStageHistory = deal.stageHistory.find(
        (history) => history.stageId === deal.stage && !history.exitedAt,
      )

      if (currentStageHistory) {
        const enteredAt = new Date(currentStageHistory.enteredAt)
        const daysDifference = Math.ceil((now.getTime() - enteredAt.getTime()) / (1000 * 60 * 60 * 24))
        return daysDifference >= daysInStage
      }

      return false
    })
  }

  return (
    <DealsContext.Provider
      value={{
        deals,
        addDeal,
        updateDeal,
        deleteDeal,
        moveDealToStage,
        getDealsByStage,
        getDealsByContact,
        getDealById,
        getDealsValueByStage,
        getDealsCountByStage,
        getTotalDealsValue,
        getRecentlyMovedDeals,
        getStuckDeals,
      }}
    >
      {children}
    </DealsContext.Provider>
  )
}

export function useDeals() {
  const context = useContext(DealsContext)
  if (context === undefined) {
    throw new Error("useDeals must be used within a DealsProvider")
  }
  return context
}
