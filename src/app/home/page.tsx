import { redirect } from "next/navigation"

import { getUser } from "@/app/actions/user"
import HomeChecklist from "@/components/home-checklist"
import { listJobs } from "@/app/actions/jobpost"
const App = async () => {
  const user = await getUser()
  if (!user) {
    return redirect("/login")
  }
  // if (!user?.organization) {
  //   redirect("/home/org")
  // }
  // const githubToken = await getGithubToken()
  const jobs = await listJobs()
  const hasApp = user.githubInstallationId !== null
  const hasOrg = Boolean(user.organization)
  const hasJob = jobs.length > 0
  // if (hasJob) {
  //   redirect("/home/jobs")
  // }
  console.log("hasApp", hasApp)
  console.log("hasOrg", hasOrg, user.organization)
  console.log("render")
  return (
    <div>
      <HomeChecklist hasApp={hasApp} hasOrg={hasOrg} hasJob={hasJob} />
    </div>
  )
}

export default App
