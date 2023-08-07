-- AlterTable
ALTER TABLE "User" ALTER COLUMN "assigned_batch" DROP NOT NULL,
ALTER COLUMN "assigned_batch_for_review" DROP NOT NULL;
