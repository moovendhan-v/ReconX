"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TablePagination } from "@/components/dashboard/table-pagination"
import { TableFilter } from "@/components/dashboard/table-filter"
import { TableColumnCustomizer, type ColumnDef } from "@/components/dashboard/enhanced-table/table-column-customizer"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Loader2 } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface FilterOption {
  id: string
  label: string
  type: "select" | "text" | "date" | "dateRange"
  options?: { value: string; label: string }[]
}

interface EnhancedTableProps<T> {
  data: T[]
  columns: ColumnDef[]
  filterOptions?: FilterOption[]
  tableId: string
  defaultPageSize?: number
  defaultSortColumn?: string
  defaultSortDirection?: "asc" | "desc"
  onRowClick?: (row: T) => void
  isLoading?: boolean
  emptyState?: React.ReactNode
  exportData?: (data: T[]) => void
  showExport?: boolean
}

export function EnhancedTable<T>({
  data,
  columns,
  filterOptions = [],
  tableId,
  defaultPageSize = 10,
  defaultSortColumn,
  defaultSortDirection = "asc",
  onRowClick,
  isLoading = false,
  emptyState,
  exportData,
  showExport = false,
}: EnhancedTableProps<T>) {
  // Local storage keys for persisting user preferences
  const columnVisibilityKey = `table-${tableId}-column-visibility`
  const columnOrderKey = `table-${tableId}-column-order`
  const pageSizeKey = `table-${tableId}-page-size`

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useLocalStorage(pageSizeKey, defaultPageSize)

  // State for filtering
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [filteredData, setFilteredData] = useState<T[]>(data)

  // State for sorting
  const [sortColumn, setSortColumn] = useState<string | undefined>(defaultSortColumn)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSortDirection)

  // State for column visibility and order
  const [visibleColumns, setVisibleColumns] = useLocalStorage<string[]>(
    columnVisibilityKey,
    columns.filter((col) => col.enableHiding !== false).map((col) => col.id),
  )

  const [columnOrder, setColumnOrder] = useLocalStorage<string[]>(
    columnOrderKey,
    columns.map((col) => col.id),
  )

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // Update filtered data when data or filters change
  useEffect(() => {
    // Create a stable reference to the filter function to avoid infinite loops
    const applyFilters = () => {
      let result = [...data]

      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        result = result.filter((item) => {
          return columns.some((column) => {
            if (!column.accessorKey) return false
            const value = (item as any)[column.accessorKey]
            if (value === undefined || value === null) return false
            return String(value).toLowerCase().includes(searchTerm)
          })
        })
      }

      // Apply other filters
      Object.entries(filters).forEach(([key, value]) => {
        if (key === "search" || !value) return

        const filterOption = filterOptions.find((option) => option.id === key)
        if (!filterOption) return

        result = result.filter((item) => {
          const itemValue = (item as any)[key]

          if (filterOption.type === "date") {
            if (!itemValue) return false
            const filterDate = new Date(value)
            const itemDate = new Date(itemValue)
            return (
              itemDate.getFullYear() === filterDate.getFullYear() &&
              itemDate.getMonth() === filterDate.getMonth() &&
              itemDate.getDate() === filterDate.getDate()
            )
          }

          if (filterOption.type === "dateRange") {
            if (!itemValue) return false
            const itemDate = new Date(itemValue)
            const fromDate = value.from ? new Date(value.from) : null
            const toDate = value.to ? new Date(value.to) : null

            if (fromDate && toDate) {
              return itemDate >= fromDate && itemDate <= toDate
            } else if (fromDate) {
              return itemDate >= fromDate
            } else if (toDate) {
              return itemDate <= toDate
            }
            return true
          }

          return itemValue === value
        })
      })

      // Apply sorting
      if (sortColumn) {
        result.sort((a, b) => {
          const aValue = (a as any)[sortColumn]
          const bValue = (b as any)[sortColumn]

          if (aValue === bValue) return 0
          if (aValue === undefined || aValue === null) return 1
          if (bValue === undefined || bValue === null) return -1

          const comparison = aValue < bValue ? -1 : 1
          return sortDirection === "asc" ? comparison : -comparison
        })
      }

      return result
    }

    // Apply filters and update state
    setFilteredData(applyFilters())
  }, [data, filters, sortColumn, sortDirection])

  // Calculate pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  // Handle column visibility change
  const handleColumnVisibilityChange = (columnId: string, isVisible: boolean) => {
    if (isVisible) {
      setVisibleColumns([...visibleColumns, columnId])
    } else {
      setVisibleColumns(visibleColumns.filter((id) => id !== columnId))
    }
  }

  // Handle column order change
  const handleColumnOrderChange = (newOrder: string[]) => {
    setColumnOrder(newOrder)
  }

  // Reset columns to default
  const resetColumns = () => {
    setVisibleColumns(columns.filter((col) => col.enableHiding !== false).map((col) => col.id))
    setColumnOrder(columns.map((col) => col.id))
  }

  // Handle sort change
  const handleSortChange = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId)
    if (!column || column.enableSorting === false) return

    if (sortColumn === columnId) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(columnId)
      setSortDirection("asc")
    }
  }

  // Get sort icon for column
  const getSortIcon = (columnId: string) => {
    if (sortColumn !== columnId) return <ArrowUpDown className="ml-2 h-4 w-4" />
    return sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
  }

  // Get visible and ordered columns
  const visibleOrderedColumns = useMemo(() => {
    return columnOrder
      .filter((columnId) => visibleColumns.includes(columnId))
      .map((columnId) => columns.find((col) => col.id === columnId))
      .filter((col): col is ColumnDef => !!col)
  }, [columnOrder, visibleColumns, columns])

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  // Handle export
  const handleExport = () => {
    if (exportData) {
      exportData(filteredData)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TableFilter filterOptions={filterOptions} onFilterChange={setFilters} activeFilters={filters} />

        <div className="flex items-center gap-2">
          <TableColumnCustomizer
            columns={columns}
            visibleColumns={visibleColumns}
            columnOrder={columnOrder}
            onColumnVisibilityChange={handleColumnVisibilityChange}
            onColumnOrderChange={handleColumnOrderChange}
            onResetColumns={resetColumns}
          />

          {showExport && (
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleExport}>
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleOrderedColumns.map((column) => (
                    <TableHead
                      key={column.id}
                      className={cn(column.enableSorting !== false && "cursor-pointer select-none")}
                      onClick={() => column.enableSorting !== false && handleSortChange(column.id)}
                    >
                      <div className="flex items-center">
                        {column.header}
                        {column.enableSorting !== false && getSortIcon(column.id)}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, rowIndex) => (
                    <TableRow
                      key={rowIndex}
                      className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
                      onClick={() => onRowClick && onRowClick(row)}
                    >
                      {visibleOrderedColumns.map((column) => (
                        <TableCell key={`${rowIndex}-${column.id}`}>
                          {column.cell
                            ? column.cell({ row })
                            : column.accessorKey
                              ? (row as any)[column.accessorKey]
                              : null}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={visibleOrderedColumns.length} className="h-24 text-center">
                      {emptyState || (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <p>No results found</p>
                          <p className="text-sm">Try adjusting your filters</p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <TablePagination
          totalItems={filteredData.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </Card>
    </div>
  )
}