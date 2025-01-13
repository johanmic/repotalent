import prisma from "@/store/prisma"
import { getRepo, getRepoContributors } from "@/utils/github/repo"
import { getInfoFromUrl, normalizeGithubUrl } from "@/utils/job/getGithubUrls"
import type { RestEndpointMethodTypes } from "@octokit/rest"

export const getJobRepoInfo = async (jobId: string) => {
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

  console.log("pkgs", packages.length)

  // Process packages sequentially instead of in parallel chunks
  for (const pkg of packages) {
    console.log("pkg", pkg)
    if (!pkg.githubRepo?.gitUrl || !pkg.githubRepoId) {
      continue
    }

    try {
      const normalizedUrl = normalizeGithubUrl(pkg.githubRepo.gitUrl)
      const { owner, repo } = await getInfoFromUrl(normalizedUrl)
      console.log(owner, repo)

      const repoData = await getRepo({
        owner,
        repo,
        githubInstallationId,
      })

      if (!repoData) {
        continue
      }

      await updateRepoInfo({ id: pkg.githubRepoId, repoData })
      console.log("updated")

      const contributors = await getRepoContributors({
        owner,
        repo,
        githubInstallationId,
      })
      console.log("contributors", contributors)

      await createContributors(pkg.githubRepoId, contributors)
    } catch (error) {
      console.error(
        `Failed to process package ${pkg.githubRepo.gitUrl}:`,
        error
      )
      continue
    }
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

const createContributors = async (
  id: string,
  contributors: RestEndpointMethodTypes["repos"]["listContributors"]["response"]
) => {
  // Process one chunk at a time instead of parallel processing
  // const chunks = splitEvery(30, contributors.data)
  // for (const chunk of chunks) {
  // Process contributors sequentially to avoid race conditions
  for (const contributor of contributors.data) {
    if (!contributor.id || contributor.login?.includes("bot")) {
      continue
    }

    try {
      await prisma.contributor.upsert({
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
    } catch (error) {
      console.error(`Failed to upsert contributor ${contributor.login}:`, error)
    }
  }
  // }
}
