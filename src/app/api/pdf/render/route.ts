import { NextRequest, NextResponse } from "next/server"
import { renderToStream } from "@react-pdf/renderer"
import createTemplate from "./Template"
import { Buffer } from "buffer"
export const preferredRegion = ["fra1", "sfo1", "iad1"]
export const dynamic = "force-dynamic"
import { getJobPost } from "@/app/actions/jobpost"
import { createClient } from "@/utils/supabase/server"
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const requestUrl = new URL(req.url)
    const preview = requestUrl.searchParams.get("preview") === "true"
    const jobId = requestUrl.searchParams.get("job")
    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }
    let logo = ""
    let logoUrl = ""
    const jobPost = await getJobPost({ jobId })

    const pdfDocument = await createTemplate({ jobPost })
    const stream = await renderToStream(pdfDocument)

    // Convert the PDF stream to a Web ReadableStream
    const blob = await new Response(stream as unknown as BodyInit).blob()

    const headers: Record<string, string> = {
      "Content-Type": "application/pdf",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    }

    if (!preview) {
      headers[
        "Content-Disposition"
      ] = `attachment; filename="${jobPost.title}.pdf"`
    }

    return new Response(blob, { headers })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}
