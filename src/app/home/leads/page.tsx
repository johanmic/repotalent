import { listJobs } from "@/app/actions/jobpost"
import { getLeadsEnabled, getUser } from "@/app/actions/user"
import { Popup } from "@/components/popup"
import { DataTable } from "@/components/ui/data-table"
import { redirect } from "next/navigation"
import { columns } from "./columns"

const JobsPage = async () => {
  const user = await getUser()
  if (!user) {
    return redirect("/login")
  }
  if (!user?.organization) {
    redirect("/home/org")
  }
  const leadsEnabled = await getLeadsEnabled()
  if (!leadsEnabled) {
    redirect("/home/org")
  }
  const jobs = await listJobs()

  return (
    <div className="container mx-auto py-10">
      {leadsEnabled && (
        <DataTable columns={columns} data={jobs} rowClickUrl={"/home/leads/"} />
      )}
      {!leadsEnabled && (
        <Popup title="Leads are disabled" text="Leads are disabled" />
      )}
    </div>
  )
}

export default JobsPage
