import { logger, task, tasks } from "@trigger.dev/sdk/v3"
import { getUserInfo } from "@/utils/job/getUserInfo"
import { GET_USER_INFO, CALC_SCORES } from "./constants"
export const updateJobDeps = task({
  id: GET_USER_INFO,
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 900, // Stop executing after 300 secs (5 mins) of compute
  run: async (
    payload: {
      jobId: string
    },
    { ctx }
  ) => {
    logger.log("Updating job deps", { jobId: payload.jobId, ctx })

    await getUserInfo(payload.jobId)
    await tasks.trigger(CALC_SCORES, { jobId: payload.jobId })

    return {
      message: "Job deps updated",
    }
  },
})
