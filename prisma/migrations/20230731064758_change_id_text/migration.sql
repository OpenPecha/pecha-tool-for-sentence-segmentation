/*
  Warnings:

  - The primary key for the `Text` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "_UserIgnoredText" DROP CONSTRAINT "_UserIgnoredText_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserRejectedText" DROP CONSTRAINT "_UserRejectedText_A_fkey";

-- AlterTable
ALTER TABLE "Text" DROP CONSTRAINT "Text_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Text_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Text_id_seq";

-- AlterTable
ALTER TABLE "_UserIgnoredText" ALTER COLUMN "A" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "_UserRejectedText" ALTER COLUMN "A" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "_UserRejectedText" ADD CONSTRAINT "_UserRejectedText_A_fkey" FOREIGN KEY ("A") REFERENCES "Text"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserIgnoredText" ADD CONSTRAINT "_UserIgnoredText_A_fkey" FOREIGN KEY ("A") REFERENCES "Text"("id") ON DELETE CASCADE ON UPDATE CASCADE;
