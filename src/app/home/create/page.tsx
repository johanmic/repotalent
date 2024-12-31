import { getUser } from "@/app/actions/user"
import { redirect } from "next/navigation"
import CreditsPopup from "@/components/credits-popup"
import Create from "./Create"
const NewPostPage = async () => {
  const user = await getUser()
  if (!user) {
    return redirect("/login")
  }
  if (!user?.organization) {
    redirect("/home/org")
  }
  const hasGithub =
    user.githubInstallationId !== null || user.skipGithub === false
  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6 min-h-screen h-full">
      <Create hasGithub={hasGithub} />
      {user.creditsInfo?.creditsAvailable === 0 && (
        <CreditsPopup creditsAvailable={0} />
      )}
    </div>
  )
}

export default NewPostPage
