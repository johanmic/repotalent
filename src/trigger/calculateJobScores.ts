import { logger, task } from "@trigger.dev/sdk/v3"
import { precalcRatingsHandler } from "@/utils/job/calculateJobScores"
import { CALC_SCORES } from "./constants"
export const calculateJobScores = task({
  id: CALC_SCORES,
  maxDuration: 30, // Stop executing after 300 secs (5 mins) of compute
  run: async (
    payload: {
      jobId: string
      contributorId: string
    },
    { ctx }
  ) => {
    logger.log("Calculating job scores", { jobId: payload.jobId, ctx })

    await precalcRatingsHandler(payload.jobId, payload.contributorId)

    return {
      message: "Job scores calculated",
    }
  },
})
