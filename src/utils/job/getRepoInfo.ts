import prisma from "@/store/prisma"
import { getRepo, getRepoContributors } from "@/utils/github/repo"
import type { Package } from "@/utils/job/getGithubUrls"
import { splitEvery } from "ramda"
import { normalizeGithubUrl, getInfoFromUrl } from "@/utils/job/getGithubUrls"
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

  const chonk = splitEvery(1, packages)
  const chunks = [chonk[16]]
  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(async (pkg) => {
        console.log("pkg", pkg)
        if (!pkg.githubRepo?.gitUrl || !pkg.githubRepoId) {
          return
        }
        const normalizedUrl = normalizeGithubUrl(pkg.githubRepo.gitUrl)
        const { owner, repo } = await getInfoFromUrl(normalizedUrl)
        console.log(owner, repo)
        const repoData = await getRepo({
          owner,
          repo,
          githubInstallationId,
        })
        if (!repoData) {
          return
        }
        await updateRepoInfo({ id: pkg.githubRepoId, repoData })
        console.log("updated")
        const contributors = await getRepoContributors({
          owner,
          repo,
          githubInstallationId,
        })
        console.log("contributors", contributors)
      })
    )
  }
}
const updateRepoInfo = async ({
  id,
  repoData,
}: {
  id: string
  repoData: RestEndpointMethodTypes["repos"]["get"]["response"]
}) => {
  const data = repoData.data
  // Update the package with repo information

  await prisma.githubRepo.update({
    where: { id },
    data: {
      description: data.description,
      logo: data.owner.avatar_url,
      website: data.homepage,
      gitUrl: data.html_url,
      repoUpdatedAt: new Date(data.updated_at),
      archived: data.archived,
      language: data.language,
      stars: data.stargazers_count,
      watchers: data.watchers_count,
      forks: data.forks_count,
      // Create or connect tags
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
  await prisma.contributor.createMany({
    data: contributors.data
      .filter((contributor) => contributor.id && contributor.login)
      .map((contributor) => ({
        githubUserId: contributor.id!,
        githubRepoId: id,
        userId: contributor.login!,
        repoId: id,
      })),
  })
}

getJobRepoInfo("cm5mls2km003wrzp0fhgkma0t")
