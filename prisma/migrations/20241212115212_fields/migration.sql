/*
  Warnings:

  - You are about to drop the column `creditPackageId` on the `creditPurchase` table. All the data in the column will be lost.
  - You are about to drop the `creditPackage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "creditPurchase" DROP CONSTRAINT "creditPurchase_creditPackageId_fkey";

-- AlterTable
ALTER TABLE "creditPurchase" DROP COLUMN "creditPackageId";

-- DropTable
DROP TABLE "creditPackage";
