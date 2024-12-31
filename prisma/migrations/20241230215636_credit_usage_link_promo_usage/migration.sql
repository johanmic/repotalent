-- AlterTable
ALTER TABLE "creditUsage" ADD COLUMN     "purchaseId" TEXT;

-- AlterTable
ALTER TABLE "promoCode" ADD COLUMN     "limit" INTEGER;

-- AddForeignKey
ALTER TABLE "creditUsage" ADD CONSTRAINT "creditUsage_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
