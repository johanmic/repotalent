import { logger, task, tasks } from "@trigger.dev/sdk/v3"
import { updateJobDepsAsync } from "@/utils/job/updateJobTags"
import { UPDATE_JOB_DEPS, GET_DEPS_GITHUB } from "./constants"
export const updateJobDeps = task({
  id: UPDATE_JOB_DEPS,
  maxDuration: 900,
  run: async (
    payload: {
      jobId: string
    },
    { ctx }
  ) => {
    logger.log("Updating job deps", { jobId: payload.jobId, ctx })

    await updateJobDepsAsync(payload.jobId)

    await tasks.trigger(GET_DEPS_GITHUB, { jobId: payload.jobId })

    return {
      message: "Job deps updated",
    }
  },
})
