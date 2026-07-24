-- Extend the existing product/character catalog without replacing legacy data.
ALTER TABLE "Product"
  ADD COLUMN "shortDescription" TEXT,
  ADD COLUMN "compareAtPrice" INTEGER,
  ADD COLUMN "thumbnailUrl" TEXT,
  ADD COLUMN "category" TEXT,
  ADD COLUMN "availability" TEXT NOT NULL DEFAULT 'available',
  ADD COLUMN "inventory" INTEGER,
  ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "characterPresetId" TEXT;

ALTER TABLE "CharacterPart"
  ADD COLUMN "slug" TEXT,
  ADD COLUMN "compareAtPrice" INTEGER,
  ADD COLUMN "category" TEXT,
  ADD COLUMN "availability" TEXT NOT NULL DEFAULT 'available',
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "compatibility" JSONB;

ALTER TABLE "CharacterPreset"
  ADD COLUMN "slug" TEXT,
  ADD COLUMN "previewImageUrl" TEXT,
  ADD COLUMN "isBuilderPreset" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "isSellable" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "facePartId" TEXT,
  ADD COLUMN "hairPartId" TEXT,
  ADD COLUMN "torsoPartId" TEXT,
  ADD COLUMN "legsPartId" TEXT,
  ADD COLUMN "hatPartId" TEXT;

ALTER TABLE "OrderItem"
  ADD COLUMN "lineItemType" TEXT,
  ADD COLUMN "customName" TEXT,
  ADD COLUMN "componentSnapshot" JSONB;

CREATE TABLE "CharacterPresetAccessory" (
  "presetId" TEXT NOT NULL,
  "partId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CharacterPresetAccessory_pkey" PRIMARY KEY ("presetId", "partId")
);

CREATE UNIQUE INDEX "CharacterPart_slug_key" ON "CharacterPart"("slug");
CREATE UNIQUE INDEX "CharacterPreset_slug_key" ON "CharacterPreset"("slug");

CREATE INDEX "Product_characterPresetId_idx" ON "Product"("characterPresetId");
CREATE INDEX "Product_published_status_idx" ON "Product"("published", "status");
CREATE INDEX "Product_category_status_idx" ON "Product"("category", "status");
CREATE INDEX "CharacterPreset_isBuilderPreset_status_sortOrder_idx"
  ON "CharacterPreset"("isBuilderPreset", "status", "sortOrder");
CREATE INDEX "CharacterPreset_isSellable_status_sortOrder_idx"
  ON "CharacterPreset"("isSellable", "status", "sortOrder");
CREATE INDEX "CharacterPresetAccessory_partId_idx"
  ON "CharacterPresetAccessory"("partId");
CREATE INDEX "CharacterPresetAccessory_presetId_sortOrder_idx"
  ON "CharacterPresetAccessory"("presetId", "sortOrder");

ALTER TABLE "Product"
  ADD CONSTRAINT "Product_characterPresetId_fkey"
  FOREIGN KEY ("characterPresetId") REFERENCES "CharacterPreset"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CharacterPreset"
  ADD CONSTRAINT "CharacterPreset_facePartId_fkey"
  FOREIGN KEY ("facePartId") REFERENCES "CharacterPart"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CharacterPreset"
  ADD CONSTRAINT "CharacterPreset_hairPartId_fkey"
  FOREIGN KEY ("hairPartId") REFERENCES "CharacterPart"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CharacterPreset"
  ADD CONSTRAINT "CharacterPreset_torsoPartId_fkey"
  FOREIGN KEY ("torsoPartId") REFERENCES "CharacterPart"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CharacterPreset"
  ADD CONSTRAINT "CharacterPreset_legsPartId_fkey"
  FOREIGN KEY ("legsPartId") REFERENCES "CharacterPart"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CharacterPreset"
  ADD CONSTRAINT "CharacterPreset_hatPartId_fkey"
  FOREIGN KEY ("hatPartId") REFERENCES "CharacterPart"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CharacterPresetAccessory"
  ADD CONSTRAINT "CharacterPresetAccessory_presetId_fkey"
  FOREIGN KEY ("presetId") REFERENCES "CharacterPreset"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CharacterPresetAccessory"
  ADD CONSTRAINT "CharacterPresetAccessory_partId_fkey"
  FOREIGN KEY ("partId") REFERENCES "CharacterPart"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
