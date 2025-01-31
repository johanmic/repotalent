"use server"

import { getAvailableTokens } from "@/app/actions/user"
import prisma from "@/store/prisma"
import { Prisma } from "@prisma/client"
import { mapJS } from "@/utils/mapIcons"
import { parseRequirementsTxt } from "@/utils/parseRequirementsTXT"
import { parsePodfileLock } from "@/utils/podfileLockParser"
import { generateJobPost } from "@/utils/questionsPrompt"
import { createSlug } from "@/utils/slug"
import { getUser } from "@/utils/supabase/server"
import { getRepoMetaFiles } from "@/utils/getRepoMetaFiles"
import { AcceptedFileName } from "@/utils/filenames"
import { tasks } from "@trigger.dev/sdk/v3"
import { UPDATE_JOB_DEPS } from "@/trigger/constants"
import posthog from "@/utils/posthog-node"
import { generateCode } from "@/utils/code"
import { parsePubspecYaml } from "@/utils/parsePubspecYaml"
import {
  city,
  country,
  currency,
  jobPost,
  jobPostQuestion,
  jobPostRatings,
  jobPostTag,
  openSourcePackage,
  openSourcePackageVersion,
  organization,
  creditUsage,
  githubRepo,
  purchase,
  jobActionsLog,
} from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { omit, uniq } from "ramda"
import { parsePyprojectToml } from "@/utils/pyprojectTomlParser"

export interface JobPostToPackageVersion {
  package: openSourcePackage
  packageVersion: openSourcePackageVersion
}

export interface JobPost extends jobPost {
  tags?: { tag: jobPostTag }[]
  questions?: jobPostQuestion[]
  ratings?: jobPostRatings[]
  currency?: currency
  jobActionsLog?: jobActionsLog[]
  packages?: {
    packageVersion?: {
      package: openSourcePackage & {
        githubRepo?: githubRepo
      }
      version: string
    }
  }[]
  organization?: organization & {
    city: city & {
      country: country
    }
  }
  creditUsage?:
    | (creditUsage & {
        purchase?: purchase | null
      })[]
    | null
}

const updateJobTags = async ({
  jobId,
  allTags,
}: {
  jobId: string
  allTags: string[]
}) => {
  await prisma.jobPost.update({
    where: { id: jobId },
    data: {
      tags: {
        create: allTags.map((tagName) => ({
          tag: {
            connectOrCreate: {
              where: { tag: tagName },
              create: { tag: tagName },
            },
          },
        })),
      },
    },
  })
}

const processTags = async ({
  jobId,
  dependencies,
  existingTags,
  defaultTags = [],
}: {
  jobId: string
  dependencies: { name: string; version: string }[]
  existingTags: Set<string>
  defaultTags?: string[]
}) => {
  const keys = dependencies.map(({ name }) => name)
  const tags = await mapJS({ packages: keys })
  const newTags = tags.filter((tag) => !existingTags.has(tag.toLowerCase()))
  const allTags = uniq([...existingTags, ...defaultTags, ...newTags])
  await updateJobTags({ jobId, allTags })
}

