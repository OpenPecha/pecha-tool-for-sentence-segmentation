/*
  Warnings:

  - You are about to drop the column `batch` on the `Text` table. All the data in the column will be lost.
  - You are about to drop the column `group` on the `Text` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Text" DROP COLUMN "batch",
DROP COLUMN "group",
ADD COLUMN     "order" INTEGER;
