"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, Search, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"

interface FilterOption {
  id: string
  label: string
  type: "select" | "text" | "date" | "dateRange"
  options?: { value: string; label: string }[]
}

interface TableFilterProps {
  filterOptions: FilterOption[]
  onFilterChange: (filters: Record<string, any>) => void
  activeFilters?: Record<string, any>
}

export function TableFilter({ filterOptions, onFilterChange, activeFilters = {} }: TableFilterProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<Record<string, any>>(activeFilters)
  const [isOpen, setIsOpen] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    onFilterChange({ ...filters, search: e.target.value })
  }

  const handleFilterChange = (id: string, value: any) => {
    const newFilters = { ...filters, [id]: value }
    setFilters(newFilters)
  }

  const applyFilters = () => {
    onFilterChange({ ...filters, search: searchQuery })
    setIsOpen(false)
  }

  const clearFilters = () => {
    const newFilters = { search: searchQuery }
    setFilters(newFilters)
    onFilterChange(newFilters)
    setIsOpen(false)
  }

  const removeFilter = (key: string) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const getFilterLabel = (key: string, value: any) => {
    const option = filterOptions.find((opt) => opt.id === key)
    if (!option) return `${key}: ${value}`

    if (option.type === "select") {
      const selectedOption = option.options?.find((opt) => opt.value === value)
      return `${option.label}: ${selectedOption?.label || value}`
    }

    if (option.type === "date") {
      return `${option.label}: ${new Date(value).toLocaleDateString()}`
    }

    if (option.type === "dateRange") {
      return `${option.label}: ${new Date(value.from).toLocaleDateString()} - ${new Date(value.to).toLocaleDateString()}`
    }

    return `${option.label}: ${value}`
  }

  const activeFilterCount = Object.keys(filters).filter((key) => key !== "search").length

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Filter className="mr-2 h-4 w-4" />
              Filter
              {activeFilterCount > 0 && (
                <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs" variant="secondary">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Filter by</h4>
              <div className="space-y-4">
                {filterOptions.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <Label htmlFor={option.id}>{option.label}</Label>
                    {option.type === "select" && (
                      <Select
                        value={filters[option.id] || ""}
                        onValueChange={(value) => handleFilterChange(option.id, value)}
                      >
                        <SelectTrigger id={option.id}>
                          <SelectValue placeholder={`Select ${option.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {option.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {option.type === "text" && (
                      <Input
                        id={option.id}
                        value={filters[option.id] || ""}
                        onChange={(e) => handleFilterChange(option.id, e.target.value)}
                        placeholder={`Enter ${option.label.toLowerCase()}`}
                      />
                    )}
                    {option.type === "date" && (
                      <DatePicker
                        id={option.id}
                        selected={filters[option.id] ? new Date(filters[option.id]) : undefined}
                        onSelect={(date) => handleFilterChange(option.id, date)}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button size="sm" onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(filters)
            .filter(([key]) => key !== "search")
            .map(([key, value]) => (
              <Badge key={key} variant="secondary" className="px-2 py-1">
                {getFilterLabel(key, value)}
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => removeFilter(key)}>
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
        </div>
      )}
    </div>
  )
}