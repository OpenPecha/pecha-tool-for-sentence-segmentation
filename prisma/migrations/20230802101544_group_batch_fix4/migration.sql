/*
  Warnings:

  - The `assigned_batch` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `assigned_batch_for_review` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "assigned_batch",
ADD COLUMN     "assigned_batch" TEXT[],
DROP COLUMN "assigned_batch_for_review",
ADD COLUMN     "assigned_batch_for_review" TEXT[];
