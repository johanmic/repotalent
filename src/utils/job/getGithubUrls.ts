import prisma from "@/store/prisma"
import {
  githubRepo,
  openSourcePackage,
  openSourcePackageVersion,
} from "@prisma/client"
import { logger, tasks } from "@trigger.dev/sdk/v3"
import axios from "axios"
import semver from "semver"
import { GET_REPO_INFO } from "@/trigger/constants"
export type Package = openSourcePackage & {
  versions: openSourcePackageVersion[]
  githubRepo: githubRepo
}

export const normalizeGithubUrl = (url: string): string => {
  // Return empty string if no URL provided
  if (!url) return ""

  // Remove git+ prefix if present
  url = url.replace(/^git\+/, "")

  // Remove protocol prefixes
  url = url.replace(/^(https?:\/\/|git:\/\/|ssh:\/\/git@)/, "")

  // Remove www. if present
  url = url.replace(/^www\./, "")

  // Handle SSH format (git@github.com:org/repo.git)
  url = url.replace(/^git@github\.com:/, "github.com/")

  // Ensure URL starts with github.com
  if (!url.startsWith("github.com")) {
    url = `github.com/${url}`
  }

  // Ensure .git suffix
  if (!url.endsWith(".git")) {
    url = `${url}.git`
  }

  // Remove any trailing slashes before .git
  url = url.replace(/\/+\.git$/, ".git")

  return url
}

export const getInfoFromUrl = async (
  url: string
): Promise<{
  owner: string
  repo: string
}> => {
  // Handle scoped package format (e.g. '@tsparticles/react')
  if (url.startsWith("@")) {
    const [scope, repo] = url.slice(1).split("/")
    return { owner: scope, repo }
  }

  // Handle regular GitHub URLs
  const results = url.replace(/git\+/gim, "").split("/")
  const owner = results[results.length - 2]
  const repo = results[results.length - 1].replace(/\.git$/, "")
  return { owner, repo }
}

export const getGithubUrls = async ({
  jobId,
  pkgId,
}: {
  jobId: string
  pkgId: string
}) => {
  const results = (await prisma.openSourcePackage.findUniqueOrThrow({
    where: {
      id: pkgId,
    },
    include: {
      versions: true,
      githubRepo: true,
    },
  })) as Package

  const packages = [results]
  if (packages.length === 0) return null
  const job = await prisma.jobPost.findUniqueOrThrow({
    where: { id: jobId },
  })
  const found = packages.length
  logger.log("Getting github urls", { jobId, jobSource: job.source })
  switch (job?.source) {
    case "package.json":
      await getGithubFromNPM(packages, jobId)
    case "requirements.txt":
    case "pyproject.toml":
      await getGithubRepoFromPyPI(packages, jobId)
      break
    case "Podfile.lock":
      await getGithubRepoFromPodfile(packages, jobId)
      break
    case "Makefile":
      await getGithubRepoFromMaven(packages, jobId)
      break
    case "pubspec.yaml":
      await getGithubRepoFromPubspec(packages, jobId)
      break
    default:
      logger.warn(`Unknown job source: ${job.source}`)
      return null
  }
  await prisma.jobActionsLog.create({
    data: {
      jobPostId: jobId,
      action: "getGithubUrls",
      completed: true,
      found,
    },
  })
}

export const getGithubFromNPM = async (packages: Package[], jobId: string) => {
  const results = await Promise.allSettled(
    packages.map(async (pkg) => {
      try {
        const response = await axios.get(
          `https://registry.npmjs.org/${pkg.name}`
        )
        const githubUrl = response.data.repository?.url
        if (githubUrl) {
          const normalizedUrl = normalizeGithubUrl(githubUrl)
          await createPackageandRepo({ pkg, jobId, normalizedUrl })
        }
      } catch (error) {
        logger.warn(`Failed to fetch NPM data for ${pkg.name}`, { error })
      }
    })
  )
  return results.some((result) => result.status === "fulfilled")
}

export const getGithubRepoFromPyPI = async (
  packages: Package[],
  jobId: string
) => {
  const results = await Promise.allSettled(
    packages.map(async (pkg) => {
      try {
        const response = await axios.get(
          `https://pypi.org/pypi/${pkg.name}/json`
        )
        const data = response.data
        const repositoryUrl =
          data.info?.project_urls?.Repository || data.info?.home_page

        if (repositoryUrl) {
          const normalizedUrl = normalizeGithubUrl(repositoryUrl)
          await createPackageandRepo({ pkg, jobId, normalizedUrl })
        }
      } catch (error) {
        logger.warn(`Failed to fetch PyPI data for ${pkg.name}`, { error })
      }
    })
  )
  return results.some((result) => result.status === "fulfilled")
}

