-- CreateTable
CREATE TABLE "text" (
    "id" SERIAL NOT NULL,
    "original_text" TEXT NOT NULL,
    "modified_text" TEXT,
    "success" BOOLEAN,
    "modifier" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "text_pkey" PRIMARY KEY ("id")
);
