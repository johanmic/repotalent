import prisma from "@/store/prisma"
import { parseRequirementsTxt } from "@/utils/parseRequirementsTXT"
import { parsePodfileLock } from "@/utils/podfileLockParser"
import { parsePyprojectToml } from "@/utils/pyprojectTomlParser"

const addPackages = async ({
  jobId,
  dependencies,
}: {
  jobId: string
  dependencies: { name: string; version: string }[]
}) => {
  try {
    const BATCH_SIZE = 100

    for (let i = 0; i < dependencies.length; i += BATCH_SIZE) {
      const batch = dependencies.slice(i, i + BATCH_SIZE)

      await prisma.$transaction(async (tx) => {
        await Promise.all(
          batch.map(async ({ name, version }) => {
            const pkg = await tx.openSourcePackage.upsert({
              where: { name },
              create: { name },
              update: {},
              select: { id: true },
            })

            const pkgVersion = await tx.openSourcePackageVersion.upsert({
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

            await tx.jobPostToPackageVersion.create({
              data: {
                jobPostId: jobId,
                packageVersionId: pkgVersion.id,
              },
            })
          })
        )
      })
    }
  } catch (e) {}
}

export const updateJobDepsAsync = async (jobId: string) => {
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
  if (!job.data) return { shouldContinue: false }

  if (job.source === "package.json") {
    const packagesJson = JSON.parse(job.data)
    const dependencies = Object.entries({
      ...packagesJson.dependencies,
      ...packagesJson.devDependencies,
    }).map(([name, version]) => ({ name, version: version as string }))

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
}
