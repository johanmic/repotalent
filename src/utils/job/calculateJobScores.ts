import { PrismaClient } from "@prisma/client"
import prisma from "@/store/prisma"

export const precalcRatings = async (
  jobId: string,
  alpha = 0.4,
  beta = 0.3,
  gamma = 0.3
) => {
  const job = await prisma.jobPost.findUnique({ where: { id: jobId } })
  if (!job) return

  const jobRepoCount = 5 // your logic to count job repos
  const jobSeniority = job.seniority || 1

  const contributors = await prisma.contributor.findMany({
    where: {
      fetchedAt: {
        not: null,
      },
      jobPostContributorBookmark: {
        none: {
          jobPostId: jobId,
        },
      },
      contributions: {
        some: {
          githubRepo: {
            openSourcePackage: {
              some: {
                versions: {
                  some: {
                    jobPosts: {
                      some: {
                        jobPostId: jobId,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    include: {
      contributions: {
        distinct: ["githubRepoId"],
        include: {
          githubRepo: true,
        },
      },
    },
  })

  console.log(contributors.length)

  console.log(`Processing ${contributors.length} contributors`)

  // Process in batches of 100
  const batchSize = 100
  const batches = []

  for (let i = 0; i < contributors.length; i += batchSize) {
    const batch = contributors.slice(i, i + batchSize).map((contributor) => {
      const publicRepos = contributor.publicRepos || 0
      const totalContributions = contributor.contributions.reduce(
        (acc, c) => acc + c.contributions,
        0
      )
      const followers = contributor.followers || 0
      const relevantContributions = 3 // your logic to count relevant contributions

      const CS = Math.log(publicRepos + 1) + Math.log(totalContributions + 1)
      const R = relevantContributions / (jobRepoCount + 1)
      const I = Math.log(followers + 1)
      const S = 1 - Math.abs(CS - jobSeniority)

      const Q = alpha * R + beta * I + gamma * S

      return prisma.jobPostContributorBookmark.upsert({
        where: {
          jobPostId_contributorId: {
            jobPostId: jobId,
            contributorId: contributor.id,
          },
        },
        create: {
          jobPostId: jobId,
          contributorId: contributor.id,
          rating: Q,
        },
        update: { rating: Q },
      })
    })

    console.log(
      `Processing batch ${i / batchSize + 1} of ${Math.ceil(
        contributors.length / batchSize
      )}`
    )
    const batchResult = await Promise.all(batch)
    batches.push(batchResult)
  }

  const results = batches.flat()
  console.log(`Completed processing ${results.length} contributors`)
}

precalcRatings("cm5n1dltq0004rzb8yuhdelnw")
