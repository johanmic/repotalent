type Params = Promise<{
  jobId: string
}>
import { getJobPost } from "@actions/jobpost"
import { NotFound } from "./notFound"
import Complete from "./Complete"
const CompleteJobPost = async ({ params }: { params: Params }) => {
  const { jobId } = await params
  const job = await getJobPost({ jobId })
  if (!job) {
    return <NotFound />
  }

  return (
    <div>
      <Complete jobPost={job} />
    </div>
  )
}

export default CompleteJobPost
