-- AlterTable
ALTER TABLE "purchase" ADD COLUMN     "jobBoard" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "skipGithub" BOOLEAN;
