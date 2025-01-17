import { logger, task, tasks, schedules } from "@trigger.dev/sdk/v3"
import prisma from "@/store/prisma"
import {
  GET_DEPS_GITHUB,
  GET_REPO_INFO,
  GET_USER_INFO,
  CALC_SCORES,
} from "./constants"

import { REQUIRED_ACTIONS } from "@/utils/job/constants"

export const matchCleanup = schedules.task({
  id: "match-cleanup",
  cron: "*/30 * * * *", // Every 30 minutes
  maxDuration: 3600,
  run: async () => {
    logger.log("Checking for incomplete job processing")
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const jobPosts = await prisma.jobPost.findMany({
      where: {
        OR: REQUIRED_ACTIONS.map((action) => ({
          jobActionsLog: {
            none: {
              action,
            },
          },
        })),
        organization: {
          OR: [
            {
              users: {
                some: {
                  githubInstallationId: {
                    not: null,
                  },
                  subscription: {
                    some: {
                      purchases: {
                        some: {
                          leadsEnabled: true,
                          createdAt: { gt: oneMonthAgo },
                        },
                      },
                    },
                  },
                },
              },
            },
            {
              users: {
                some: {
                  githubInstallationId: {
                    not: null,
                  },
                  promoCodeUsage: {
                    some: {
                      createdAt: { gt: oneMonthAgo },
                      promoCode: { leadsEnabled: true },
                    },
                  },
                },
              },
            },
          ],
        },
      },
      include: {
        jobActionsLog: true,
      },
    })

    logger.info(`Found ${jobPosts.length} unfinished job posts`)

    for (const job of jobPosts) {
      const completedActions = new Set(
        job.jobActionsLog
          .filter((log) => log.completed)
          .map((log) => log.action)
      )

      const missingActions = REQUIRED_ACTIONS.filter(
        (action) => !completedActions.has(action)
      )

      if (missingActions.length > 0) {
        logger.info(
          `Job ${job.id} missing actions: ${missingActions.join(", ")}`
        )

        // Trigger appropriate tasks based on missing actions
        if (!completedActions.has("getGithubUrls")) {
          await tasks.trigger(GET_DEPS_GITHUB, { jobId: job.id })
          continue // Wait for this to complete before triggering others
        }

        if (!completedActions.has("getRepoInfo")) {
          await tasks.trigger(GET_REPO_INFO, { jobId: job.id })
          continue
        }

        if (!completedActions.has("getUserInfo")) {
          await tasks.trigger(GET_USER_INFO, { jobId: job.id })
          continue
        }

        // If we have all prerequisites but missing calculateJobScores
        if (
          !completedActions.has("calculateJobScores") &&
          completedActions.has("getGithubUrls") &&
          completedActions.has("getRepoInfo") &&
          completedActions.has("getUserInfo")
        ) {
          await tasks.trigger(CALC_SCORES, { jobId: job.id })
        }
      }
    }
  },
})
