"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Columns } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface ColumnDef {
  id: string
  header: React.ReactNode
  accessorKey?: string
  enableSorting?: boolean
  enableHiding?: boolean
  cell?: ({ row }: { row: any }) => React.ReactNode
}

interface TableColumnCustomizerProps {
  columns: ColumnDef[]
  visibleColumns: string[]
  columnOrder: string[]
  onColumnVisibilityChange: (columnId: string, isVisible: boolean) => void
  onColumnOrderChange: (newOrder: string[]) => void
  onResetColumns: () => void
}

export function TableColumnCustomizer({
  columns,
  visibleColumns,
  onColumnVisibilityChange,
  onResetColumns,
}: TableColumnCustomizerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Columns className="h-3.5 w-3.5" />
          <span>Columns</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns
          .filter((column) => column.enableHiding !== false)
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={visibleColumns.includes(column.id)}
              onCheckedChange={(checked) => onColumnVisibilityChange(column.id, checked)}
            >
              {column.header}
            </DropdownMenuCheckboxItem>
          ))}
        <DropdownMenuSeparator />
        <div className="p-1">
          <Button size="sm" variant="outline" className="w-full" onClick={onResetColumns}>
            Reset columns
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}