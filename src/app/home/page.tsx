import { redirect } from "next/navigation"

import { getUser } from "@/app/actions/user"
import HomeChecklist from "@/components/home-checklist"
const App = async () => {
  const user = await getUser()
  if (!user) {
    return redirect("/login")
  }
  // if (!user?.organization) {
  //   redirect("/home/org")
  // }
  // const githubToken = await getGithubToken()
  const hasApp = user.githubInstallationId !== null
  const hasOrg = Boolean(user.organization)
  console.log("hasApp", hasApp)
  console.log("hasOrg", hasOrg, user.organization)
  console.log("render")
  return (
    <div>
      <HomeChecklist hasApp={hasApp} hasOrg={hasOrg} />
    </div>
  )
}

export default App
