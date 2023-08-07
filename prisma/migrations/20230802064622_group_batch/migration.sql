/*
  Warnings:

  - The values [USER,ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `group` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('owner', 'admin', 'annotator', 'reviewer');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'annotator';
COMMIT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "group",
ALTER COLUMN "role" SET DEFAULT 'annotator',
ALTER COLUMN "assigned_batch" SET NOT NULL,
ALTER COLUMN "assigned_batch" DROP DEFAULT,
ALTER COLUMN "assigned_batch" SET DATA TYPE TEXT,
ALTER COLUMN "assigned_batch_for_review" SET NOT NULL,
ALTER COLUMN "assigned_batch_for_review" DROP DEFAULT,
ALTER COLUMN "assigned_batch_for_review" SET DATA TYPE TEXT;

-- DropEnum
DROP TYPE "Group";
