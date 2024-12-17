import { getPublishedJobPost } from "@actions/jobpost"
import { JobPost } from "@/components/job-post"
import { JobsMenu } from "@/components/jobs-menu"
type Params = Promise<{ jobId: string }>

export default async function JobPage({ params }: { params: Params }) {
  const { jobId } = await params
  const job = await getPublishedJobPost({ slug: jobId })
  if (!job) {
    return <div>Job not found</div>
  }
  return (
    <div>
      <JobPost job={job} />
    </div>
  )
}
