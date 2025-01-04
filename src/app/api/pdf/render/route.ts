import { getJobPost, JobPost } from "@/app/actions/jobpost"
import { renderToStream } from "@react-pdf/renderer"
import { NextRequest, NextResponse } from "next/server"
import createTemplate from "./Template"
export const preferredRegion = ["fra1", "sfo1", "iad1"]
export const dynamic = "force-dynamic"
export async function GET(req: NextRequest) {
  try {
    const requestUrl = new URL(req.url)
    const preview = requestUrl.searchParams.get("preview") === "true"
    const jobId = requestUrl.searchParams.get("job")
    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    const jobPost = await getJobPost({ jobId })
    if (!jobPost) {
      return NextResponse.json({ error: "Job post not found" }, { status: 404 })
    }

    const requiredFields = ["title", "description"] as const
    const missingFields = requiredFields.filter(
      (field): field is (typeof requiredFields)[number] & keyof JobPost =>
        !(field in jobPost)
    )

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      )
    }

    const pdfDocument = await createTemplate({ jobPost })
    if (!pdfDocument) {
      throw new Error("PDF template creation failed")
    }

    const stream = await renderToStream(pdfDocument)
    if (!stream) {
      throw new Error("PDF stream generation failed")
    }

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
    console.error("PDF generation error:", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    })

    return NextResponse.json(
      { error: `Failed to generate PDF: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}
