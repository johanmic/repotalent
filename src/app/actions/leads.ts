"use server"
import prisma from "@/store/prisma"
import { getUser } from "@/utils/supabase/server"
import {
  contribution,
  contributor,
  githubRepo,
  jobPostContributorBookmark,
} from "@prisma/client"
import { revalidatePath } from "next/cache"
import posthog from "@/utils/posthog-node"

export type Contribution = contribution & {
  githubRepo: githubRepo
}
export type Contributor = contributor & {
  contributions: Contribution[]
  jobPostContributorBookmark?: jobPostContributorBookmark | null
}

export type ContributorStats = {
  total: number
  hireable: number
  emails: number
  maxFollowers: number
  faang: number
  top100: number // over 100 followers
  top2: number //over 3000 followers
}

export type FilterOptions = {
  starred: boolean | null
  hireable: boolean | null
  minFollowers: number | null
  maxFollowers: number | null
  minContributions: number | null
  maxContributions: number | null
  minRating: number | null
  maxRating: number | null
  location: string | null
  languages: string[] | null
  repoIds: string[] | null
}

export const getLeadsForJob = async ({
  jobId,
  limit = 100,
  offset = 0,
  options,
}: {
  jobId: string
  limit?: number
  offset?: number
  options?: FilterOptions
}): Promise<{ contributors: Contributor[]; stats: ContributorStats }> => {
  const { user } = await getUser()
  if (!user?.id) {
    throw new Error("User not authenticated")
  }

  const baseWhere = {
    fetchedAt: {
      not: null,
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
  }

  // Add optional filters
  const where: any = { ...baseWhere }

  // Handle hireable filter to include null values when false
  if (options?.hireable === true) {
    where.hireable = true
  }

  if (options?.minFollowers || options?.maxFollowers) {
    where.followers = {
      ...(options.minFollowers && { gte: options.minFollowers }),
      ...(options.maxFollowers && { lte: options.maxFollowers }),
    }
  }

  if (options?.starred) {
    where.jobPostContributorBookmark = {
      some: {
        starred: true,
        jobPostId: jobId,
      },
    }
  }

  if (options?.location) {
    where.locationRaw = { contains: options.location, mode: "insensitive" }
  }

  if (options?.languages?.length) {
    where.contributions = {
      some: {
        githubRepo: {
          language: { in: options.languages },
        },
      },
    }
  }

  if (options?.repoIds?.length) {
    where.contributions = {
      some: {
        githubRepo: {
          id: { in: options.repoIds },
        },
      },
    }
  }

  const contributors = await prisma.contributor.findMany({
    where,
    include: {
      contributions: {
        distinct: ["githubRepoId"],
        include: {
          githubRepo: true,
        },
      },
      jobPostContributorBookmark: {
        where: {
          jobPostId: jobId,
        },
        take: 1,
      },
    },
    take: limit,
    skip: offset,
  })

  const [contribs, stats] = await Promise.all([
    contributors.map((c) => ({
      ...c,
      jobPostContributorBookmark: c.jobPostContributorBookmark[0] || null,
    })),
    getContributorStats(jobId),
  ])

  return {
    contributors: contribs,
    stats,
  }
}

export const getContributorStats = async (
  jobId: string
): Promise<ContributorStats> => {
  const baseWhere = {
    fetchedAt: { not: null },
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
  }

  const total = await prisma.contributor.count({
    where: baseWhere,
  })

  const matched = await prisma.contributor.count({
    where: {
      ...baseWhere,
      hireable: true,
    },
  })

  // Update ContributorStats type to include more granular stats
  interface FollowerStats {
    top1: number // >= 10000 followers
    top2: number // >= 3000 followers
    top5: number // >= 1000 followers
    top10: number // >= 500 followers
    top15: number // >= 300 followers
    top20: number // >= 150 followers
    top25: number // >= 80 followers
    top30: number // >= 30 followers
  }

  // Get follower counts for different thresholds
  const followerCounts = await Promise.all([
    prisma.contributor.count({
      where: {
        ...baseWhere,
        followers: { gte: 10000 },
      },
    }),
    prisma.contributor.count({
      where: {
        ...baseWhere,
        followers: { gte: 3000 },
      },
    }),
    prisma.contributor.count({
      where: {
        ...baseWhere,
        followers: { gte: 1000 },
      },
    }),
  ])

  // FAANG contributors
  const faang = await prisma.contributor.count({
    where: {
      ...baseWhere,
      OR: ["Google", "Facebook", "Apple", "Amazon", "Netflix"].map(
        (company) => ({
          company: {
            contains: company,
            mode: "insensitive",
          },
        })
      ),
    },
  })
  const emails = await prisma.contributor.count({
    where: {
      ...baseWhere,
      email: { not: null },
    },
  })
  const hireable = await prisma.contributor.count({
    where: {
      ...baseWhere,
      hireable: true,
    },
  })
  const maxFollowers = await prisma.contributor.findFirst({
    where: {
      ...baseWhere,
    },
    orderBy: {
      followers: "desc",
    },
    take: 1,
  })

  return {
    total,
    hireable,
    maxFollowers: maxFollowers?.followers || 10000,
    emails,
    faang,
    top100: followerCounts[1], // Using top2 (3000+ followers) as top100
    top2: followerCounts[0], // Using top1 (10000+ followers) as top2
  }
}

export const starContributor = async ({
  contributorId,
  jobId,
}: {
  contributorId: string
  jobId: string
}) => {
  const { user } = await getUser()
  if (!user?.id) {
    throw new Error("User not authenticated")
  }
  const results = await prisma.jobPostContributorBookmark.upsert({
    where: {
      jobPostId_contributorId: {
        jobPostId: jobId,
        contributorId: contributorId,
      },
    },
    update: {
      createdAt: new Date(),
      starred: true,
    },
    create: {
      contributorId: contributorId,
      jobPostId: jobId,
      starred: true,
    },
  })

  posthog.capture({
    distinctId: user.id,
    event: "contributor starred",
    properties: {
      contributorId,
      jobId,
    },
  })

  return results
}

export const unstarContributor = async ({
  contributorId,
  jobId,
}: {
  contributorId: string
  jobId: string
}) => {
  const { user } = await getUser()
  if (!user?.id) {
    throw new Error("User not authenticated")
  }

  const results = await prisma.jobPostContributorBookmark.update({
    where: {
      jobPostId_contributorId: {
        jobPostId: jobId,
        contributorId: contributorId,
      },
    },
    data: {
      starred: null,
    },
  })

  posthog.capture({
    distinctId: user.id,
    event: "contributor unstarred",
    properties: {
      contributorId,
      jobId,
    },
  })

  revalidatePath(`/home/leads/${jobId}`)
  return results
}

export const commentOnContributor = async ({
  contributorId,
  jobId,
  comment,
}: {
  contributorId: string
  jobId: string
  comment: string
}) => {
  const { user } = await getUser()
  if (!user?.id) {
    throw new Error("User not authenticated")
  }

  const results = await prisma.jobPostContributorBookmark.update({
    where: {
      jobPostId_contributorId: {
        jobPostId: jobId,
        contributorId: contributorId,
      },
    },
    data: {
      comment: comment,
    },
  })

  posthog.capture({
    distinctId: user.id,
    event: "contributor commented",
    properties: {
      contributorId,
      jobId,
      commentLength: comment.length,
    },
  })

  revalidatePath(`/home/leads/${jobId}`)
  return results
}
