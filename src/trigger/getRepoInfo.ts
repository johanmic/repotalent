import { logger, task, tasks } from "@trigger.dev/sdk/v3"
import { getRepoInfoHandler } from "@/utils/job/getRepoInfo"
import { GET_REPO_INFO, GET_USER_INFO } from "./constants"
export const updateJobDeps = task({
  id: GET_REPO_INFO,
  queue: {
    name: GET_REPO_INFO,
  },
  maxDuration: 30,
  run: async (
    payload: {
      jobId: string
      githubRepoId: string
    },
    { ctx }
  ) => {
    logger.log("Updating job deps", { jobId: payload.jobId, ctx })

    await getRepoInfoHandler(payload)
    // await tasks.trigger(GET_USER_INFO, { jobId: payload.jobId })
    return {
      message: "Job deps updated",
    }
  },
})
