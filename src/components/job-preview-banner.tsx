"use client"
import { Button } from "@/components/ui/button"
import { setPublished } from "@/app/actions/jobpost"
import Link from "next/link"
import Icon from "@/components/icon"
import { JobPost } from "@actions/jobpost"
import Text from "@/components/text"
import { useCopyToClipboard } from "@uidotdev/usehooks"
import { toast } from "sonner"
export const JobPreviewBanner = ({
  job,
  published,
}: {
  job: JobPost
  published: boolean
}) => {
  const [copied, copy] = useCopyToClipboard()
  return (
    <div className="flex justify-between items-center bg-muted p-4">
      {job.published ? (
        <div className="flex items-center gap-2">
          <Link href={`/jobs/${job.slug}`}>
            <Text variant="small" className="italic">
              repotalent.com/jobs/{job.slug.slice(0, 30)}...
            </Text>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              copy(`www.repotalent.com/jobs/${job.slug}`)
              toast.success("Copied to clipboard")
            }}
          >
            <Icon name={copied ? "circleCheck" : "copy"} />
          </Button>
        </div>
      ) : (
        <div />
      )}
      <div className="flex justify-end gap-2 items-center self-end">
        <Link href={`/api/pdf/render?job=${job.id}`}>
          {" "}
          <Button size="sm" variant="outline">
            <Icon name="pdf" />
            Export to PDF
          </Button>
        </Link>
        <Link href={`/api/markdown?job=${job.id}`}>
          {" "}
          <Button size="sm" variant="outline">
            <Icon name="file" />
            Export to Markdown
          </Button>
        </Link>
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
            <Icon name={job.published ? "eyeOff" : "eye"} />
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
    </div>
  )
}
