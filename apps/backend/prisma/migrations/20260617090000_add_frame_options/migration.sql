-- CreateEnum
CREATE TYPE "FrameOptionType" AS ENUM ('size', 'color', 'template', 'material', 'glass', 'mat', 'accessory');

-- CreateTable
CREATE TABLE "FrameOption" (
    "id" TEXT NOT NULL,
    "type" "FrameOptionType" NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT,
    "slug" TEXT,
    "description" TEXT,
    "colorHex" TEXT,
    "imageUrl" TEXT,
    "widthCm" DOUBLE PRECISION,
    "heightCm" DOUBLE PRECISION,
    "price" INTEGER NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minQuantity" INTEGER NOT NULL DEFAULT 1,
    "maxQuantity" INTEGER NOT NULL DEFAULT 99,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "status" "ProductStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FrameOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FrameOption_slug_key" ON "FrameOption"("slug");

-- CreateIndex
CREATE INDEX "FrameOption_type_status_idx" ON "FrameOption"("type", "status");

-- CreateIndex
CREATE INDEX "FrameOption_sortOrder_idx" ON "FrameOption"("sortOrder");

-- Backfill existing frame sizes into the unified frame options table.
INSERT INTO "FrameOption" (
    "id",
    "type",
    "name",
    "label",
    "slug",
    "price",
    "popular",
    "status",
    "createdAt",
    "updatedAt"
)
SELECT
    'size-' || "id",
    'size'::"FrameOptionType",
    "label",
    "label",
    'size-' || "id",
    "price",
    "popular",
    "status",
    "createdAt",
    "updatedAt"
FROM "FrameSize";

-- Backfill existing frame colors into the unified frame options table.
INSERT INTO "FrameOption" (
    "id",
    "type",
    "name",
    "slug",
    "colorHex",
    "status",
    "createdAt",
    "updatedAt"
)
SELECT
    'color-' || "id",
    'color'::"FrameOptionType",
    "name",
    'color-' || "id",
    "colorHex",
    "status",
    "createdAt",
    "updatedAt"
FROM "FrameColor";

-- Backfill existing design templates into the unified frame options table.
INSERT INTO "FrameOption" (
    "id",
    "type",
    "name",
    "slug",
    "imageUrl",
    "metadata",
    "status",
    "createdAt",
    "updatedAt"
)
SELECT
    'template-' || "id",
    'template'::"FrameOptionType",
    "name",
    'template-' || "id",
    "imageUrl",
    "configJson",
    "status",
    "createdAt",
    "updatedAt"
FROM "Template";
