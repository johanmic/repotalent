import { getUser } from "@/app/actions/user"
import { redirect } from "next/navigation"
import { listJobs } from "@/app/actions/jobpost"
import { columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import HomeChecklist from "@/components/home-checklist"
const JobsPage = async () => {
  const user = await getUser()
  if (!user) {
    return redirect("/login")
  }
  if (!user?.organization) {
    redirect("/home/org")
  }
  const jobs = await listJobs()

  const hasApp = user.githubInstallationId !== null || user.skipGithub === true
  const hasOrg = Boolean(user.organization)
  const hasJob = jobs.length > 0
  console.log(jobs)
  return (
    <div className="container mx-auto py-10">
      {!hasApp || !hasOrg || !hasJob ? (
        <HomeChecklist hasApp={hasApp} hasOrg={hasOrg} hasJob={hasJob} />
      ) : (
        <DataTable columns={columns} data={jobs} />
      )}
    </div>
  )
}

export default JobsPage
