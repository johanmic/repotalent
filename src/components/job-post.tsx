import AppIconsList from "@/components/app-icons-list"
import Icon from "@/components/icon"
import JobPostBadge from "@/components/job-post-badge"
import TiptapRenderer from "@/components/tiptap-renderer"
import { Title } from "@/components/title"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency, getCurrencySymbol } from "@/utils/formatCurrency"
import { getImageUrl } from "@/utils/image"
import { getSeniorityLabel } from "@/utils/seniorityMapper"
import type { JobPost as JobPostType } from "@actions/jobpost"
import Link from "next/link"
export const JobPost = ({ job }: { job: JobPostType }) => {
  const imageUrl = job?.organization?.image
    ? getImageUrl(job?.organization?.image || "")
    : undefined
  return (
    <div className="max-w-4xl mt-8 mx-auto p-4 md:p-0 grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="col-span-3">
        <div className="flex items-center gap-2 mb-4">
          <Avatar className="w-14 h-14">
            <AvatarImage src={imageUrl} />
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
      <div className="flex flex-col col-span-5 md:col-span-2 gap-2 mt-24">
        {job.applicationUrl && (
          <Link href={job.applicationUrl} target="_blank">
            <Button size="sm" className="w-full">
              <Icon name="mailPlus" />
              Apply
            </Button>
          </Link>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-sm font-semibold">Seniority:</div>
              <p className="text-sm font-medium">
                {getSeniorityLabel((job?.seniority as number) || 0).key}
              </p>
            </div>
            {job.minSalary || job.maxSalary ? (
              <div className="flex items-center gap-2 mb-4">
                <div className="text-sm font-semibold">
                  {job.minSalary && job.maxSalary
                    ? "Salary:"
                    : job.minSalary
                    ? "Salary from:"
                    : "Salary:"}
                </div>
                <p className="text-sm font-medium">
                  {job.minSalary ? formatCurrency(job.minSalary) : null}
                  {job.minSalary && job.maxSalary ? " - " : null}
                  {job.maxSalary ? formatCurrency(job.maxSalary) : null}
                  {getCurrencySymbol(job.currency?.code || "")}
                </p>
              </div>
            ) : null}
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
            <CardTitle className="text-sm font-semibold">
              Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {job.ratings?.map((rating) => (
              <div
                key={rating.id}
                className="flex flex-col gap-2 bg-secondary my-2 p-2 rounded-md"
              >
                <p className="text-xs font-medium">{rating.question}</p>
                <Progress value={rating.rating || 50} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
