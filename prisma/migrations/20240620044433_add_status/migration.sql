-- CreateEnum
CREATE TYPE "AppStatus" AS ENUM ('Activated', 'Paused');

-- CreateTable
CREATE TABLE "System" (
    "id" TEXT NOT NULL,
    "status" "AppStatus"
);

-- CreateIndex
CREATE UNIQUE INDEX "System_id_key" ON "System"("id");
