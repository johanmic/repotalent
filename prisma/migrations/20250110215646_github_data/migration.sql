/*
  Warnings:

  - A unique constraint covering the columns `[jobPostId,contributorId]` on the table `jobPostContributorBookmark` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "jobPostContributorBookmark_jobPostId_contributorId_key" ON "jobPostContributorBookmark"("jobPostId", "contributorId");
