/*
  Warnings:

  - You are about to drop the column `assigned_text` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `assigned_text_for_review` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "assigned_text",
DROP COLUMN "assigned_text_for_review",
ADD COLUMN     "assigned_batch" TEXT,
ADD COLUMN     "assigned_batch_for_review" TEXT;
