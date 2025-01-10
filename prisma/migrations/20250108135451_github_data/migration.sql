-- CreateTable
CREATE TABLE "jobPostContributorBookmark" (
    "id" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT,
    "comment" TEXT,
    "rating" INTEGER,
    "starred" BOOLEAN,

    CONSTRAINT "jobPostContributorBookmark_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "jobPostContributorBookmark" ADD CONSTRAINT "jobPostContributorBookmark_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "jobPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobPostContributorBookmark" ADD CONSTRAINT "jobPostContributorBookmark_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "contributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
