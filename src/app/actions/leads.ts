"use server"
import prisma from "@/store/prisma"
import {
  contributor,
  openSourcePackage,
  contribution,
  githubRepo,
} from "@prisma/client"
import { getUser } from "@/utils/supabase/server"

export type Contribution = contribution & {
  githubRepo: githubRepo
}
export type Contributor = contributor & {
  contributions: Contribution[]
}

export const getLeadsForJob = async ({
  jobId,
  limit = 100,
  offset = 0,
}: {
  jobId: string
  limit?: number
  offset?: number
}) => {
  const { user } = await getUser()
  if (!user?.id) {
    throw new Error("User not authenticated")
  }
  const contributors = await prisma.contributor.findMany({
    where: {
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
    },
    include: {
      contributions: {
        distinct: ["githubRepoId"],
        include: {
          githubRepo: true,
        },
      },
    },
    // take: limit,
    skip: offset,
  })

  return contributors
}
