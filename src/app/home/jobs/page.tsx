import { getUser } from "@/app/actions/user"
import { redirect } from "next/navigation"
import { listJobs } from "@/app/actions/jobpost"
import { columns } from "./columns"
import { DataTable } from "./data-table"

const JobsPage = async () => {
  const user = await getUser()
  if (!user.organization) {
    redirect("/home/org")
  }
  const jobs = await listJobs()

  return (
    <div className="container mx-auto py-10">
      jerbs
      <DataTable columns={columns} data={jobs} />
    </div>
  )
}

export default JobsPage
