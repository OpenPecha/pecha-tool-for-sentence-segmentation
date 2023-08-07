-- AlterTable
ALTER TABLE "User" ADD COLUMN     "assigned_batch_for_review" TEXT[] DEFAULT ARRAY[]::TEXT[];
