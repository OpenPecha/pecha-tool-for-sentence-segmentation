/*
  Warnings:

  - The `duration` column on the `Text` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[id]` on the table `Text` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
CREATE SEQUENCE text_batch_seq;
ALTER TABLE "Text" ALTER COLUMN "batch" SET DEFAULT nextval('text_batch_seq'),
ALTER COLUMN "category" SET DEFAULT 'gen',
DROP COLUMN "duration",
ADD COLUMN     "duration" DOUBLE PRECISION DEFAULT 0,
ALTER COLUMN "modified_on" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "word_count" SET DEFAULT 0;
ALTER SEQUENCE text_batch_seq OWNED BY "Text"."batch";

-- CreateIndex
CREATE UNIQUE INDEX "Text_id_key" ON "Text"("id" DESC);
