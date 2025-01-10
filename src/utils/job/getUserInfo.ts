import prisma from "@/store/prisma"
import { logger, tasks } from "@trigger.dev/sdk/v3"
import {
  openSourcePackageVersion,
  openSourcePackage,
  githubRepo,
} from "@prisma/client"
import { getGithubUser, checkRateLimit } from "@/utils/github/repo"
import { GET_USER_INFO } from "@/trigger/constants"
export const getUserInfo = async (jobId: string) => {
  const job = await prisma.jobPost.findUniqueOrThrow({
    where: { id: jobId },
    include: {
      organization: {
        include: {
          users: true,
        },
      },
    },
  })

  const githubInstallationId = job.organization?.users.find(
    (user) => user.githubInstallationId
  )?.githubInstallationId

  if (!githubInstallationId) {
    return null
  }

  const contributors = await prisma.contributor.findMany({
    where: {
      fetchedAt: null,
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
  })

  console.log(contributors.length)

  if (contributors.length === 0) {
    return null
  }

  const rateLimit = await checkRateLimit({
    installationId: githubInstallationId,
  })

  console.log(rateLimit)

  if (rateLimit.remaining < 10) {
    tasks.trigger(GET_USER_INFO, { jobId })
    return null
  }

  // Calculate how many API calls we can make based on remaining rate limit
  const SAFETY_BUFFER = 5 // Keep some rate limit for other operations
  const availableToRun = Math.min(
    rateLimit.remaining - SAFETY_BUFFER,
    contributors.length
  )

  // Don't process if we don't have enough rate limit remaining
  if (availableToRun <= 0) {
    const waitMs = rateLimit.reset.getTime() - Date.now()
    const waitMinutes = Math.ceil(waitMs / (1000 * 60))
    tasks.trigger(GET_USER_INFO, { jobId }, { delay: `${waitMinutes} minutes` })
    return null
  }

  const slicedContributors = contributors.slice(0, availableToRun)

  for (const contributor of slicedContributors) {
    if (!contributor.name) {
      continue
    }
    const results = await getGithubUser({
      username: contributor.name,
      installationId: githubInstallationId,
    })

    console.log(results)
    if (!results.data) {
      await prisma.contributor.update({
        where: { id: contributor.id },
        data: {
          fetchedAt: new Date(),
        },
      })
      continue
    }
    console.log(results.data)
    const user = results.data
    await prisma.contributor.update({
      where: { id: contributor.id },
      data: {
        bio: user.bio,
        locationRaw: user.location,
        company: user?.company?.replace("@", ""),
        email: user.email,
        followers: user.followers,
        following: user.following,
        hireable: user.hireable,
        publicRepos: user.public_repos,
        publicGists: user.public_gists,
        twitter: user.twitter_username,
        blog: user.blog,
        fetchedAt: new Date(),
      },
    })
  }

  if (slicedContributors.length < contributors.length) {
    const waitMs = rateLimit.reset.getTime() - Date.now()
    const waitMinutes = Math.ceil(waitMs / (1000 * 60))
    logger.info(`Waiting for ${waitMinutes} minutes`)
    tasks.trigger(GET_USER_INFO, { jobId }, { delay: `${waitMinutes} minutes` })
  }
}

getUserInfo("cm5n1dltq0004rzb8yuhdelnw")
