import { redirect } from "next/navigation"

import { getUser } from "@/app/actions/user"
const App = async () => {
  const user = await getUser()
  if (!user.organization) {
    redirect("/home/org")
  }
  return <div>Logged in</div>
}

export default App
