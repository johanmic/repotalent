"use client"
import { JobPost } from "@/app/actions/jobpost"
import { getLeadsForJob, Contributor } from "@/app/actions/leads"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import Lead from "./lead"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export const LeadsTable = ({ jobs }: { jobs: JobPost[] }) => {
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null)
  const [leads, setLeads] = useState<Contributor[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Contributor | null>(null)

  useEffect(() => {
    if (selectedJob) {
      console.log("getting leads for", selectedJob.title)
      getLeadsForJob({ jobId: selectedJob.id }).then((leads) => {
        setLeads(leads as Contributor[])
      })
    }
  }, [selectedJob])
  console.log("leads", leads)

  const onRowClick = (row: Contributor) => {
    setSelectedLead(row)
    setIsSheetOpen(true)
  }

  return (
    <div className="flex flex-col gap-4 m-4">
      <div className="flex justify-end">
        <div>
          <Select
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
      <DataTable columns={columns} data={leads} onRowClick={onRowClick} />

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] md:w-[680px]">
          <SheetHeader>
            <SheetTitle></SheetTitle>
          </SheetHeader>
          {selectedLead && <Lead contributor={selectedLead} />}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default LeadsTable
