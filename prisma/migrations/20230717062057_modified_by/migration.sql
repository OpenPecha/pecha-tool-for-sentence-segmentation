/*
  Warnings:

  - You are about to drop the column `modifier` on the `text` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "text" DROP COLUMN "modifier",
ADD COLUMN     "modified_by" TEXT;
