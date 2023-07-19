/*
  Warnings:

  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "text" DROP CONSTRAINT "text_modified_by_id_fkey";

-- AlterTable
ALTER TABLE "text" ALTER COLUMN "modified_by_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "user" DROP CONSTRAINT "user_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_id_seq";

-- AddForeignKey
ALTER TABLE "text" ADD CONSTRAINT "text_modified_by_id_fkey" FOREIGN KEY ("modified_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
