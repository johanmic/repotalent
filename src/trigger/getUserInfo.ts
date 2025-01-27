import { logger, task, tasks } from "@trigger.dev/sdk/v3"
import { getUserInfoHandler } from "@/utils/job/getUserInfo"
import { GET_USER_INFO, CALC_SCORES } from "./constants"
export const updateJobDeps = task({
  id: GET_USER_INFO,
  queue: {
    name: GET_USER_INFO,
  },
  maxDuration: 30,
  run: async (
    payload: {
      jobId: string
      contributorId: string
    },
    { ctx }
  ) => {
    logger.log("Updating job deps", { jobId: payload.jobId, ctx })
    if (!payload.contributorId) {
      logger.error("No contributor id found", { jobId: payload.jobId })
      return
    }
    await getUserInfoHandler(payload)
    // await tasks.trigger(CALC_SCORES, { jobId: payload.jobId })

    return {
      message: "Job deps updated",
    }
  },
})
