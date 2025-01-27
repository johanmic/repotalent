import prisma from "@/store/prisma"
import { logger } from "@trigger.dev/sdk/v3"
interface Contributor {
  id: string
  publicRepos: number | null
  followers: number | null
  contributions: {
    contributions: number
    githubRepo: {
      id: string
    }
  }[]
}

export const precalcRatingsHandler = async (
  jobId: string,
  contributorId: string,
  alpha = 0.4,
  beta = 0.3,
  gamma = 0.3
) => {
  const contributor = await prisma.contributor.findUniqueOrThrow({
    where: { id: contributorId },
    include: {
      contributions: {
        distinct: ["githubRepoId"],
        include: {
          githubRepo: true,
        },
      },
    },
  })
  if (!contributor) return

  const jobRepoCount = 5
  const jobSeniority = 1

  await processContributor({
    contributor,
    jobId,
    jobRepoCount,
    jobSeniority,
    alpha,
    beta,
    gamma,
  })
}

//---

export const precalcRatingsCronHandler = async (
  jobId: string,
  alpha = 0.4,
  beta = 0.3,
  gamma = 0.3
) => {
  const job = await prisma.jobPost.findUnique({ where: { id: jobId } })
  if (!job) return

  const jobRepoCount = 5
  const jobSeniority = job.seniority || 1

  const contributors: Contributor[] = await prisma.contributor.findMany({
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

  // Process in batches of 100
  const batchSize = 100
  const batches: Promise<any>[] = []

  for (let i = 0; i < contributors.length; i += batchSize) {
    const batch = contributors.slice(i, i + batchSize).map((contributor) => {
      return processContributor({
        contributor,
        jobId,
        jobRepoCount,
        jobSeniority,
        alpha,
        beta,
        gamma,
      })
    })
    console.log(
      `Processing batch ${i / batchSize + 1} of ${Math.ceil(
        contributors.length / batchSize
      )}`
    )
    batches.push(Promise.all(batch))
  }

  await Promise.all(batches)

  await prisma.jobActionsLog.create({
    data: {
      jobPostId: jobId,
      action: "calculateJobScores",
      completed: true,
    },
  })
}

const processContributor = async ({
  contributor,
  jobId,
  jobRepoCount,
  jobSeniority,
  alpha,
  beta,
  gamma,
}: {
  contributor: Contributor
  jobId: string
  jobRepoCount: number
  jobSeniority: number
  alpha: number
  beta: number
  gamma: number
}) => {
  logger.log("Processing contributor", { contributorId: contributor.id })
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
}
