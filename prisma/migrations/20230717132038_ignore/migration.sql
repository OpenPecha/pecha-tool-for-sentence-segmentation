/*
  Warnings:

  - You are about to drop the column `rejected_by_id` on the `Text` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Text" DROP CONSTRAINT "Text_rejected_by_id_fkey";

-- AlterTable
ALTER TABLE "Text" DROP COLUMN "rejected_by_id";

-- CreateTable
CREATE TABLE "_UserRejectedText" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_UserIgnoredText" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserRejectedText_AB_unique" ON "_UserRejectedText"("A", "B");

-- CreateIndex
CREATE INDEX "_UserRejectedText_B_index" ON "_UserRejectedText"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserIgnoredText_AB_unique" ON "_UserIgnoredText"("A", "B");

-- CreateIndex
CREATE INDEX "_UserIgnoredText_B_index" ON "_UserIgnoredText"("B");

-- AddForeignKey
ALTER TABLE "_UserRejectedText" ADD CONSTRAINT "_UserRejectedText_A_fkey" FOREIGN KEY ("A") REFERENCES "Text"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserRejectedText" ADD CONSTRAINT "_UserRejectedText_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserIgnoredText" ADD CONSTRAINT "_UserIgnoredText_A_fkey" FOREIGN KEY ("A") REFERENCES "Text"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserIgnoredText" ADD CONSTRAINT "_UserIgnoredText_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
