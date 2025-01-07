import prisma from "@/store/prisma"
import { logger, task } from "@trigger.dev/sdk/v3"
import {
  openSourcePackageVersion,
  openSourcePackage,
  githubRepo,
} from "@prisma/client"
import axios from "axios"
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

export const getGithubUrls = async (jobId: string) => {
  const packages = (await prisma.openSourcePackage.findMany({
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
      githubRepoId: null,
    },
  })) as Package[]
  if (packages.length === 0) return null
  const job = await prisma.jobPost.findUniqueOrThrow({
    where: { id: jobId },
  })
  logger.log("Getting github urls", { jobId, jobSource: job.source })
  switch (job?.source) {
    case "package.json":
      return getGithubFromNPM(packages)
    case "requirements.txt":
    case "pyproject.toml":
      return getGithubRepoFromPyPI(packages)
    case "Podfile.lock":
      return getGithubRepoFromPodfile(packages)
    case "Makefile":
      return getGithubRepoFromMaven(packages)
    case "pubspec.yaml":
      return getGithubRepoFromPubspec(packages)
    default:
      return null
  }
}

export const getGithubFromNPM = async (packages: Package[]) => {
  const results = await Promise.allSettled(
    packages.map(async (pkg) => {
      try {
        const response = await axios.get(
          `https://registry.npmjs.org/${pkg.name}`
        )
        const githubUrl = response.data.repository?.url
        if (githubUrl) {
          const normalizedUrl = normalizeGithubUrl(githubUrl)
          await createPackageandRepo(pkg, normalizedUrl)
        }
      } catch (error) {
        logger.warn(`Failed to fetch NPM data for ${pkg.name}`, { error })
      }
    })
  )
  return results.some((result) => result.status === "fulfilled")
}

export const getGithubRepoFromPyPI = async (packages: Package[]) => {
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
          await createPackageandRepo(pkg, normalizedUrl)
        }
      } catch (error) {
        logger.warn(`Failed to fetch PyPI data for ${pkg.name}`, { error })
      }
    })
  )
  return results.some((result) => result.status === "fulfilled")
}

export const getGithubRepoFromPodfile = async (packages: Package[]) => {
  const results = await Promise.allSettled(
    packages.map(async (pkg) => {
      try {
        const response = await axios.get(
          `https://trunk.cocoapods.org/api/v1/pods/${pkg.name}`
        )
        const data = response.data
        const repositoryUrl = data.source?.git
        if (repositoryUrl) {
          const normalizedUrl = normalizeGithubUrl(repositoryUrl)
          await createPackageandRepo(pkg, normalizedUrl)
        }
      } catch (error) {
        logger.warn(`Failed to fetch CocoaPods data for ${pkg.name}`, { error })
      }
    })
  )
  return results.some((result) => result.status === "fulfilled")
}

export const getGithubRepoFromMaven = async (packages: Package[]) => {
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
          await createPackageandRepo(pkg, normalizedUrl)
        }
      } catch (error) {
        logger.warn(`Failed to fetch Maven data for ${pkg.name}`, { error })
      }
    })
  )
  return results.some((result) => result.status === "fulfilled")
}

export const getGithubRepoFromPubspec = async (packages: Package[]) => {
  const results = await Promise.allSettled(
    packages.map(async (pkg) => {
      try {
        const response = await axios.get(`https://pub.dev/packages/${pkg.name}`)
        const data = response.data
        const repositoryUrl = data.repositoryUrl
        if (repositoryUrl) {
          const normalizedUrl = normalizeGithubUrl(repositoryUrl)
          await createPackageandRepo(pkg, normalizedUrl)
        }
      } catch (error) {
        logger.warn(`Failed to fetch Pub.dev data for ${pkg.name}`, { error })
      }
    })
  )
  return results.some((result) => result.status === "fulfilled")
}

export const createPackageandRepo = async (
  pkg: Package,
  normalizedUrl: string
) => {
  if (!normalizedUrl) return
  // First try to find an existing repo with this URL
  const existingRepo = await prisma.githubRepo.findUnique({
    where: { gitUrl: normalizedUrl },
  })

  if (existingRepo) {
    // If repo exists, just connect the package to it
    await prisma.openSourcePackage.update({
      where: { id: pkg.id },
      data: {
        githubRepoId: existingRepo.id,
      },
    })
  } else {
    // If no repo exists, create new one and connect the package
    await prisma.githubRepo.create({
      data: {
        name: pkg.name,
        gitUrl: normalizedUrl,
        openSourcePackage: {
          connect: { id: pkg.id },
        },
      },
    })
  }
}
