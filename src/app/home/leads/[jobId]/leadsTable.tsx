"use client"
import { JobPost } from "@/app/actions/jobpost"
import {
  Contributor,
  ContributorStats,
  FilterOptions,
  getLeadsForJob,
} from "@/app/actions/leads"
import { DataTable } from "@/components/ui/data-table"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useEffect, useState } from "react"
import { columns } from "./columns"
import { FilterForm } from "./filter-form"
import Lead from "./lead"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { Title } from "@/components/title"
export const LeadsTable = ({ job }: { job: JobPost }) => {
  const [leads, setLeads] = useState<Contributor[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Contributor | null>(null)
  const [stats, setStats] = useState<ContributorStats | null>(null)
  const [loading, setLoading] = useState(false)

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
    setLoading(true)
    getLeadsForJob({
      jobId: job.id,
      options: filterOptions,
    })
      .then(({ contributors, stats }) => {
        setLeads(contributors as Contributor[])
        setStats(stats)
        setLoading(false)
      })
      .catch((error) => {
        toast.error("Error fetching leads")
        setLoading(false)
      })
  }, [job, filterOptions])

  const onRowClick = (row: Contributor) => {
    setSelectedLead(row)
    setIsSheetOpen(true)
  }

  const onCellClick = {
    star: (cell: Contributor) => {},
  }
  return (
    <div className="flex flex-col gap-4 m-4">
      {loading && (
        <div className="fixed right-10 bottom-10 m-auto flex justify-center items-center bg-black text-white p-2 rounded-lg gap-4 z-[10] w-64 h-16">
          Fetching data
          <Spinner size="xsmall" className="text-white" />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Leads for</p>
        <Title>{job.title}</Title>
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
      <div className="flex justify-end gap-2">
        <FilterForm
          options={filterOptions}
          onOptionsChange={(options) => setFilterOptions(options)}
          maxFollowers={stats?.maxFollowers || 10000}
        />
      </div>
      <DataTable
        columns={columns(job.id)}
        data={leads}
        onRowClick={onRowClick}
        onCellClick={onCellClick}
      />

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] md:w-[680px]">
          <SheetHeader>
            <SheetTitle></SheetTitle>
          </SheetHeader>
          {selectedLead && <Lead contributor={selectedLead} jobId={job.id} />}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default LeadsTable
