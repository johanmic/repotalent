/*
  Warnings:

  - You are about to drop the column `userId` on the `contributor` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "contributor" DROP CONSTRAINT "contributor_userId_fkey";

-- AlterTable
ALTER TABLE "contributor" DROP COLUMN "userId";
