export const dynamic = "force-dynamic"
export const revalidate = 0

import Jobs from "./Jobs"
import { listPublishedJobs } from "@actions/jobpost"
import { Logo } from "@/components/logo"
import { DotBackground } from "@/components/ui/dot-background"

export default async function JobsPage() {
  const publishedJobs = await listPublishedJobs({})
  return (
    <div className="max-auto">
      <DotBackground>
        <div className="flex flex-col items-center justify-center">
          <Logo size="lg" />
          <Jobs publishedJobs={publishedJobs} />
        </div>
      </DotBackground>
    </div>
  )
}
