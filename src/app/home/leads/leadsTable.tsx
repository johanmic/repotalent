"use client"
import { JobPost } from "@/app/actions/jobpost"
import {
  getLeadsForJob,
  Contributor,
  ContributorStats,
} from "@/app/actions/leads"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./[jobId]/columns"
import Lead from "./[jobId]/lead"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { FilterForm } from "./[jobId]/filter-form"
import { FilterOptions } from "@/app/actions/leads"
export const LeadsTable = ({ jobs }: { jobs: JobPost[] }) => {
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null)
  const [leads, setLeads] = useState<Contributor[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Contributor | null>(null)
  const [stats, setStats] = useState<ContributorStats | null>(null)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    hireable: false,
    minFollowers: null,
    maxFollowers: null,
    minContributions: null,
    maxContributions: null,
    minRating: null,
    maxRating: null,
    location: "",
    languages: [],
    repoIds: [],
    starred: false,
  })

  useEffect(() => {
    setSelectedJob(jobs[0])
  }, [jobs])

  useEffect(() => {
    if (selectedJob) {
      getLeadsForJob({
        jobId: selectedJob.id,
        options: filterOptions,
      }).then(({ contributors, stats }) => {
        setLeads(contributors as Contributor[])
        setStats(stats)
      })
    }
  }, [selectedJob, filterOptions])

  const onRowClick = (row: Contributor) => {
    setSelectedLead(row)
    setIsSheetOpen(true)
  }

  return (
    <div className="flex flex-col gap-4 m-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-end gap-2">
          <FilterForm
            options={filterOptions}
            onOptionsChange={(options) => setFilterOptions(options)}
            maxFollowers={stats?.maxFollowers || 10000}
          />
          <div>
            <Select
              value={selectedJob?.id}
              onValueChange={(value) =>
                setSelectedJob(jobs.find((job) => job.id === value) || null)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a job" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}{" "}
                    <span className="text-xs text-muted-foreground">
                      ({job.createdAt.toLocaleDateString()})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {stats && (
        <div className="w-full bg-sidebar-primary-foreground rounded-lg p-3">
          <div className="grid grid-cols-5 gap-2">
            <div className="flex items-center justify-center space-x-1.5 bg-white p-2 rounded border border-slate-200">
              <span className="text-xs text-slate-500">Total</span>
              <span className="text-sm font-semibold">{stats.total}</span>
            </div>
            <div className="flex items-center justify-center space-x-1.5 bg-white p-2 rounded border border-slate-200">
              <span className="text-xs text-slate-500">With email</span>
              <span className="text-sm font-semibold">{stats.emails}</span>
            </div>
            <div className="flex items-center justify-center space-x-1.5 bg-white p-2 rounded border border-slate-200">
              <span className="text-xs text-slate-500">Hireable</span>
              <span className="text-sm font-semibold">{stats.hireable}</span>
            </div>
            <div className="flex items-center justify-center space-x-1.5 bg-white p-2 rounded border border-slate-200">
              <span className="text-xs text-slate-500">Top 100</span>
              <span className="text-sm font-semibold">{stats.top100}</span>
            </div>
            <div className="flex items-center justify-center space-x-1.5 bg-white p-2 rounded border border-slate-200">
              <span className="text-xs text-slate-500">Top 2%</span>
              <span className="text-sm font-semibold">{stats.top2}</span>
            </div>
          </div>
        </div>
      )}

      <DataTable
        columns={columns(selectedJob?.id)}
        data={leads}
        onRowClick={onRowClick}
      />

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] md:w-[680px]">
          <SheetHeader>
            <SheetTitle></SheetTitle>
          </SheetHeader>
          {selectedLead && selectedJob?.id && (
            <Lead contributor={selectedLead} jobId={selectedJob?.id} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default LeadsTable
