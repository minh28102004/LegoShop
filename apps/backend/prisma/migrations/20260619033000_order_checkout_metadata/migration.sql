ALTER TABLE "Order"
ADD COLUMN "province" TEXT,
ADD COLUMN "district" TEXT,
ADD COLUMN "ward" TEXT,
ADD COLUMN "note" TEXT,
ADD COLUMN "shippingMethod" TEXT,
ADD COLUMN "shippingFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "giftPackage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "giftFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "polaroidOption" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN "polaroidFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "itemsAmount" INTEGER NOT NULL DEFAULT 0;

UPDATE "Order"
SET "itemsAmount" = "totalAmount"
WHERE "itemsAmount" = 0;

ALTER TABLE "OrderItem"
ADD COLUMN "frameSizeId" TEXT,
ADD COLUMN "frameSizeLabel" TEXT,
ADD COLUMN "frameColorName" TEXT,
ADD COLUMN "accessories" JSONB;
