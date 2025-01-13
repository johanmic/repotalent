/*
  Warnings:

  - Added the required column `updatedAt` to the `openSourcePackage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "creditUsage" ADD COLUMN     "leadsEnabled" BOOLEAN;

-- AlterTable
ALTER TABLE "openSourcePackage" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "city_countryId_idx" ON "city"("countryId");

-- CreateIndex
CREATE INDEX "city_name_idx" ON "city"("name");

-- CreateIndex
CREATE INDEX "contribution_githubRepoId_idx" ON "contribution"("githubRepoId");

-- CreateIndex
CREATE INDEX "contribution_contributorId_idx" ON "contribution"("contributorId");

-- CreateIndex
CREATE INDEX "contribution_createdAt_idx" ON "contribution"("createdAt");

-- CreateIndex
CREATE INDEX "contributor_githubId_idx" ON "contributor"("githubId");

-- CreateIndex
CREATE INDEX "contributor_login_idx" ON "contributor"("login");

-- CreateIndex
CREATE INDEX "contributor_contributorOrganizationId_idx" ON "contributor"("contributorOrganizationId");

-- CreateIndex
CREATE INDEX "contributor_name_idx" ON "contributor"("name");

-- CreateIndex
CREATE INDEX "githubRepo_name_idx" ON "githubRepo"("name");

-- CreateIndex
CREATE INDEX "githubRepo_gitUrl_idx" ON "githubRepo"("gitUrl");

-- CreateIndex
CREATE INDEX "jobPost_organizationId_idx" ON "jobPost"("organizationId");

-- CreateIndex
CREATE INDEX "jobPost_published_idx" ON "jobPost"("published");

-- CreateIndex
CREATE INDEX "jobPost_createdAt_idx" ON "jobPost"("createdAt");

-- CreateIndex
CREATE INDEX "jobPost_currencyId_idx" ON "jobPost"("currencyId");

-- CreateIndex
CREATE INDEX "openSourcePackage_githubRepoId_idx" ON "openSourcePackage"("githubRepoId");

-- CreateIndex
CREATE INDEX "organization_cityId_idx" ON "organization"("cityId");

-- CreateIndex
CREATE INDEX "organization_name_idx" ON "organization"("name");

-- CreateIndex
CREATE INDEX "user_organizationId_idx" ON "user"("organizationId");

-- CreateIndex
CREATE INDEX "user_cityId_idx" ON "user"("cityId");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");
