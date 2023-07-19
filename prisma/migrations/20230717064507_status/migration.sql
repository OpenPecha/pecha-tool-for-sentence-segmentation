/*
  Warnings:

  - You are about to drop the column `success` on the `text` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "text" DROP COLUMN "success",
ADD COLUMN     "status" "Status";
