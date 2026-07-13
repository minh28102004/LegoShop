DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'CharacterPartType'
  ) THEN
    CREATE TYPE "CharacterPartType" AS ENUM ('FACE', 'HAIR', 'TORSO', 'LEGS', 'ACCESSORY');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "CharacterPart" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "CharacterPartType" NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "priceAdjustment" INTEGER NOT NULL DEFAULT 0,
  "status" "ProductStatus" NOT NULL DEFAULT 'active',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "tags" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CharacterPart_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CharacterPart_type_status_sortOrder_idx"
  ON "CharacterPart"("type", "status", "sortOrder");

CREATE INDEX IF NOT EXISTS "CharacterPart_status_sortOrder_idx"
  ON "CharacterPart"("status", "sortOrder");
