/*
  Warnings:

  - You are about to drop the `jobPostPricingPackage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pricing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "jobPostPricingPackage" DROP CONSTRAINT "jobPostPricingPackage_jobPostId_fkey";

-- DropForeignKey
ALTER TABLE "jobPostPricingPackage" DROP CONSTRAINT "jobPostPricingPackage_pricingId_fkey";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "jobPostPricingPackage";

-- DropTable
DROP TABLE "pricing";

-- CreateTable
CREATE TABLE "jobPostTokenUsage" (
    "id" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "jobPostTokenUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creditPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripePurchaseId" TEXT NOT NULL,
    "creditsBought" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creditPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creditUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "creditsUsed" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creditUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "creditPurchase_stripePurchaseId_key" ON "creditPurchase"("stripePurchaseId");

-- AddForeignKey
ALTER TABLE "jobPostTokenUsage" ADD CONSTRAINT "jobPostTokenUsage_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "jobPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobPostTokenUsage" ADD CONSTRAINT "jobPostTokenUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creditPurchase" ADD CONSTRAINT "creditPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creditUsage" ADD CONSTRAINT "creditUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creditUsage" ADD CONSTRAINT "creditUsage_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "jobPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
