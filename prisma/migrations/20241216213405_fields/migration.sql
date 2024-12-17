/*
  Warnings:

  - You are about to drop the column `purchaseId` on the `subscription` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_purchaseId_fkey";

-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "purchaseId";

-- CreateTable
CREATE TABLE "_purchaseTosubscription" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_purchaseTosubscription_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_purchaseTosubscription_B_index" ON "_purchaseTosubscription"("B");

-- AddForeignKey
ALTER TABLE "_purchaseTosubscription" ADD CONSTRAINT "_purchaseTosubscription_A_fkey" FOREIGN KEY ("A") REFERENCES "purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_purchaseTosubscription" ADD CONSTRAINT "_purchaseTosubscription_B_fkey" FOREIGN KEY ("B") REFERENCES "subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
