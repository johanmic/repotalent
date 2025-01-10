"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Contributor } from "@/app/actions/leads"

export const columns: ColumnDef<Contributor>[] = [
  {
    accessorKey: "avatar",
    header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
    enableSorting: false,
    cell: ({ row }) => (
      <img
        src={row.getValue("avatar")}
        alt={`${row.getValue("name")}'s avatar`}
        className="h-10 w-10 rounded-full min-w-10 min-h-10"
      />
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "bio",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bio" />
    ),
    cell: ({ row }) => {
      const bio = row.getValue("bio") as string | null
      return (
        <div className="text-xs text-muted-foreground max-w-64">
          {bio ? bio.slice(0, 200) + "..." : "N/A"}
        </div>
      )
    },
  },
  {
    accessorKey: "company",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        {row.getValue("company")}
      </div>
    ),
  },
  {
    accessorKey: "locationRaw",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        {row.getValue("locationRaw")}
      </div>
    ),
  },
  {
    accessorKey: "followers",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Followers" />
    ),
    cell: ({ row }) => (
      <div className="text-xs">{row.getValue("followers")}</div>
    ),
  },
  {
    accessorKey: "hireable",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hireable" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("hireable")
      return (
        <div className="text-xs text-muted-foreground">
          {value === null ? "N/A" : value ? "Yes" : "No"}
        </div>
      )
    },
  },
  {
    accessorKey: "contributions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contributions" />
    ),
    cell: ({ row }) => {
      const contributions = row.original.contributions
      return (
        <div className="text-xs text-muted-foreground space-y-1">
          {contributions.length > 0
            ? contributions.map((contrib) => (
                <div key={contrib.id}>
                  {`${contrib.contributions.toLocaleString()} to`}
                  <span className="font-bold ml-1">
                    {contrib.githubRepo.name}
                  </span>
                </div>
              ))
            : "N/A"}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const contributor = row.original

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
              onClick={() => navigator.clipboard.writeText(contributor.id)}
            >
              Copy Contributor ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem>View Contributions</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
