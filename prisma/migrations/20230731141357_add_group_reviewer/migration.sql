-- AlterTable
ALTER TABLE "Text" ADD COLUMN     "reviewed_text" TEXT,
ADD COLUMN     "reviewer_id" TEXT;

-- AddForeignKey
ALTER TABLE "Text" ADD CONSTRAINT "Text_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
