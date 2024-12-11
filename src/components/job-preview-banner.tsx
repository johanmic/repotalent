"use client"
import { Button } from "@/components/ui/button"
import { setPublished } from "@/app/actions/jobpost"
import Link from "next/link"
import Icon from "@/components/icon"
import { JobPost } from "@actions/jobpost"

export const JobPreviewBanner = ({
  job,
  published,
}: {
  job: JobPost
  published: boolean
}) => {
  return (
    <div className="flex justify-end  gap-2 bg-muted p-4">
      <div>
        <Button
          size="sm"
          variant={published ? "outline" : "default"}
          onClick={async () => {
            await setPublished({
              jobId: job.id,
              published: job.published ? false : true,
            })
          }}
        >
          <Icon name={job.published ? "circleX" : "circleCheck"} />
          {job.published ? "Unpublish" : "Publish"}
        </Button>
      </div>
      <div>
        <Link href={`/home/jobs/${job.id}/edit`}>
          <Button size="sm" variant="outline">
            <Icon name="pen" />
            Edit
          </Button>
        </Link>
      </div>
    </div>
  )
}
