"use server"

import prisma from "@/store/prisma"
import { prepareQuestions } from "@/utils/questionsPrompt"
import { getUser } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { omit } from "ramda"
import { revalidatePath } from "next/cache"
import { mapJS } from "@/utils/mapIcons"
import { createSlug } from "@/utils/slug"
import { getAvailableTokens } from "@/app/actions/user"
import {
  jobPost,
  jobPostTag,
  jobPostQuestion,
  openSourcePackage,
  openSourcePackageVersion,
  jobPostRatings,
  organization,
  city,
  country,
  currency,
} from "@prisma/client"

export interface JobPostToPackageVersion {
  package: openSourcePackage
  packageVersion: openSourcePackageVersion
}
export interface JobPost extends jobPost {
  tags?: { tag: jobPostTag }[]
  questions?: jobPostQuestion[]
  ratings?: jobPostRatings[]
  currency?: currency
  packages?: {
    packageVersion?: {
      package: openSourcePackage
      version: string
    }
  }[]
  organization?: organization & {
    city: city & {
      country: country
    }
  }
}
export const createJobPost = async (data: {
  filename: string
  data: string
}) => {
  const { user } = await getUser()
  if (!user?.id) {
    throw new Error("User not authenticated")
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { organization: true },
  })
  const creditsInfo = await getAvailableTokens(user.id)
  if (creditsInfo.creditsAvailable < 1) {
    throw new Error("Not enough credits")
  }
  const organizationId = dbUser?.organization?.id
  if (!organizationId) {
    throw new Error("User not in organization")
  }

  const promptReuslts = await prepareQuestions({
    data,
  })
  const slug = await checkedSlug({
    name: `${promptReuslts.suggestedTitle || "job"}-${
      dbUser.organization?.name
    }`,
    table: "jobPost",
  })
  const job = await prisma.$transaction(async ($tx) => {
    const job = await $tx.jobPost.create({
      data: {
        title: promptReuslts.suggestedTitle,
        slug,
        seniority: promptReuslts.seniority,
        source: data.filename,
        published: null,
        organizationId,
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
    await $tx.creditUsage.create({
      data: {
        userId: user.id,
        creditsUsed: 1,
        jobPostId: job.id,
      },
    })
    if (data.filename === "package.json") {
      const packagesJson = JSON.parse(data.data)
      const dependencies = Object.entries({
        ...packagesJson.dependencies,
        ...packagesJson.devDependencies,
      }).map(([name, version]) => ({ name, version: version as string }))
      console.log("dependencies", dependencies)
      const keys = dependencies.map(({ name }) => name) as string[]
      console.log("keys", keys)
      const tags = await mapJS({ packages: keys })
      console.log("tags", tags)
      const existingTags = new Set(
        promptReuslts.tags.map((tag) => tag.toLowerCase())
      )
      const newTags = tags.filter((tag) => !existingTags.has(tag.toLowerCase()))

      await $tx.jobPost.update({
        where: { id: job.id },
        data: {
          tags: {
            create: newTags.map((tag) => ({
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

  redirect(`/home/jobs/${job.id}/complete`)
}

export const getPublishedJobPost = async ({ slug }: { slug: string }) => {
  const job = await prisma.jobPost.findFirst({
    where: { slug, published: { not: null } },
    include: {
      organization: {
        include: {
          city: {
            include: {
              country: true,
            },
          },
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      questions: true,
      ratings: true,
      currency: true,
    },
  })
  return job as JobPost
}
export const getJobPost = async ({
  jobId,
}: {
  jobId: string
}): Promise<JobPost> => {
  const { user } = await getUser()
  if (!user) {
    throw new Error("User not found")
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: user?.id },
    include: { organization: true },
  })
  if (!dbUser?.organization?.id) {
    // throw new Error("User not in organization")
    redirect("/home")
  }

  const job = await prisma.jobPost.findUnique({
    where: { id: jobId, organizationId: dbUser?.organization?.id },
    include: {
      organization: {
        include: {
          city: {
            include: {
              country: true,
            },
          },
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      currency: true,
      questions: true,
      ratings: true,
    },
  })
  return job as JobPost
}

export const listJobs = async (): Promise<JobPost[]> => {
  const { user } = await getUser()
  if (!user?.id) {
    throw new Error("User not authenticated")
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { organization: true },
  })
  if (!dbUser?.organization?.id) {
    throw new Error("User not in organization")
  }
  const results = await prisma.jobPost.findMany({
    where: { organizationId: dbUser.organization.id },
    include: {
      organization: {
        include: {
          city: {
            include: {
              country: true,
            },
          },
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      questions: true,
      ratings: true,
      packages: true,
    },
  })
  return results as JobPost[]
}

export const updateJobPost = async ({
  jobId,
  data,
  shouldRedirect = true,
}: {
  jobId: string
  data: Partial<JobPost>
  shouldRedirect?: boolean
}) => {
  console.log("updateJobPost", data)
  const { user } = await getUser()
  if (!user?.id) {
    throw new Error("User not authenticated")
  }
  const prevJob = await prisma.jobPost.findUnique({
    where: { id: jobId },
  })
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { organization: true },
  })
  if (!dbUser?.organization?.id) {
    throw new Error("User not in organization")
  }
  const prevTitle = prevJob?.title
  let slug = prevJob?.slug

  if (prevTitle !== data.title) {
    slug = await checkedSlug({
      name: `${data.title || prevTitle}-${dbUser.organization?.name}`,
      table: "jobPost",
    })
    data.slug = slug
  }

  const job = await prisma.jobPost.update({
    where: { id: jobId, organizationId: dbUser.organization.id },
    data: {
      ...omit(
        [
          "id",
          "organizationId",
          "organization",
          "createdAt",
          "updatedAt",
          "tags",
          "questions",
          "ratings",
          "packages",
          "currency",
          "slug",
        ],
        data
      ),
      slug,
      questions: {
        upsert: data.questions?.map((question) => ({
          where: { id: question.id },
          create: { question: question.question, answer: question.answer },
          update: { answer: question.answer },
        })),
      },
      ratings: {
        upsert: data.ratings?.map((rating) => ({
          where: { id: rating.id },
          create: { question: rating.question, rating: rating.rating },
          update: { rating: rating.rating },
        })),
      },
      currencyId: data.currency?.id || null,
    },
  })

  if (shouldRedirect) {
    redirect(`/home/jobs/${jobId}/edit`)
  }
  revalidatePath(`/home/jobs/${jobId}/edit`)
  return job
}

export const setPublished = async ({
  jobId,
  published,
}: {
  jobId: string
  published: boolean
}) => {
  await prisma.jobPost.update({
    where: { id: jobId },
    data: { published: published ? new Date() : null },
  })
  revalidatePath(`/home/jobs/${jobId}/preview`)
  revalidatePath(`/home/jobs/${jobId}`)
}

export const checkedSlug = async ({
  name,
  table,
  inc = 0,
}: {
  name: string
  table: "jobPost"
  inc?: number
}): Promise<string> => {
  if (table === "jobPost") {
    const slug = createSlug(name, inc)
    const jobPost = await prisma.jobPost.findFirst({
      where: {
        slug,
      },
    })
    if (jobPost) {
      return checkedSlug({ name, table, inc: inc + 1 })
    }
    return slug
  }

  throw new Error("Table not found")
}

export const getJobGeo = async () => {
  const geoStats = await prisma.jobPost.groupBy({
    by: ["organizationId"],
    where: {
      published: { not: null },
      organization: {
        cityId: { not: null },
      },
    },
    _count: {
      _all: true,
    },
    having: {
      organizationId: {
        _count: {
          gt: 0,
        },
      },
    },
  })

  const locations = await prisma.organization.findMany({
    where: {
      id: {
        in: geoStats
          .map((stat) => stat.organizationId)
          .filter((id): id is string => id !== null),
      },
    },
    include: {
      city: {
        include: {
          country: true,
        },
      },
    },
  })

  return locations
    .map((loc) => ({
      country: loc.city?.country.name,
      city: loc.city?.name,
      count:
        geoStats.find((stat) => stat.organizationId === loc.id)?._count._all ||
        0,
    }))
    .filter((loc) => loc.country && loc.city)
}

export const listPublishedJobs = async ({
  country,
  tags,
  seniority,
}: {
  country?: string
  tags?: string[]
  seniority?: string
}) => {
  const jobs = await prisma.jobPost.findMany({
    where: {
      published: { not: null },
      ...(country && {
        organization: {
          city: {
            country: {
              name: country,
            },
          },
        },
      }),
      ...(tags &&
        tags.length > 0 && {
          tags: {
            some: {
              tag: {
                tag: {
                  in: tags,
                },
              },
            },
          },
        }),
      ...(seniority && {
        seniority: parseFloat(seniority),
      }),
    },
    include: {
      organization: {
        include: {
          city: {
            include: {
              country: true,
            },
          },
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      questions: true,
      ratings: true,
      currency: true,
      packages: {
        include: {
          packageVersion: {
            include: {
              package: true,
            },
          },
        },
      },
    },
    orderBy: {
      published: "desc",
    },
  })

  return jobs as JobPost[]
}
