"use client"

import * as React from "react"
import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"

const statuses = [
  {
    value: "active",
    label: "Aktivní",
  },
  {
    value: "draft",
    label: "Koncept",
  },
  {
    value: "expired",
    label: "Expirované",
  },
  {
    value: "suspended",
    label: "Pozastavené",
  },
]

const venueTypes = [
  { value: "restaurant", label: "Restaurace" },
  { value: "gallery", label: "Galerie" },
  { value: "cafe", label: "Kavárna" },
  { value: "bar", label: "Bar" },
  { value: "club", label: "Klub" },
  { value: "theater", label: "Divadlo" },
  { value: "conference", label: "Konferenční místnost" },
  { value: "other", label: "Jiné" },
]

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filtrovat prostory..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Stav"
            options={statuses}
          />
        )}
        
        {table.getColumn("type") && (
          <DataTableFacetedFilter
            column={table.getColumn("type")}
            title="Typ"
            options={venueTypes}
          />
        )}
        
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
