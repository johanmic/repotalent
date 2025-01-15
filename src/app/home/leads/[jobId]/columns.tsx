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
import { LeadBadge } from "./lead"
import { Contributor } from "@/app/actions/leads"
import { starContributor, unstarContributor } from "@actions/leads"
import { useState } from "react"
import { StarComp } from "./star"
import { Icon } from "@/components/icon"
export const columns = (jobId?: string): ColumnDef<Contributor>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string | null
      const isStarred = row.original.jobPostContributorBookmark?.starred
      return (
        <div className="flex items-center space-x-2 max-w-48">
          <StarComp
            jobId={jobId}
            contributorId={row.original.id}
            active={isStarred || false}
          />
          <div className="flex items-center space-x-2">
            {row.original.avatar && (
              <img
                src={row.original.avatar}
                alt={`${name || "User"}'s avatar`}
                className="h-10 w-10 rounded-full min-w-10 min-h-10 object-cover"
              />
            )}
            <div className="space-y-1">
              <div className="text-xs font-bold text-muted-foreground">
                {name || "N/A"}
              </div>
              <LeadBadge followers={row.original.followers || 0} />
            </div>
          </div>
        </div>
      )
    },
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
      <div className="text-xs text-muted-foreground max-w-32 truncate">
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
          {value === null ? (
            "N/A"
          ) : value ? (
            <Icon name="check" className="w-4 h-4" />
          ) : (
            <Icon name="circleHelp" className="w-4 h-4" />
          )}
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
        <div className="overflow-y-auto">
          {contributions.length > 0 ? (
            <div className="space-y-1.5">
              {contributions.map((contrib) => (
                <div
                  key={contrib.id}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  {contrib?.githubRepo?.logo && (
                    <img
                      src={contrib?.githubRepo?.logo}
                      alt={`${contrib?.githubRepo?.name} logo`}
                      className="h-4 w-4 rounded-full flex-shrink-0"
                    />
                  )}
                  <span className="font-medium truncate">
                    {contrib?.githubRepo?.name}
                  </span>
                  <span className="flex-shrink-0">
                    {contrib?.contributions?.toLocaleString() || 0}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">N/A</span>
          )}
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
