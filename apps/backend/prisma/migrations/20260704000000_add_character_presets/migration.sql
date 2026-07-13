-- CreateTable
CREATE TABLE "CharacterPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "faceHint" TEXT,
    "hairHint" TEXT,
    "torsoHint" TEXT,
    "legsHint" TEXT,
    "hatHint" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ProductStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterPreset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CharacterPreset_status_sortOrder_idx" ON "CharacterPreset"("status", "sortOrder");