export const createJobPost = async (data: {
  filename: AcceptedFileName
  data: string
  meta?: {
    repo?: string
    owner?: string
    path?: string
  }
}): Promise<JobPost> => {
  const startTime = performance.now()
  let jobId: string | null = null
  let creditUsageId: string | null = null

  try {
    const { user } = await getUser()
    if (!user?.id) {
      throw new Error("User not authenticated")
    }

    let extra = ""
    if (
      data.meta?.repo &&
      typeof data.meta?.path === "string" &&
      data.meta?.owner
    ) {
      const reuslts = await getRepoMetaFiles({
        path: data.meta.path,
        owner: data.meta.owner,
        repo: data.meta.repo,
        type: data.filename,
      })
      if (reuslts) {
        extra = reuslts
      }
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

    const job = await prisma.jobPost.create({
      data: {
        title: "",
        slug: generateCode({ length: 12 }),
        source: data.filename,
        organizationId,
        published: null,
        data: data.data,
        githubPath: data.meta?.path || undefined,
        githubRepo: data.meta?.repo || null,
      },
    })

    tasks.trigger(UPDATE_JOB_DEPS, {
      jobId: job.id,
    })

    const promptReuslts = await generateJobPost({
      data,
      extra,
      jobPostId: job.id,
      userId: user.id,
    })

    const updatedJob = await prisma.$transaction(async ($tx) => {
      const uniqTags = uniq(promptReuslts.tags)
      const results = await $tx.jobPost.update({
        where: { id: job.id },
        data: {
          title: promptReuslts.suggestedTitle,
          seniority: promptReuslts.seniority,
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
            create: uniqTags.map((tag) => ({
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

      const purchase = await $tx.purchase.findMany({
        where: { userId: user.id },
        include: {
          creditUsage: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      const firstPurchaseWithCredits = purchase.find((p) => {
        const availableCredits = p.creditUsage.reduce(
          (acc, curr) => acc + curr.creditsUsed,
          0
        )
        return availableCredits < p.creditsBought
      })

      const firstPurchaseWithCreditsAndJobBoard = purchase.find((p) => {
        const availableCredits = p.creditUsage.reduce(
          (acc, curr) => acc + curr.creditsUsed,
          0
        )
        return availableCredits < p.creditsBought && p.jobBoard
      })

      const purchaseId =
        firstPurchaseWithCreditsAndJobBoard?.id ||
        firstPurchaseWithCredits?.id ||
        null
      const creditUsage = await $tx.creditUsage.create({
        data: {
          userId: user.id,
          creditsUsed: 1,
          jobPostId: job.id,
          purchaseId,
        },
      })
      creditUsageId = creditUsage.id

      return results
    })

    const existingTags = new Set(
      promptReuslts.tags.map((tag) => tag.toLowerCase())
    )

    if (data.filename === "package.json") {
      const packagesJson = JSON.parse(data.data)
      const dependencies = Object.entries({
        ...packagesJson.dependencies,
        ...packagesJson.devDependencies,
      }).map(([name, version]) => ({ name, version: version as string }))
      const defaultTags = ["javascript", "typescript", "nodejs"]
      await processTags({
        jobId: job.id,
        dependencies,
        existingTags,
        defaultTags,
      })
    } else if (data.filename === "requirements.txt") {
      const dependencies = Object.entries(parseRequirementsTxt(data.data)).map(
        ([name, version]) => ({ name, version: version as string })
      )
      const defaultTags = ["python"]
      await processTags({
        jobId: job.id,
        dependencies,
        existingTags,
        defaultTags,
      })
    } else if (data.filename === "Podfile.lock") {
      const dependencies = Object.entries(parsePodfileLock(data.data)).map(
        ([name, version]) => ({
          name,
          version,
        })
      )
      const defaultTags = ["ios", "swift", "objective-c"]

      await processTags({
        jobId: job.id,
        dependencies,
        existingTags,
        defaultTags,
      })
    } else if (data.filename === "pyproject.toml") {
      const dependencies = Object.entries(parsePyprojectToml(data.data)).map(
        ([name, version]) => ({
          name,
          version,
        })
      )
      const defaultTags = ["python"]
      await processTags({
        jobId: job.id,
        dependencies,
        existingTags,
        defaultTags,
      })
    } else if (data.filename === "pubspec.yaml") {
      const dependencies = Object.entries(parsePubspecYaml(data.data)).map(
        ([name, version]) => ({ name, version: version as string })
      )
      const defaultTags = ["flutter"]
      await processTags({
        jobId: job.id,
        dependencies,
        existingTags,
        defaultTags,
      })
    }

    jobId = job.id

    posthog.capture({
      distinctId: user.id,
      event: "job created",
      properties: {
        source: data.filename,
        hasGithubMeta: !!data.meta?.repo,
      },
    })

    const endTime = performance.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    return updatedJob
  } catch (err) {
    const endTime = performance.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    if (!jobId && creditUsageId) {
      await prisma.creditUsage.delete({
        where: { id: creditUsageId },
      })
    }
    throw err
  }
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
      packages: {
        include: {
          packageVersion: {
            include: {
              package: {
                include: {
                  githubRepo: true,
                },
              },
            },
          },
        },
      },
      creditUsage: {
        include: {
          purchase: true,
        },
      },
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
      // packages: {
      //   include: {
      //     packageVersion: {
      //       include: {
      //         package: true,
      //       },
      //     },
      //   },
      // },
      jobActionsLog: true,
    },
    orderBy: {
      createdAt: "desc",
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
          "jobActionsLog",
          "tags",
          "questions",
          "ratings",
          "packages",
          "currency",
          "creditUsage",
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

  posthog.capture({
    distinctId: user.id,
    event: "job updated",
    properties: {
      jobId,
      updatedFields: Object.keys(data),
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
  const { user } = await getUser()
  if (!user?.id) {
    throw new Error("User not authenticated")
  }
  await prisma.jobPost.update({
    where: { id: jobId },
    data: { published: published ? new Date() : null },
  })

  posthog.capture({
    distinctId: user.id,
    event: published ? "job published" : "job unpublished",
    properties: { jobId },
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

export const searchJobs = async ({ query }: { query: string }) => {
  const jobs = await prisma.jobPost.findMany({
    where: {
      published: { not: null },
      OR: [
        { title: { contains: query } },
        { tags: { some: { tag: { tag: { contains: query } } } } },
        { description: { contains: query } },
        { questions: { some: { question: { contains: query } } } },
        {
          packages: {
            some: {
              packageVersion: { package: { name: { contains: query } } },
            },
          },
        },
        {
          organization: {
            city: {
              name: { contains: query },
            },
          },
        },
        {
          organization: {
            city: {
              country: {
                name: { contains: query },
              },
            },
          },
        },
      ],
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
    take: 100,
  })
  return jobs as JobPost[]
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

export const getJobPostTokenUsage = async (
  jobPostId: string
): Promise<number> => {
  const jobPost = await prisma.jobPostTokenUsage.aggregate({
    where: { jobPostId },
    _sum: { tokensUsed: true },
  })
  return jobPost._sum.tokensUsed || 0
}

export interface JobPackageToVersion {
  jobPostId: string
  packageVersionId: string
  importance: number
  packageVersion: {
    id: string
    package: {
      id: string
      name: string
      githubRepo: {
        id: string
        name: string
        gitUrl: string
        website: string
        description: string
        logo: string
        createdAt: Date
        updatedAt: Date
        repoUpdatedAt: Date
        repoCreatedAt: Date
        archived: boolean
        language: string
        stars: number
        watchers: number
      }
    }
  }
}

export const getJobPackages = async (
  jobId: string
): Promise<JobPackageToVersion[]> => {
  const packages = await prisma.jobPostToPackageVersion.findMany({
    where: { jobPostId: jobId },
    include: {
      packageVersion: {
        include: {
          package: {
            include: {
              githubRepo: true,
            },
          },
        },
      },
    },
  })
  return packages as JobPackageToVersion[]
}

export const updatePackageRatings = async (
  jobPackages: Partial<JobPackageToVersion>[]
) => {
  const { user } = await getUser()
  if (!user?.id) {
    throw new Error("User not authenticated")
  }

  for (const jobPackage of jobPackages) {
    if (!jobPackage.jobPostId || !jobPackage.packageVersionId) continue
    await prisma.jobPostToPackageVersion.update({
      where: {
        jobPostId_packageVersionId: {
          jobPostId: jobPackage?.jobPostId,
          packageVersionId: jobPackage?.packageVersionId,
        },
      },
      data: {
        importance: jobPackage.importance,
      },
    })
  }
}

export const deleteJobPost = async (jobId: string) => {
  const { user } = await getUser()
  if (!user?.id) {
    throw new Error("User not authenticated")
  }

  const userOwnsPost = await prisma.jobPost.findFirst({
    where: {
      id: jobId,
      organization: {
        users: { some: { id: user.id } },
      },
    },
  })

  if (!userOwnsPost) {
    throw new Error("User does not own this job post")
  }

  await prisma.$transaction(async ($tx) => {
    // Delete related records in order of dependencies
    await $tx.jobPostTokenUsage.deleteMany({
      where: { jobPostId: jobId },
    })

    await $tx.jobActionsLog.deleteMany({
      where: { jobPostId: jobId },
    })

    await $tx.jobPostToPackageVersion.deleteMany({
      where: { jobPostId: jobId },
    })

    await $tx.jobPostQuestion.deleteMany({
      where: { jobPostId: jobId },
    })

    await $tx.jobPostRatings.deleteMany({
      where: { jobPostId: jobId },
    })

    await $tx.jobPostToTag.deleteMany({
      where: { jobPostId: jobId },
    })

    await $tx.jobPostContributorBookmark.deleteMany({
      where: { jobPostId: jobId },
    })

    await $tx.creditUsage.deleteMany({
      where: { jobPostId: jobId },
    })

    // Finally delete the job post itself
    await $tx.jobPost.delete({
      where: { id: jobId },
    })
  })

  revalidatePath("/home/jobs")
}
