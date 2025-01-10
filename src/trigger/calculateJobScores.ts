import { logger, task } from "@trigger.dev/sdk/v3"
import { precalcRatings } from "@/utils/job/calculateJobScores"
import { CALC_SCORES } from "./constants"
export const calculateJobScores = task({
  id: CALC_SCORES,
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (
    payload: {
      jobId: string
    },
    { ctx }
  ) => {
    logger.log("Calculating job scores", { jobId: payload.jobId, ctx })

    await precalcRatings(payload.jobId)

    return {
      message: "Job scores calculated",
    }
  },
})
