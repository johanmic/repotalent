/*
  Warnings:

  - You are about to drop the column `createdAt` on the `openSourcePackage` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `openSourcePackage` table. All the data in the column will be lost.
  - You are about to drop the column `gitUrl` on the `openSourcePackage` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `openSourcePackage` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `openSourcePackage` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `openSourcePackage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "jobPostToPackageVersion" ADD COLUMN     "importance" INTEGER;

-- AlterTable
ALTER TABLE "openSourcePackage" DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "gitUrl",
DROP COLUMN "logo",
DROP COLUMN "updatedAt",
DROP COLUMN "website",
ADD COLUMN     "githubRepoId" TEXT;

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "leadsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "promoCode" ADD COLUMN     "leadsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "purchase" ADD COLUMN     "leadsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "jobPostContributorBookmark" (
    "id" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT,
    "comment" TEXT,
    "rating" DOUBLE PRECISION,
    "starred" BOOLEAN,

    CONSTRAINT "jobPostContributorBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "githubRepo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gitUrl" TEXT,
    "website" TEXT,
    "description" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "repoUpdatedAt" TIMESTAMP(3),
    "repoCreatedAt" TIMESTAMP(3),
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT,
    "stars" INTEGER,
    "watchers" INTEGER,
    "forks" INTEGER,

    CONSTRAINT "githubRepo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contribution" (
    "id" TEXT NOT NULL,
    "githubRepoId" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contributions" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributor" (
    "id" TEXT NOT NULL,
    "avatar" TEXT,
    "name" TEXT,
    "company" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bio" TEXT,
    "followers" INTEGER,
    "following" INTEGER,
    "locationRaw" TEXT,
    "cityId" TEXT,
    "login" TEXT,
    "githubId" INTEGER,
    "nodeId" TEXT,
    "avatarUrl" TEXT,
    "blog" TEXT,
    "hireable" BOOLEAN,
    "email" TEXT,
    "fetchedAt" TIMESTAMP(3),
    "publicRepos" INTEGER,
    "publicGists" INTEGER,
    "type" TEXT,
    "siteAdmin" BOOLEAN DEFAULT false,
    "githubCreatedAt" TIMESTAMP(3),
    "githubUpdatedAt" TIMESTAMP(3),
    "readme" TEXT,
    "twitter" TEXT,
    "linkedin" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "bluesky" TEXT,
    "fetchedOrgAt" TIMESTAMP(3),
    "optOut" BOOLEAN,
    "contributorOrganizationId" TEXT,

    CONSTRAINT "contributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "openSourcePackageTags" (
    "id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "openSourcePackageTags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributorOrganization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "description" TEXT,
    "followers" INTEGER,
    "following" INTEGER,
    "email" TEXT,
    "twitter" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contributorOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_githubRepoToopenSourcePackageTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_githubRepoToopenSourcePackageTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "jobPostContributorBookmark_jobPostId_contributorId_key" ON "jobPostContributorBookmark"("jobPostId", "contributorId");

-- CreateIndex
CREATE UNIQUE INDEX "githubRepo_name_key" ON "githubRepo"("name");

-- CreateIndex
CREATE UNIQUE INDEX "githubRepo_gitUrl_key" ON "githubRepo"("gitUrl");

-- CreateIndex
CREATE UNIQUE INDEX "contributor_githubId_key" ON "contributor"("githubId");

-- CreateIndex
CREATE INDEX "_githubRepoToopenSourcePackageTags_B_index" ON "_githubRepoToopenSourcePackageTags"("B");

-- AddForeignKey
ALTER TABLE "jobPostContributorBookmark" ADD CONSTRAINT "jobPostContributorBookmark_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "jobPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobPostContributorBookmark" ADD CONSTRAINT "jobPostContributorBookmark_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "contributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "openSourcePackage" ADD CONSTRAINT "openSourcePackage_githubRepoId_fkey" FOREIGN KEY ("githubRepoId") REFERENCES "githubRepo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution" ADD CONSTRAINT "contribution_githubRepoId_fkey" FOREIGN KEY ("githubRepoId") REFERENCES "githubRepo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution" ADD CONSTRAINT "contribution_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "contributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributor" ADD CONSTRAINT "contributor_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributor" ADD CONSTRAINT "contributor_contributorOrganizationId_fkey" FOREIGN KEY ("contributorOrganizationId") REFERENCES "contributorOrganization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_githubRepoToopenSourcePackageTags" ADD CONSTRAINT "_githubRepoToopenSourcePackageTags_A_fkey" FOREIGN KEY ("A") REFERENCES "githubRepo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_githubRepoToopenSourcePackageTags" ADD CONSTRAINT "_githubRepoToopenSourcePackageTags_B_fkey" FOREIGN KEY ("B") REFERENCES "openSourcePackageTags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
