import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : [],
    transactionOptions: {
      maxWait: 60000,
      timeout: 60000,
    },
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
