import { listPublishedJobs } from "@actions/jobpost"
import { JobPostListItem } from "@/components/job-post-list-item"
import { JobsMenu } from "@/components/jobs-menu"
export default async function JobsPage() {
  const jobs = await listPublishedJobs({})
  return (
    <div className=" max-auto">
      <div className="max-w-4xl mx-auto">
        <JobsMenu />
        {jobs.map((job) => (
          <JobPostListItem key={job.id} job={job} />
        ))}
      </div>
    </div>
  )
}
