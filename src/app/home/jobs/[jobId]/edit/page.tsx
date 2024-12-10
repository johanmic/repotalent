import Generate from "./Generate"
import { getJobPost } from "@/app/actions/jobpost"
type Params = Promise<{
  jobId: string
}>
const EditJobPost = async ({ params }: { params: Params }) => {
  const { jobId } = await params
  const job = await getJobPost({ jobId: jobId as string })
  return (
    <div className="mx-auto">
      <Generate job={job} />
    </div>
  )
}

export default EditJobPost
