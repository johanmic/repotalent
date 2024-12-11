/*
  Warnings:

  - You are about to drop the column `currency` on the `jobPost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "jobPost" DROP COLUMN "currency",
ADD COLUMN     "currencyId" TEXT;

-- AddForeignKey
ALTER TABLE "jobPost" ADD CONSTRAINT "jobPost_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
