"use server"
import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import prisma from "@/store/prisma"
import { getUser } from "@/utils/supabase/server"
import { JobPost } from "@actions/jobpost"
import { createStreamableValue } from "ai/rsc"
import { getRatingLabel } from "@/utils/packageRatingsMapper"
import { groupBy } from "ramda"
// This method must be named GET

function shortenPackages(
  packages: Array<{
    packageVersion?: {
      package: {
        name: string
        id: string
        createdAt: Date
        updatedAt: Date
        githubRepoId: string | null
        githubRepo?: {
          name: string
          id: string
          description: string | null
          forks: number | null
        }
      }
      version: string
    }
  }>
) {
  const result = new Set<string>()
  const scopedPackages = new Map<string, string>()
  const basePackages = new Map<string, string>()
  const exclusions = ["react", "react-native", "vite", "vue", "next"]

  packages.forEach((pkg) => {
    if (!pkg.packageVersion?.package.name) return
    const name = pkg.packageVersion.package.name

    // Skip excluded packages
    if (exclusions.some((excluded) => name === excluded)) return

    // Check if it's a scoped package
    const scopeMatch = name.match(/^(@[^/]+)/)
    if (scopeMatch) {
      const scope = scopeMatch[1]
      // Only keep the first package we find with this scope
      if (!scopedPackages.has(scope)) {
        scopedPackages.set(scope, name)
        result.add(name)
      }
    } else {
      // Handle similar package names (e.g., tailwind-*)
      const baseNameMatch = name.match(/^([^-]+)/)
      if (baseNameMatch) {
        const baseName = baseNameMatch[1]
        if (!basePackages.has(baseName)) {
          // Store just the first package we find with this base name
          basePackages.set(baseName, name)
          // Only add the first occurrence to the result
          result.add(name)
        }
        // Skip adding to result if we've seen this base name before
        return
      } else {
        // Add non-matching packages as-is
        result.add(name)
      }
    }
  })

  // Return comma-separated list without versions
  return Array.from(result).join(", ")
}

const makePrompt = ({
  job,
  additionalInfo,
  packageRequirementsInstructions,
}: {
  job: JobPost
  additionalInfo: string
  packageRequirementsInstructions: string
}) => {
  return `
  You are a job description generator. You are given a job post and you need to generate a description for it.
  Output simple markdown with titles, lists, paragraphs.
  Keep the text clean and concise.
  IMPORTANT:
  leave out the following as they are rendered in the job post:
  job title, location, company name, company website, company description, where to apply, company contact, all weights or numerical inputs, tags or categorical inputs

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
    .join(",")}

  Job Tags:
  ${job?.tags?.map((tag) => `${tag.tag.tag}`).join(",")}

  Job Packages (source ${job.source})
  ${job.packages ? shortenPackages(job.packages) : ""}

  ${packageRequirementsInstructions}
  
  ${additionalInfo ? `Additional instructions: ${additionalInfo}` : ""}


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
                package: {
                  include: {
                    githubRepo: true,
                  },
                },
              },
            },
          },
        },
      },
    })
    if (!job) {
      throw new Error("Job not found")
    }
    const ratings = job.packages
      .filter((pkg) => pkg.importance && pkg.importance >= 5)
      .map((pkg) => {
        if (!pkg.importance) return null
        return {
          name: pkg.packageVersion?.package.githubRepo?.name,
          label: getRatingLabel(pkg.importance).text,
        }
      })
      .filter(Boolean) as {
      name: string
      label: string
    }[]
    const grouped = groupBy((pkg) => pkg.label, ratings)

    let packageRequirementsInstructions = ""
    const packageRequirements = Object.entries(grouped)
      .map(
        ([label, pkgs]) => `${label}: ${pkgs?.map((p) => p?.name).join(", ")}`
      )
      .join("\n")

    if (packageRequirements) {
      packageRequirementsInstructions = `
      Important: Consider the following packages when writing the job description:
      ${packageRequirements}
      `
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

    // return null

    const prompt = makePrompt({
      job: job as JobPost,
      additionalInfo,
      packageRequirementsInstructions,
    })

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
