-- AlterTable
ALTER TABLE "creditPurchase" ADD COLUMN     "promoCodeId" TEXT;

-- AddForeignKey
ALTER TABLE "creditPurchase" ADD CONSTRAINT "creditPurchase_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "promoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
