import { logger, task, tasks } from "@trigger.dev/sdk/v3"
import { getGithubUrls } from "@/utils/job/getGithubUrls"
import { GET_DEPS_GITHUB, GET_REPO_INFO } from "./constants"

export const getDepsGithub = task({
  id: GET_DEPS_GITHUB,
  maxDuration: 30,
  queue: {
    name: GET_DEPS_GITHUB,
  },
  run: async (
    payload: {
      jobId: string
      pkgId: string
    },
    { ctx }
  ) => {
    logger.log("Updating job deps", { jobId: payload.jobId, ctx })

    await getGithubUrls(payload)
    // await tasks.trigger(GET_REPO_INFO, { jobId: payload.jobId })
    return {
      message: "Job deps updated",
    }
  },
})
