"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Filter } from "lucide-react"
import { useState } from "react"

interface ContactFiltersProps {
  filters?: {
    minValue?: number
    maxValue?: number
    minEquity?: number
    maxEquity?: number
    propertyTypes?: string[]
  }
  onFiltersChange?: (filters: any) => void
}

export default function ContactFilters({ filters = {}, onFiltersChange }: ContactFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Local state for when props aren't provided
  const [localFilters, setLocalFilters] = useState({
    minValue: "",
    maxValue: "",
    minEquity: "",
    maxEquity: "",
    propertyTypes: [] as string[],
  })

  const propertyTypes = [
    { id: "single-family", label: "Single Family" },
    { id: "duplex", label: "Duplex" },
    { id: "triplex", label: "Triplex" },
    { id: "quadplex", label: "Quadplex" },
    { id: "multi-family", label: "Multi-Family (5+ units)" },
  ]

  const handleValueChange = (field: string, value: string) => {
    const numValue = value === "" ? undefined : Number.parseInt(value.replace(/,/g, ""))

    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        [field]: numValue,
      })
    } else {
      setLocalFilters((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handlePropertyTypeChange = (typeId: string) => {
    const currentTypes = filters.propertyTypes || localFilters.propertyTypes
    const newTypes = currentTypes.includes(typeId)
      ? currentTypes.filter((id) => id !== typeId)
      : [...currentTypes, typeId]

    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        propertyTypes: newTypes,
      })
    } else {
      setLocalFilters((prev) => ({
        ...prev,
        propertyTypes: newTypes,
      }))
    }
  }

  const clearAllFilters = () => {
    if (onFiltersChange) {
      onFiltersChange({
        minValue: undefined,
        maxValue: undefined,
        minEquity: undefined,
        maxEquity: undefined,
        propertyTypes: [],
      })
    } else {
      setLocalFilters({
        minValue: "",
        maxValue: "",
        minEquity: "",
        maxEquity: "",
        propertyTypes: [],
      })
    }
  }

  const activePropertyTypes = filters.propertyTypes || localFilters.propertyTypes

  // Check if any filters are active
  const hasActiveFilters =
    filters.minValue !== undefined ||
    filters.maxValue !== undefined ||
    filters.minEquity !== undefined ||
    filters.maxEquity !== undefined ||
    (filters.propertyTypes && filters.propertyTypes.length > 0)

  return (
    <div className="border-b border-gray-200">
      {/* Filter Header - Always Visible */}
      <div className="px-6 py-3 bg-gray-50">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full p-0 h-auto font-medium text-gray-700 hover:text-gray-900"
        >
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Active</span>
            )}
          </div>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
      </div>

      {/* Collapsible Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-6 bg-white">
          {/* Property Value Range */}
          <div>
            <h3 className="text-sm font-medium mb-3">Property Value Range</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="min-value" className="text-xs text-gray-600">
                  Min Value
                </Label>
                <Input
                  id="min-value"
                  placeholder="$0"
                  value={filters.minValue ? filters.minValue.toLocaleString() : localFilters.minValue}
                  onChange={(e) => handleValueChange("minValue", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="max-value" className="text-xs text-gray-600">
                  Max Value
                </Label>
                <Input
                  id="max-value"
                  placeholder="$1,000,000"
                  value={filters.maxValue ? filters.maxValue.toLocaleString() : localFilters.maxValue}
                  onChange={(e) => handleValueChange("maxValue", e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Equity Range */}
          <div>
            <h3 className="text-sm font-medium mb-3">Equity Range</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="min-equity" className="text-xs text-gray-600">
                  Min Equity
                </Label>
                <Input
                  id="min-equity"
                  placeholder="$0"
                  value={filters.minEquity ? filters.minEquity.toLocaleString() : localFilters.minEquity}
                  onChange={(e) => handleValueChange("minEquity", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="max-equity" className="text-xs text-gray-600">
                  Max Equity
                </Label>
                <Input
                  id="max-equity"
                  placeholder="$500,000"
                  value={filters.maxEquity ? filters.maxEquity.toLocaleString() : localFilters.maxEquity}
                  onChange={(e) => handleValueChange("maxEquity", e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Property Type */}
          <div>
            <h3 className="text-sm font-medium mb-3">Property Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {propertyTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type.id}`}
                    checked={activePropertyTypes.includes(type.id)}
                    onCheckedChange={() => handlePropertyTypeChange(type.id)}
                  />
                  <Label htmlFor={`type-${type.id}`} className="text-sm cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              disabled={!hasActiveFilters}
              className="text-sm"
            >
              Clear all filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
