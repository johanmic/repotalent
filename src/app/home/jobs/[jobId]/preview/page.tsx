import { getJobPost } from "@/app/actions/jobpost"
import { JobPost } from "@/components/job-post"
import { JobPreviewBanner } from "@/components/job-preview-banner"

type Params = Promise<{
  jobId: string
}>
const JobPostPreview = async ({ params }: { params: Params }) => {
  const { jobId } = await params
  const job = await getJobPost({ jobId })
  return (
    <div>
      <JobPreviewBanner job={job} published={!!job.published} />
      <JobPost job={job} />
    </div>
  )
}

export default JobPostPreview
