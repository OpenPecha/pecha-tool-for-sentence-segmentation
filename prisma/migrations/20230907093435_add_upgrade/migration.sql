-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ANNOTATOR', 'ADMIN', 'REVIEWER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "nickname" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assigned_batch" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "role" "Role" NOT NULL DEFAULT 'ANNOTATOR',
    "reviewer_id" TEXT,
    "allow_assign" BOOLEAN DEFAULT false,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Text" (
    "id" SERIAL NOT NULL,
    "original_text" TEXT NOT NULL,
    "modified_text" TEXT,
    "status" "Status",
    "modified_by_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "batch" INTEGER DEFAULT 0,
    "version" TEXT DEFAULT '',
    "reviewed" BOOLEAN,
    "reviewed_by_id" TEXT,
    "reject_count" INTEGER DEFAULT 0,
    "category" TEXT DEFAULT 'GEN',
    "duration" TEXT,

    CONSTRAINT "Text_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_key" ON "User"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "_UserRejectedText_AB_unique" ON "_UserRejectedText"("A", "B");

-- CreateIndex
CREATE INDEX "_UserRejectedText_B_index" ON "_UserRejectedText"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserIgnoredText_AB_unique" ON "_UserIgnoredText"("A", "B");

-- CreateIndex
CREATE INDEX "_UserIgnoredText_B_index" ON "_UserIgnoredText"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Text" ADD CONSTRAINT "Text_modified_by_id_fkey" FOREIGN KEY ("modified_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Text" ADD CONSTRAINT "Text_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserRejectedText" ADD CONSTRAINT "_UserRejectedText_A_fkey" FOREIGN KEY ("A") REFERENCES "Text"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserRejectedText" ADD CONSTRAINT "_UserRejectedText_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserIgnoredText" ADD CONSTRAINT "_UserIgnoredText_A_fkey" FOREIGN KEY ("A") REFERENCES "Text"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserIgnoredText" ADD CONSTRAINT "_UserIgnoredText_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
