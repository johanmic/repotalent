import { JobPost } from "@actions/jobpost"
import { Title } from "@/components/title"
import { Icon } from "@/components/icon"
import { Text } from "@/components/text"
import { AppIconsList } from "@/components/app-icons-list"
import { getImageUrl } from "@/utils/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
export const JobPostListItem = ({ job }: { job: JobPost }) => {
  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="bg-muted/50 p-4 flex rounded-md my-2 cursor-pointer hover:bg-muted/50"
    >
      <div className="flex flex-row w-full justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={getImageUrl(job.organization?.image)} />
              <AvatarFallback>
                {job.organization?.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Title size="lg">{job.title}</Title>
              <div className="flex items-center gap-1">
                <Text light variant="caption">
                  {job.organization?.name}
                </Text>
                <div className="flex items-center gap-1">
                  <Text light variant="caption">
                    {job?.organization?.city?.name},
                    {job?.organization?.city?.country?.name}
                  </Text>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <AppIconsList
              items={job?.tags?.map((tag) => tag.tag.tag) || []}
              maxItems={5}
              iconSize={12}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Icon name="chevronRight" className="w-4 h-4" />
        </div>
      </div>
    </Link>
  )
}
