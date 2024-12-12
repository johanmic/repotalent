/*
  Warnings:

  - Added the required column `creditPackageId` to the `creditPurchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "creditPurchase" ADD COLUMN     "creditPackageId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "creditPackage" (
    "id" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "stripeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creditPackage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "creditPackage_stripeId_key" ON "creditPackage"("stripeId");

-- AddForeignKey
ALTER TABLE "creditPurchase" ADD CONSTRAINT "creditPurchase_creditPackageId_fkey" FOREIGN KEY ("creditPackageId") REFERENCES "creditPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
