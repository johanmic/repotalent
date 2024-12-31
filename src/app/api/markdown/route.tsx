import { getJobPost } from "@/app/actions/jobpost"
import { renderHTML } from "@components/tiptap-renderer"
import TurndownService from "turndown"
const turndownService = new TurndownService()
import { getSeniorityLabel } from "@/utils/seniorityMapper"
// import { getSeniorityLabel } from "@/lib/seniority"
import { parseValue } from "@/utils/seniorityMapper"
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get("job")
  const isPreview = searchParams.get("preview") === "true"

  if (!jobId) {
    return new Response("Job ID is required", { status: 400 })
  }

  const renderRequirement = ({
    question,
    rating,
  }: {
    question: string
    rating: number
  }) => {
    if (rating === 0) return ""
    const { text } = parseValue(rating)
    // Rating is already in percentage (0-100)
    const percentage = rating

    // Calculate filled and empty blocks (20 blocks total)
    const blocks = 20
    const filledBlocks = Math.round((percentage / 100) * blocks)
    const emptyBlocks = blocks - filledBlocks

    return `- ${question}: **${text}**`
  }

  const jobPost = await getJobPost({ jobId })
  const html = await renderHTML({ json: jobPost.description || "" })

  // Create markdown content with title and tags
  const tagsMarkdown = jobPost.tags
    ? `\nTags: *${jobPost.tags.map((t) => t.tag.tag).join(", ")}*\n`
    : ""
  const seniority = getSeniorityLabel((jobPost?.seniority as number) || 0).key

  const ratings = jobPost.ratings?.map((rating) =>
    renderRequirement({
      question: rating.question,
      rating: rating.rating || 0,
    })
  )
  const markdownContent = `# ${
    jobPost.title
  }${tagsMarkdown}\nSeniority: **${seniority}**\n\n${turndownService.turndown(
    html
  )}\n## Requirements\n${ratings?.join("\n")}\n${
    jobPost.applicationUrl ? `\n\n[Apply Now](${jobPost.applicationUrl})` : ""
  }`
  // If preview mode, return plain text response
  if (isPreview) {
    return new Response(markdownContent, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }

  // Create headers for markdown file download
  const headers = new Headers()
  headers.set("Content-Type", "text/markdown")
  headers.set(
    "Content-Disposition",
    `attachment; filename="${jobPost.slug}.md"`
  )

  return new Response(markdownContent, {
    status: 200,
    headers,
  })
}
