-- AlterTable
ALTER TABLE "User" ADD COLUMN     "assigned_group" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
