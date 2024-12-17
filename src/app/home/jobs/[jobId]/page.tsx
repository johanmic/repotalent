import { getJobPost } from "@/app/actions/jobpost"
import { getUser } from "@/app/actions/user"
import AppIconsList from "@/components/app-icons-list"
import JobPostBadge from "@/components/job-post-badge"
import TiptapRenderer from "@/components/tiptap-renderer"
import { Title } from "@/components/title"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { redirect } from "next/navigation"

type Params = Promise<{
  jobId: string
}>
const JobPost = async ({ params }: { params: Params }) => {
  const { jobId } = await params
  const job = await getJobPost({ jobId })
  const user = await getUser()
  if (!user) {
    return redirect("/login")
  }
  console.log(job.ratings)
  return (
    <div className="max-w-4xl mt-8 mx-auto p-4 md:p-0 grid grid-cols-5 gap-4">
      <div className="col-span-3">
        <div className="flex items-center gap-2 mb-4">
          <Avatar>
            <AvatarImage src={job?.organization?.image || ""} />
            <AvatarFallback>
              {job?.organization?.name?.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium">{job?.organization?.name}</p>
            <p className="text-sm text-muted-foreground italic">
              {job?.organization?.city?.name},{" "}
              {job?.organization?.city?.country?.name}
            </p>
          </div>
        </div>

        <Title size="lg">{job?.title}</Title>
        <AppIconsList
          items={job?.tags?.map((tag) => tag.tag.tag) || []}
          maxItems={5}
        />
        <TiptapRenderer className="mt-8" json={job?.description || ""} />
      </div>
      <div className="col-span-2">
        <Card>
          <CardContent>
            <CardTitle className="text-lg font-semibold pb-4">
              Job Details
            </CardTitle>
            <div className="gap-2 flex flex-col">
              <JobPostBadge
                icon="home"
                text="Remote"
                value={job?.remote}
                booleanValue
              />
              <JobPostBadge
                icon="briefcase"
                text="Hybrid"
                value={job?.hybrid}
                booleanValue
              />
              <JobPostBadge
                icon="timer"
                text="Consulting"
                value={job?.consulting}
                booleanValue
              />
              <JobPostBadge
                icon="blocks"
                text="Equity"
                value={job?.equity}
                booleanValue
              />
              <JobPostBadge
                icon="keySquare"
                text="Open Source"
                value={job?.openSource}
                booleanValue
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold pb-4">
              Job Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {job.ratings?.map((rating) => (
              <div key={rating.id}>
                <p>{rating.rating}</p>
                <Progress value={rating.rating} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default JobPost