export const getGithubRepoFromPodfile = async (
  packages: Package[],
  jobId: string
) => {
  const results = await Promise.allSettled(
    packages.map(async (pkg) => {
      try {
        const response = await axios.get(
          `https://trunk.cocoapods.org/api/v1/pods/${pkg.name}`
        )
        const data = response.data
        const versions = data.versions.map(
          (v: { name: string }) => v.name
        ) as string[]
        const highestVersion = semver.maxSatisfying(versions, "*")

        if (!highestVersion) {
          logger.warn(`No valid version found for ${pkg.name}`)
          return
        }

        // const repositoryUrl = data.source?.git
        const podSpecFile = await getPodspecFile(
          pkg.name,
          highestVersion || versions[0]
        )
        const url = podSpecFile.source.git

        if (url) {
          const normalizedUrl = normalizeGithubUrl(url)
          await createPackageandRepo({ pkg, jobId, normalizedUrl })
        }
      } catch (error) {
        logger.warn(`Failed to fetch CocoaPods data for ${pkg.name}`, { error })
      }
    })
  )
  return results.some((result) => result.status === "fulfilled")
}

export const getGithubRepoFromMaven = async (
  packages: Package[],
  jobId: string
) => {
  const results = await Promise.allSettled(
    packages.map(async (pkg) => {
      try {
        const [groupId, artifactId] = pkg.name.split(":")
        if (!groupId || !artifactId) {
          logger.warn(`Invalid Maven package name format: ${pkg.name}`)
          return
        }

        const searchUrl = `https://search.maven.org/solrsearch/select?q=g:"${groupId}" AND a:"${artifactId}"&rows=1&wt=json`
        const response = await axios.get(searchUrl)
        const repoUrl = response.data.response.docs[0]?.repositoryUrl

        if (repoUrl?.includes("github.com")) {
          const normalizedUrl = normalizeGithubUrl(repoUrl)
          await createPackageandRepo({ pkg, jobId, normalizedUrl })
        }
      } catch (error) {
        logger.warn(`Failed to fetch Maven data for ${pkg.name}`, { error })
      }
    })
  )
  return results.some((result) => result.status === "fulfilled")
}

const getPodspecFile = async (podName: string, version: string) => {
  const url = `https://trunk.cocoapods.org/api/v1/pods/${podName}/specs/${version}`
  try {
    const response = await axios.get(url)

    return response.data
  } catch (error) {
    console.error(`Error fetching podspec for ${podName}@${version}:`, error)
    throw error
  }
}

export const getGithubRepoFromPubspec = async (
  packages: Package[],
  jobId: string
) => {
  const results = await Promise.allSettled(
    packages.map(async (pkg) => {
      try {
        const response = await axios.get(`https://pub.dev/packages/${pkg.name}`)
        const data = response.data
        const repositoryUrl = data?.repositoryUrl as string | undefined
        if (repositoryUrl) {
          await createPackageandRepo({
            pkg,
            jobId,
            normalizedUrl: repositoryUrl,
          })
        }
      } catch (error) {
        logger.warn(`Failed to fetch Pub.dev data for ${pkg.name}`, { error })
      }
    })
  )
  return results.some((result) => result.status === "fulfilled")
}

export const createPackageandRepo = async ({
  pkg,
  jobId,
  normalizedUrl,
}: {
  pkg: Package
  jobId: string
  normalizedUrl: string
}) => {
  if (!normalizedUrl) return
  let createRepo = true
  // First try to find an existing repo with this URL
  const existingRepo = await prisma.githubRepo.findUnique({
    where: { gitUrl: normalizedUrl },
  })

  if (existingRepo) {
    // If repo exists, just connect the package to it
    const results = await prisma.openSourcePackage.update({
      where: { id: pkg.id },
      data: {
        githubRepoId: existingRepo.id,
      },
      include: {
        githubRepo: true,
      },
    })
    if (results.githubRepo && results.githubRepo.description) {
      createRepo = false
    }
  }
  if (createRepo) {
    // If no repo exists, create new one and connect the package
    const githubRepo = await prisma.githubRepo.create({
      data: {
        name: pkg.name,
        gitUrl: normalizedUrl,
        openSourcePackage: {
          connect: { id: pkg.id },
        },
      },
    })
    await tasks.trigger(GET_REPO_INFO, { jobId, githubRepoId: githubRepo.id })
  }
}
