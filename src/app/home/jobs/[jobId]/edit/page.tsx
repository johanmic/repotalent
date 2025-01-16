import Generate from "./Generate"
import { getJobPost, getJobPostTokenUsage } from "@/app/actions/jobpost"
type Params = Promise<{
  jobId: string
}>
import { getUser } from "@/app/actions/user"
import { getCurrencies } from "@/app/actions/city"

const EditJobPost = async ({ params }: { params: Params }) => {
  const { jobId } = await params
  const job = await getJobPost({ jobId: jobId as string })
  const currencies = await getCurrencies()
  const tokenUsage = await getJobPostTokenUsage(jobId as string)
  return (
    <div className="mx-auto flex justify-center  h-full">
      <Generate
        job={job}
        currencies={currencies}
        canRegenerate={tokenUsage < 20000}
      />
    </div>
  )
}

export default EditJobPost
