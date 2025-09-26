"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, RotateCcw } from "lucide-react"

interface SearchFilterProps {
  readonly searchTerm: string
  readonly onSearchTermChange: (value: string) => void
  readonly onSearch: () => void
  readonly onReset: () => void
  readonly placeholder?: string
  readonly filterComponent?: React.ReactNode
  readonly disabled?: boolean
  readonly filterPosition?: 'before' | 'after'
}

export function SearchFilter({
  searchTerm,
  onSearchTermChange,
  onSearch,
  onReset,
  placeholder = "Search...",
  filterComponent,
  disabled = false,
  filterPosition = 'before'
}: SearchFilterProps) {
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch()
    }
  }

  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            onKeyDown={handleSearchKeyPress}
            className="pl-10"
            disabled={disabled}
          />
        </div>
        <div className="flex gap-2 sm:gap-3">
          {filterPosition === 'before' && filterComponent}
          <Button
            onClick={onSearch}
            className="flex items-center gap-2 flex-1 sm:flex-initial"
            disabled={disabled}
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            className="flex items-center gap-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-initial"
            disabled={!searchTerm || disabled}
            title={
              searchTerm
                ? "Clear search and show all results"
                : "No search to clear"
            }
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
          {filterPosition === 'after' && filterComponent}
        </div>
      </div>
    </div>
  )
}