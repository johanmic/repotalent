import { redirect } from "next/navigation"

import { getUser } from "@/app/actions/user"
import HomeChecklist from "@/components/home-checklist"
import { listJobs } from "@/app/actions/jobpost"
const App = async () => {
  const user = await getUser()
  if (!user) {
    return redirect("/login")
  }
  if (!user?.organization) {
    redirect("/home/org")
  }
  // const githubToken = await getGithubToken()

  redirect("/home/jobs")
}

export default App
