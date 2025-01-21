import prisma from "@/store/prisma"
import { parseRequirementsTxt } from "@/utils/parseRequirementsTXT"
import { parsePodfileLock } from "@/utils/podfileLockParser"
import { parsePyprojectToml } from "@/utils/pyprojectTomlParser"
import { logger } from "@trigger.dev/sdk/v3"

const addPackages = async ({
  jobId,
  dependencies,
}: {
  jobId: string
  dependencies: { name: string; version: string }[]
}) => {
  try {
    // Process dependencies sequentially to avoid race conditions
    for (const { name, version } of dependencies) {
      const pkg = await prisma.openSourcePackage.upsert({
        where: { name },
        create: { name },
        update: {},
        select: { id: true },
      })

      const pkgVersion = await prisma.openSourcePackageVersion.upsert({
        where: {
          packageId_version: {
            packageId: pkg.id,
            version,
          },
        },
        create: {
          version,
          packageId: pkg.id,
          createdAt: new Date(),
        },
        update: {},
        select: { id: true },
      })

      await prisma.jobPostToPackageVersion.create({
        data: {
          jobPostId: jobId,
          packageVersionId: pkgVersion.id,
        },
      })
    }
  } catch (e) {
    logger.error("Error adding packages", { jobId, error: e })
  }
}

export const updateJobDepsAsync = async (jobId: string) => {
  try {
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
    logger.log("Updating job deps", { jobId: job.id, source: job.source })
    if (!job.data) return { shouldContinue: false }

    if (job.source === "package.json") {
      const packagesJson = JSON.parse(job.data)
      const dependencies = Object.entries({
        ...packagesJson.dependencies,
        ...packagesJson.devDependencies,
      }).map(([name, version]) => ({ name, version: version as string }))
      logger.log("Adding packages", {
        jobId: job.id,
        dependencies: dependencies.length,
      })
      await addPackages({
        jobId: job.id,
        dependencies,
      })
    } else if (job.source === "requirements.txt") {
      const dependencies = Object.entries(parseRequirementsTxt(job.data)).map(
        ([name, version]) => ({ name, version: version as string })
      )
      await addPackages({
        jobId: job.id,
        dependencies,
      })
    } else if (job.source === "Podfile.lock") {
      const dependencies = Object.entries(parsePodfileLock(job.data)).map(
        ([name, version]) => ({
          name,
          version,
        })
      )

      await addPackages({
        jobId: job.id,
        dependencies,
      })
    } else if (job.source === "pyproject.toml") {
      const dependencies = Object.entries(parsePyprojectToml(job.data)).map(
        ([name, version]) => ({
          name,
          version,
        })
      )

      await addPackages({
        jobId: job.id,
        dependencies,
      })
    }
    await prisma.jobActionsLog.create({
      data: {
        jobPostId: job.id,
        action: "updateJobDeps",
        completed: true,
      },
    })
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const dbUser = await prisma.user.findFirst({
      where: {
        id: job?.organization?.users[0]?.id,
        OR: [
          {
            purchase: {
              some: {
                leadsEnabled: true,
                createdAt: { gt: oneMonthAgo },
              },
            },
          },
          {
            promoCodeUsage: {
              some: {
                createdAt: { gt: oneMonthAgo },
                promoCode: { leadsEnabled: true },
              },
            },
          },
        ],
      },
    })

    return {
      shouldContinue: Boolean(dbUser),
    }
  } catch (e) {
    logger.error("Error updating job deps", { jobId, error: e })
    return {
      shouldContinue: false,
    }
  }
}
