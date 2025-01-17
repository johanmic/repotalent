"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface BaseData {
  id: string | number
}

interface CellClick<TData> {
  [key: string]: (cell: TData) => void
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  rowClickUrl?: string
  onRowClick?: (row: TData) => void
  onCellClick?: CellClick<TData>
}

export function DataTable<TData extends BaseData, TValue>({
  columns,
  data,
  rowClickUrl,
  onRowClick,
  onCellClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const router = useRouter()
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 100,
      },
    },
  })

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              <AnimatePresence mode="popLayout">
                {table.getRowModel().rows.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    layout
                    style={{
                      backgroundColor: "inherit",
                      transformOrigin: "center",
                      width: "100%",
                    }}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer border-b transition-colors hover:bg-muted/50 [&>td]:animate-none"
                    onClick={() => {
                      if (onRowClick) {
                        onRowClick(row.original)
                      } else if (rowClickUrl) {
                        const formattedUrl = rowClickUrl.replace(
                          "{id}",
                          String(row.original.id)
                        )
                        router.push(formattedUrl)
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="text-sm"
                        onClick={() => {
                          const cellClickHandler = onCellClick?.[cell.column.id]
                          if (cellClickHandler) {
                            cellClickHandler(cell.getContext().row.original)
                          }
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
