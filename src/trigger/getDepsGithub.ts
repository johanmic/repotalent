import { logger, task, tasks } from "@trigger.dev/sdk/v3"
import { getGithubUrls } from "@/utils/job/getGithubUrls"
import { GET_DEPS_GITHUB, GET_REPO_INFO } from "./constants"
export const getDepsGithub = task({
  id: GET_DEPS_GITHUB,
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (
    payload: {
      jobId: string
    },
    { ctx }
  ) => {
    logger.log("Updating job deps", { jobId: payload.jobId, ctx })

    await getGithubUrls(payload.jobId)
    await tasks.trigger(GET_REPO_INFO, { jobId: payload.jobId })
    return {
      message: "Job deps updated",
    }
  },
})
