"use client"

import { JobPost } from "@/app/actions/jobpost"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { REQUIRED_ACTIONS } from "@/utils/job/constants"
import { ColumnDef } from "@tanstack/react-table"
import { Check, MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { Progress } from "@/components/ui/progress"

export const columns: ColumnDef<JobPost>[] = [
  // {
  //   accessorKey: "slug",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="slug" />
  //   ),
  // },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
  },

  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString()
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const job = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(job.id)}
            >
              Copy Job ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit Job</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
  {
    id: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const job = row.original

      const completedActions =
        job.jobActionsLog?.filter((log) => log.completed).length || 0
      const totalActions = REQUIRED_ACTIONS.length
      const progress = (completedActions / totalActions) * 100
      if (progress === 100) {
        return (
          <div className="flex items-center gap-2">
            <Check className="text-green-500" />
            <span className="text-sm">Completed</span>
          </div>
        )
      }
      return <Progress value={progress} />
    },
  },
  {
    id: "viewLeads",
    header: "Leads",
    cell: ({ row }) => {
      return (
        <Button variant="outline" className="text-sm">
          View Leads
        </Button>
      )
    },
  },
]
