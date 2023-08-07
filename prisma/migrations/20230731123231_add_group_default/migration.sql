/*
  Warnings:

  - The `group` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Group" AS ENUM ('ga', 'gb');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "group",
ADD COLUMN     "group" "Group" NOT NULL DEFAULT 'ga';
