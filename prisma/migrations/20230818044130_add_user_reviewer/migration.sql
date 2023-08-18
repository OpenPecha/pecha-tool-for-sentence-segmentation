-- AlterTable
ALTER TABLE "User" ADD COLUMN     "categories" TEXT[],
ADD COLUMN     "reviewer_id" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
