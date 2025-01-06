import prisma from "@/store/prisma"
import { logger, task } from "@trigger.dev/sdk/v3"
import { openSourcePackageVersion, openSourcePackage } from "@prisma/client"
import axios from "axios"
export type Package = openSourcePackage & {
  versions: openSourcePackageVersion[]
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
      gitUrl: {
        equals: null,
      },
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
          await prisma.openSourcePackage.update({
            where: { id: pkg.id },
            data: { gitUrl: githubUrl },
          })
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
          await prisma.openSourcePackage.update({
            where: { id: pkg.id },
            data: { gitUrl: repositoryUrl },
          })
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
          await prisma.openSourcePackage.update({
            where: { id: pkg.id },
            data: { gitUrl: repositoryUrl },
          })
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
          await prisma.openSourcePackage.update({
            where: { id: pkg.id },
            data: { gitUrl: repoUrl.replace(/\.git$/g, "").trim() },
          })
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
          await prisma.openSourcePackage.update({
            where: { id: pkg.id },
            data: { gitUrl: repositoryUrl },
          })
        }
      } catch (error) {
        logger.warn(`Failed to fetch Pub.dev data for ${pkg.name}`, { error })
      }
    })
  )
  return results.some((result) => result.status === "fulfilled")
}
