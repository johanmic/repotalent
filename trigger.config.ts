import { defineConfig } from "@trigger.dev/sdk/v3"
import { prismaExtension } from "@trigger.dev/build/extensions/prisma"

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_ID!,
  runtime: "node",
  logLevel: "log",
  maxDuration: 120,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 600000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./src/trigger"],
  build: {
    extensions: [
      prismaExtension({
        // update this to the path of your Prisma schema file
        schema: "prisma/schema.prisma",
      }),
    ],
  },
})
