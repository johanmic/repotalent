import { logger, task, tasks } from "@trigger.dev/sdk/v3"
import { getJobRepoInfo } from "@/utils/job/getRepoInfo"
import { GET_REPO_INFO, GET_USER_INFO } from "./constants"
export const updateJobDeps = task({
  id: GET_REPO_INFO,
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (
    payload: {
      jobId: string
    },
    { ctx }
  ) => {
    logger.log("Updating job deps", { jobId: payload.jobId, ctx })

    await getJobRepoInfo(payload.jobId)
    await tasks.trigger(GET_USER_INFO, { jobId: payload.jobId })
    return {
      message: "Job deps updated",
    }
  },
})
