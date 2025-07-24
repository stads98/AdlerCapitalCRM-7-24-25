"use client"

import { useSearchParams } from "next/navigation"
import type { ReactNode } from "react"

export function SearchParamsProvider({
  children,
  onParamsChange,
}: {
  children: ReactNode
  onParamsChange: (params: URLSearchParams) => void
}) {
  const searchParams = useSearchParams()

  // Call the callback with the search params
  onParamsChange(searchParams)

  return <>{children}</>
}
