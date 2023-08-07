/*
  Warnings:

  - You are about to drop the column `assigned_group` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "assigned_group",
ADD COLUMN     "assigned_batch" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "group" TEXT;
