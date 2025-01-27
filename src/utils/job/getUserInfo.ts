import prisma from "@/store/prisma"
import { GET_USER_INFO, CALC_SCORES } from "@/trigger/constants"
import { checkRateLimit, getGithubUser } from "@/utils/github/repo"
import { logger, wait, tasks } from "@trigger.dev/sdk/v3"
import { getInstallationId } from "./getRepoInfo"
import { contributor } from "@prisma/client"

export const getUserInfoHandler = async ({
  jobId,
  contributorId,
}: {
  jobId: string
  contributorId: string
}) => {
  const githubInstallationId = await getInstallationId(jobId)
  if (!githubInstallationId) {
    return null
  }
  const rateLimit = await checkRateLimit({
    installationId: githubInstallationId,
  })

  if (rateLimit.remaining < 10) {
    wait.until({ date: rateLimit.reset })
    tasks.trigger(GET_USER_INFO, { jobId, contributorId })
    return null
  }
  const contributor = await prisma.contributor.findUniqueOrThrow({
    where: { id: contributorId },
  })
  await getUserInfo({
    jobId,
    contributor,
    githubInstallationId,
  })
}

const getUserInfo = async ({
  jobId,
  contributor,
  githubInstallationId,
}: {
  jobId: string
  contributor: contributor
  githubInstallationId: number
}) => {
  if (!contributor.name) {
    return
  }
  const results = await getGithubUser({
    username: contributor.name,
    installationId: githubInstallationId,
  })

  if (!results.data) {
    await prisma.contributor.update({
      where: { id: contributor.id },
      data: {
        fetchedAt: new Date(),
      },
    })
  }

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
  await tasks.trigger(CALC_SCORES, { jobId, contributorId: contributor.id })
}

export const getUserInfoCronHandler = async (jobId: string) => {
  const githubInstallationId = await getInstallationId(jobId)
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

  if (contributors.length === 0) {
    return null
  }

  const rateLimit = await checkRateLimit({
    installationId: githubInstallationId,
  })

  if (rateLimit.remaining < 10) {
    await tasks.trigger(GET_USER_INFO, { jobId })
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
    await tasks.trigger(
      GET_USER_INFO,
      { jobId },
      { delay: `${waitMinutes} minutes` }
    )
    return null
  }

  const slicedContributors = contributors.slice(0, availableToRun)

  for (const contributor of slicedContributors) {
    if (!contributor.name) {
      continue
    }
  }

  if (slicedContributors.length < contributors.length) {
    const waitMs = rateLimit.reset.getTime() - Date.now()
    const waitMinutes = Math.ceil(waitMs / (1000 * 60))
    logger.info(`Waiting for ${waitMinutes} minutes`)
    await tasks.trigger(
      GET_USER_INFO,
      { jobId },
      { delay: `${waitMinutes} minutes` }
    )
  }
  await prisma.jobActionsLog.create({
    data: {
      jobPostId: jobId,
      action: "getUserInfo",
      completed: true,
    },
  })
}
