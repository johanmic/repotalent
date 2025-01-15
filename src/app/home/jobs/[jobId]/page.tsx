import { getJobPost } from "@/app/actions/jobpost"
import { getUser } from "@/app/actions/user"
import AppIconsList from "@/components/app-icons-list"
import JobPostBadge from "@/components/job-post-badge"
import TiptapRenderer from "@/components/tiptap-renderer"
import { Title } from "@/components/title"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
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
