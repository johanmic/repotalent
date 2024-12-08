"use server"

import prisma from "@/store/prisma"
import { prepareQuestions } from "@/utils/questionsPrompt"
import { getUser } from "@/utils/supabase/server"
export const createJobPost = async (data: {
  filename: string
  data: string
}) => {
  const { user } = await getUser()
  const dbUser = await prisma.user.findUnique({
    where: { id: user?.id },
    include: { organization: true },
  })
  if (!dbUser?.organization?.id) {
    throw new Error("User not in organization")
  }

  const promptReuslts = await prepareQuestions(data)
  const reuslts = await prisma.$transaction(async ($tx) => {
    const job = await $tx.jobPost.create({
      data: {
        title: promptReuslts.suggestedTitle,
        seniority: promptReuslts.seniority,
        source: data.filename,
        organization: {
          connect: {
            id: dbUser?.organization?.id as string,
          },
        },
        questions: {
          create: promptReuslts.questions.map((question) => ({
            question,
          })),
        },
        ratings: {
          create: promptReuslts.packages.map((pkg) => ({
            question: pkg,
          })),
        },
        tags: {
          create: promptReuslts.tags.map((tag) => ({
            tag: {
              connectOrCreate: {
                where: { tag },
                create: { tag },
              },
            },
          })),
        },
      },
    })

    if (data.filename === "package.json") {
      const packagesJson = JSON.parse(data.data)
      const dependencies = Object.entries({
        ...packagesJson.dependencies,
        ...packagesJson.devDependencies,
      }).map(([name, version]) => ({ name, version: version as string }))
      // Process all packages in parallel
      await Promise.all(
        dependencies.map(async ({ name, version }) => {
          // First, create or get the package
          const pkg = await $tx.openSourcePackage.upsert({
            where: { name },
            create: { name },
            update: {},
          })

          // Now create the version using the package's ID
          const pkgVersion = await $tx.openSourcePackageVersion.upsert({
            where: {
              packageId_version: {
                packageId: pkg.id,
                version,
              },
            },
            create: {
              version,
              packageId: pkg.id,
            },
            update: {},
          })

          // Link to job post
          return $tx.jobPostToPackageVersion.create({
            data: {
              jobPostId: job.id,
              packageVersionId: pkgVersion.id,
            },
          })
        })
      )
    }

    return job
  })
}
