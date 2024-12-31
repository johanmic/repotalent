import { getJobPost } from "@/app/actions/jobpost"
import { JobPost } from "@/components/job-post"
import { JobPreviewBanner } from "@/components/job-preview-banner"

type Params = Promise<{
  jobId: string
}>
const JobPostPreview = async ({ params }: { params: Params }) => {
  const { jobId } = await params
  const job = await getJobPost({ jobId })
  const canPublish = job.creditUsage?.some((usage) => usage.purchase?.jobBoard)
  return (
    <div>
      <JobPreviewBanner
        job={job}
        published={!!job.published}
        canPublish={!!canPublish}
      />
      <JobPost job={job} />
    </div>
  )
}

export default JobPostPreview
