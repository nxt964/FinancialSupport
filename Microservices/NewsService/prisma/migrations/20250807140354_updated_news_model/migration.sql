-- CreateTable
CREATE TABLE "public"."News" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "content" TEXT,
    "sentimentLabel" TEXT,
    "sentimentScore" DOUBLE PRECISION,
    "coverImageUrl" TEXT,
    "author" TEXT,
    "publishedDate" TIMESTAMP(3) NOT NULL,
    "crawledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);
