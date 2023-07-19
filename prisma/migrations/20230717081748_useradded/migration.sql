/*
  Warnings:

  - You are about to drop the column `modified_by` on the `text` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "text" DROP COLUMN "modified_by",
ADD COLUMN     "modified_by_id" INTEGER;

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "text" ADD CONSTRAINT "text_modified_by_id_fkey" FOREIGN KEY ("modified_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
