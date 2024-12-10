import NewPost from "./New"
import { getUser } from "@/app/actions/user"
import { redirect } from "next/navigation"

const NewPostPage = async () => {
  const user = await getUser()
  if (!user.organization) {
    redirect("/home/org")
  }
  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6 min-h-screen h-full">
      <NewPost />
    </div>
  )
}

export default NewPostPage
