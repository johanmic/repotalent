import { getJobPost } from "@/app/actions/jobpost"
import { getUser } from "@/app/actions/user"
import { redirect } from "next/navigation"

type Params = Promise<{
  jobId: string
}>
const JobPost = async ({ params }: { params: Params }) => {
  const { jobId } = await params
  const job = await getJobPost({ jobId })
  const user = await getUser()
  if (!user) {
    return redirect("/login")
  }
  redirect(`/home/jobs/${jobId}/edit`)
}

export default JobPost
