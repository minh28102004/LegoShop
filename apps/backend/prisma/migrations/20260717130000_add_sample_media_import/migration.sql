-- Additive metadata used by the authorized sample-media import.
ALTER TABLE "AccessoryCategory"
ADD COLUMN IF NOT EXISTS "seedTag" TEXT;

ALTER TABLE "Accessory"
ADD COLUMN IF NOT EXISTS "price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "slug" TEXT,
ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "naturalWidth" INTEGER,
ADD COLUMN IF NOT EXISTS "naturalHeight" INTEGER,
ADD COLUMN IF NOT EXISTS "sourceKey" TEXT,
ADD COLUMN IF NOT EXISTS "sourceHash" TEXT,
ADD COLUMN IF NOT EXISTS "seedTag" TEXT,
ADD COLUMN IF NOT EXISTS "metadata" JSONB;

ALTER TABLE "Banner"
ADD COLUMN IF NOT EXISTS "naturalWidth" INTEGER,
ADD COLUMN IF NOT EXISTS "naturalHeight" INTEGER,
ADD COLUMN IF NOT EXISTS "sourceKey" TEXT,
ADD COLUMN IF NOT EXISTS "sourceHash" TEXT,
ADD COLUMN IF NOT EXISTS "seedTag" TEXT,
ADD COLUMN IF NOT EXISTS "metadata" JSONB;

ALTER TABLE "FrameBackground"
ADD COLUMN IF NOT EXISTS "slug" TEXT,
ADD COLUMN IF NOT EXISTS "category" TEXT,
ADD COLUMN IF NOT EXISTS "thumbnailUrl" TEXT,
ADD COLUMN IF NOT EXISTS "naturalWidth" INTEGER,
ADD COLUMN IF NOT EXISTS "naturalHeight" INTEGER,
ADD COLUMN IF NOT EXISTS "sourceKey" TEXT,
ADD COLUMN IF NOT EXISTS "sourceHash" TEXT,
ADD COLUMN IF NOT EXISTS "seedTag" TEXT,
ADD COLUMN IF NOT EXISTS "metadata" JSONB;

ALTER TABLE "Collection"
ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "naturalWidth" INTEGER,
ADD COLUMN IF NOT EXISTS "naturalHeight" INTEGER,
ADD COLUMN IF NOT EXISTS "sourceKey" TEXT,
ADD COLUMN IF NOT EXISTS "sourceHash" TEXT,
ADD COLUMN IF NOT EXISTS "seedTag" TEXT,
ADD COLUMN IF NOT EXISTS "metadata" JSONB;

CREATE TABLE IF NOT EXISTS "SampleMediaImport" (
    "id" TEXT NOT NULL,
    "seedTag" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "destinationUrl" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "thumbnailStoragePath" TEXT,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "naturalWidth" INTEGER NOT NULL,
    "naturalHeight" INTEGER NOT NULL,
    "targetEntity" TEXT,
    "targetRecordId" TEXT,
    "operation" TEXT,
    "previousData" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SampleMediaImport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AccessoryCategory_seedTag_idx" ON "AccessoryCategory"("seedTag");
CREATE UNIQUE INDEX IF NOT EXISTS "Accessory_slug_key" ON "Accessory"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Accessory_sourceKey_key" ON "Accessory"("sourceKey");
CREATE INDEX IF NOT EXISTS "Accessory_status_sortOrder_idx" ON "Accessory"("status", "sortOrder");
CREATE INDEX IF NOT EXISTS "Accessory_categoryId_status_sortOrder_idx" ON "Accessory"("categoryId", "status", "sortOrder");
CREATE INDEX IF NOT EXISTS "Accessory_seedTag_idx" ON "Accessory"("seedTag");

CREATE UNIQUE INDEX IF NOT EXISTS "Banner_sourceKey_key" ON "Banner"("sourceKey");
CREATE INDEX IF NOT EXISTS "Banner_seedTag_idx" ON "Banner"("seedTag");
CREATE INDEX IF NOT EXISTS "Banner_status_sortOrder_idx" ON "Banner"("status", "sortOrder");

CREATE UNIQUE INDEX IF NOT EXISTS "FrameBackground_slug_key" ON "FrameBackground"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "FrameBackground_sourceKey_key" ON "FrameBackground"("sourceKey");
CREATE INDEX IF NOT EXISTS "FrameBackground_category_status_sortOrder_idx" ON "FrameBackground"("category", "status", "sortOrder");
CREATE INDEX IF NOT EXISTS "FrameBackground_seedTag_idx" ON "FrameBackground"("seedTag");

CREATE UNIQUE INDEX IF NOT EXISTS "Collection_sourceKey_key" ON "Collection"("sourceKey");
CREATE INDEX IF NOT EXISTS "Collection_status_sortOrder_idx" ON "Collection"("status", "sortOrder");
CREATE INDEX IF NOT EXISTS "Collection_seedTag_idx" ON "Collection"("seedTag");

CREATE UNIQUE INDEX IF NOT EXISTS "SampleMediaImport_seedTag_sourceKey_key" ON "SampleMediaImport"("seedTag", "sourceKey");
CREATE INDEX IF NOT EXISTS "SampleMediaImport_seedTag_idx" ON "SampleMediaImport"("seedTag");
CREATE INDEX IF NOT EXISTS "SampleMediaImport_sourceHash_idx" ON "SampleMediaImport"("sourceHash");
CREATE INDEX IF NOT EXISTS "SampleMediaImport_targetEntity_targetRecordId_idx" ON "SampleMediaImport"("targetEntity", "targetRecordId");
