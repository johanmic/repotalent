import { starContributor, unstarContributor } from "@actions/leads"
import { Star } from "lucide-react"
import { useState } from "react"

export const StarComp = ({
  jobId,
  contributorId,
  active,
}: {
  jobId: string | undefined
  contributorId: string
  active: boolean
}) => {
  const [star, setStar] = useState(active)
  if (!jobId) return null
  return (
    <div
      onClick={async (e) => {
        e.stopPropagation()
        if (star) {
          setStar(false)
          await unstarContributor({ contributorId, jobId })
        } else {
          setStar(true)
          await starContributor({ contributorId, jobId })
        }
      }}
    >
      <Star
        className={`h-5 w-5 ${
          star ? "fill-yellow-500 text-yellow-500" : "text-slate-500"
        }`}
      />
    </div>
  )
}
