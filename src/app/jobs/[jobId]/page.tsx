import { getPublishedJobPost } from "@actions/jobpost"
import { JobPost } from "@/components/job-post"
import { JobsMenu } from "@/components/jobs-menu"
type Params = Promise<{ jobId: string }>
import { DotBackground } from "@/components/ui/dot-background"
export default async function JobPage({ params }: { params: Params }) {
  const { jobId } = await params
  const job = await getPublishedJobPost({ slug: jobId })
  if (!job) {
    return <div>Job not found</div>
  }
  return (
    <DotBackground>
      <div className="max-w-5xl mx-auto">
        <JobPost job={job} />
      </div>
    </DotBackground>
  )
}
