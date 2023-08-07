/*
  Warnings:

  - You are about to drop the column `group` on the `Text` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Text" DROP COLUMN "group",
ADD COLUMN     "batch" TEXT;
