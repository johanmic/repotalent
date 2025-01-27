import prisma from "@/store/prisma"
import { getRepo, getRepoContributors } from "@/utils/github/repo"
import { getInfoFromUrl, normalizeGithubUrl } from "@/utils/job/getGithubUrls"
import type { RestEndpointMethodTypes } from "@octokit/rest"
import type { githubRepo } from "@prisma/client"
import { logger, tasks } from "@trigger.dev/sdk/v3"
import { GET_USER_INFO } from "@/trigger/constants"

export const getInstallationId = async (
  jobId: string
): Promise<number | null> => {
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
    logger.error("No github installation id found for job", { jobId })
    return null
  }
  return githubInstallationId
}

export const getRepoInfoHandler = async ({
  githubRepoId,
  jobId,
}: {
  githubRepoId: string
  jobId: string
}) => {
  const githubRepo = await prisma.githubRepo.findUniqueOrThrow({
    where: { id: githubRepoId },
    include: {
      openSourcePackage: true,
    },
  })
  const githubInstallationId = await getInstallationId(jobId)
  if (!githubInstallationId) {
    return
  }
  await getRepoInfo({
    githubRepo,
    githubInstallationId,
    jobId,
  })
}

const getRepoInfo = async ({
  githubRepo,
  githubInstallationId,
  jobId,
}: {
  githubRepo: githubRepo
  githubInstallationId: number
  jobId: string
}) => {
  try {
    if (!githubRepo.gitUrl) {
      return
    }
    const normalizedUrl = normalizeGithubUrl(githubRepo.gitUrl)
    const { owner, repo } = await getInfoFromUrl(normalizedUrl)

    const repoData = await getRepo({
      owner,
      repo,
      githubInstallationId,
    })

    if (!repoData) {
      return
    }

    await updateRepoInfo({ id: githubRepo.id, repoData })

    const contributors = await getRepoContributors({
      owner,
      repo,
      githubInstallationId,
    })

    await createContributors({
      id: githubRepo.id,
      jobId,
      contributors,
    })
  } catch (error) {
    console.error(`Failed to process package ${githubRepo.gitUrl}:`, error)
  }
}

export const getJobRepoInfoCronHandler = async (jobId: string) => {
  const githubInstallationId = await getInstallationId(jobId)
  if (!githubInstallationId) {
    return
  }
  const packages = await prisma.openSourcePackage.findMany({
    where: {
      versions: {
        some: {
          jobPosts: {
            some: {
              jobPostId: jobId,
            },
          },
        },
      },
      githubRepoId: {
        not: null,
      },
    },
    include: {
      githubRepo: true,
    },
  })

  // Process packages sequentially instead of in parallel chunks
  for (const pkg of packages) {
    if (!pkg.githubRepo?.gitUrl || !pkg.githubRepoId) {
      continue
    }
    await getRepoInfo({
      githubRepo: pkg.githubRepo,
      githubInstallationId,
      jobId,
    })
  }
  await prisma.jobActionsLog.create({
    data: {
      jobPostId: jobId,
      action: "getRepoInfo",
      completed: true,
    },
  })
}

const updateRepoInfo = async ({
  id,
  repoData,
}: {
  id: string
  repoData: RestEndpointMethodTypes["repos"]["get"]["response"]
}) => {
  const data = repoData.data
  await prisma.githubRepo.upsert({
    where: {
      id,
    },
    create: {
      id,
      name: data.name,
      description: data.description,
      logo: data.owner.avatar_url,
      website: data.homepage,
      gitUrl: data.html_url,
      repoUpdatedAt: new Date(data.updated_at),
      repoCreatedAt: new Date(data.created_at),
      archived: data.archived,
      language: data.language,
      stars: data.stargazers_count,
      watchers: data.watchers_count,
      forks: data.forks_count,
      tags: {
        connectOrCreate: data?.topics?.map((topic) => ({
          where: { id: topic },
          create: { id: topic, tag: topic },
        })),
      },
    },
    update: {
      description: data.description,
      logo: data.owner.avatar_url,
      website: data.homepage,
      // gitUrl: data.html_url,
      repoUpdatedAt: new Date(data.updated_at),
      repoCreatedAt: new Date(data.created_at),
      archived: data.archived,
      language: data.language,
      stars: data.stargazers_count,
      watchers: data.watchers_count,
      forks: data.forks_count,
      tags: {
        connectOrCreate: data?.topics?.map((topic) => ({
          where: { id: topic },
          create: { id: topic, tag: topic },
        })),
      },
    },
  })
}

const createContributors = async ({
  id,
  contributors,
  jobId,
}: {
  id: string
  jobId: string
  contributors: RestEndpointMethodTypes["repos"]["listContributors"]["response"]
}) => {
  for (const contributor of contributors.data) {
    if (!contributor.id || contributor.login?.includes("bot")) {
      continue
    }

    try {
      const results = await prisma.contributor.upsert({
        where: {
          githubId: contributor.id,
        },
        create: {
          githubId: contributor.id,
          avatar: contributor.avatar_url,
          name: contributor.login,
          contributions: {
            create: {
              contributions: contributor.contributions, // Fix: use individual contributor's contributions
              githubRepoId: id,
            },
          },
        },
        update: {
          avatar: contributor.avatar_url,
          name: contributor.login,
          contributions: {
            create: {
              contributions: contributor.contributions, // Fix: use individual contributor's contributions
              githubRepoId: id,
            },
          },
        },
      })
      if (!results.fetchedAt) {
        logger.log("Triggering GET_USER_INFO", {
          jobId,
          contributorId: results.id,
        })
        await tasks.trigger(GET_USER_INFO, { jobId, contributorId: results.id })
      }
    } catch (error) {
      console.error(`Failed to upsert contributor ${contributor.login}:`, error)
    }
  }
  // }
}
