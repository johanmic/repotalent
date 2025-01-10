import { listJobs } from "@/app/actions/jobpost"
import LeadsTable from "./leadsTable"

const LeadsPage = async () => {
  const jobs = await listJobs()
  //   const leads = await getLeadsForJob({ jobIds: ["1", "2"] })

  return <LeadsTable jobs={jobs} />
}

export default LeadsPage
