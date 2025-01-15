"use server"
import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import prisma from "@/store/prisma"
import { getUser } from "@/utils/supabase/server"
import { JobPost } from "@actions/jobpost"
import { createStreamableValue } from "ai/rsc"
// This method must be named GET

const makePrompt = (job: JobPost, additionalInfo: string) => {
  return `
  You are a job description generator. You are given a job post and you need to generate a description for it.
  Output simple markdown with titles, lists, paragraphs.
  Keep the text clean and concise.
  IMPORTANT:
  leave out the following as they are rendered in the job post:
  * job title
  * location
  * company name
  * company website
  * company description
  * where to apply
  * company contact
  * all weights or other numerical inputs
  * tags or other categorical inputs

  The job post is as follows:
  Suggested title: ${job.title}
Use Tone of voice ${job.tone || "neutral"}

  Company name: ${job.organization?.name}
  ${
    job.organization?.website
      ? `Company website: ${job.organization?.website}`
      : ""
  }
  ${
    job.organization?.description
      ? `Company description: ${job.organization?.description}`
      : ""
  }
  ${
    job.organization?.city
      ? `City: ${job.organization.city.name}, Country: ${job.organization.city.country.name}`
      : ""
  }

  Some additional information about the job post:
  
  Job Ratings (1-100) 100 being a subject matter expert:
  ${job.ratings
    ?.map((rating) => `${rating.question}: ${rating.rating}`)
    .join("\n")}

  Job Questions:
  ${job?.questions
    ?.map((question) => `${question.question}: ${question.answer}`)
    .join("\n")}

  Job Tags:
  ${job?.tags?.map((tag) => `${tag.tag.tag}`).join("\n")}

  Job Packages (source ${job.source})
  ${job.packages
    ?.map(
      (pkg) =>
        `${pkg.packageVersion?.package.name} ${pkg.packageVersion?.version}`
    )
    .join("\n")}

   Additional instructions:
  ${additionalInfo || job.additionalInfo || ""}


  `
}

export const writeJobDescription = async ({
  jobId,
  additionalInfo = "",
}: {
  jobId: string
  additionalInfo?: string
}) => {
  const stream = createStreamableValue("")

  ;(async () => {
    const { user } = await getUser()
    if (!user?.id) {
      throw new Error("Unauthorized")
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { organization: true },
    })
    if (!dbUser?.organization?.id) {
      throw new Error("User not in organization")
    }

    const job = await prisma.jobPost.findUnique({
      where: { id: jobId, organizationId: dbUser.organization.id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        questions: true,
        ratings: true,
        organization: {
          include: {
            city: {
              include: {
                country: true,
              },
            },
          },
        },
        packages: {
          include: {
            packageVersion: {
              include: {
                package: true,
              },
            },
          },
        },
      },
    })
    if (!job) {
      throw new Error("Job not found")
    }
    // if (job.description) {
    //   // Simulate streaming for existing description by splitting into characters
    //   for (const char of fixutre) {
    //     await new Promise((resolve) => setTimeout(resolve, 0)) // Add small delay
    //     stream.update(char)
    //   }
    //   stream.done()
    //   return
    // }

    const prompt = makePrompt(job as JobPost, additionalInfo)
    const { textStream, usage } = await streamText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content:
            "You are a professional job description writer. Write clear, concise, and engaging job descriptions.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 2000,
    })

    for await (const delta of textStream) {
      stream.update(delta)
    }

    stream.done()
    const tokenUsage = await usage
    if (tokenUsage) {
      await prisma.jobPostTokenUsage.create({
        data: {
          jobPostId: jobId,
          tokensUsed: tokenUsage.totalTokens,
          userId: user.id,
        },
      })
    }
  })()

  return { output: stream.value }
}

export const generate = async ({ input }: { input: string }) => {
  const stream = createStreamableValue("")

  ;(async () => {
    const { textStream } = streamText({
      model: openai("gpt-3.5-turbo"),
      prompt: input,
    })

    for await (const delta of textStream) {
      stream.update(delta)
    }

    stream.done()
  })()

  return { output: stream.value }
}
