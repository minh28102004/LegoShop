-- Catalog setup for finished products, retail parts, and real character management.

ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "productType" TEXT NOT NULL DEFAULT 'finished',
ADD COLUMN IF NOT EXISTS "componentConfig" JSONB,
ADD COLUMN IF NOT EXISTS "collectionId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Product_collectionId_fkey'
  ) THEN
    ALTER TABLE "Product"
    ADD CONSTRAINT "Product_collectionId_fkey"
    FOREIGN KEY ("collectionId") REFERENCES "Collection"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Product_productType_status_idx" ON "Product"("productType", "status");
CREATE INDEX IF NOT EXISTS "Product_collectionId_idx" ON "Product"("collectionId");

CREATE TABLE IF NOT EXISTS "Character" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "price" INTEGER NOT NULL DEFAULT 10000,
  "imageUrl" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "status" "ProductStatus" NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Character_status_sortOrder_idx" ON "Character"("status", "sortOrder");

ALTER TABLE "OrderItem"
ADD COLUMN IF NOT EXISTS "frameOptionId" TEXT,
ADD COLUMN IF NOT EXISTS "backgroundId" TEXT;
