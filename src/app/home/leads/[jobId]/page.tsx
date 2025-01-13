import { listJobs, getJobPost } from "@/app/actions/jobpost"
import LeadsTable from "./leadsTable"
import { getLeadsEnabled } from "@/app/actions/user"

type Params = Promise<{
  jobId: string
}>

const LeadsPage = async ({ params }: { params: Params }) => {
  const { jobId } = await params
  const leadsEnabled = await getLeadsEnabled()
  const job = await getJobPost({ jobId })
  //   const leads = await getLeadsForJob({ jobIds: ["1", "2"] })

  return leadsEnabled ? <LeadsTable job={job} /> : <div>Leads are disabled</div>
}

export default LeadsPage
