-- AlterTable
ALTER TABLE "jobActionsLog" ADD COLUMN     "error" INTEGER DEFAULT 0,
ADD COLUMN     "found" INTEGER DEFAULT 0,
ADD COLUMN     "processed" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "lastSeen" TIMESTAMP(3);
