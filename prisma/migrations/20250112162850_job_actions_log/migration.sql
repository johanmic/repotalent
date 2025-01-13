-- CreateTable
CREATE TABLE "jobActionsLog" (
    "id" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "action" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "jobActionsLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "jobActionsLog" ADD CONSTRAINT "jobActionsLog_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "jobPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
