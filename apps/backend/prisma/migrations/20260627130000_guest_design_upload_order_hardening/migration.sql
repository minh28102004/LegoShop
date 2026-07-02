-- Guest checkout fields, public tracking hardening, stock semantics, and admin audit history.

CREATE TYPE "OrderStatusHistoryType" AS ENUM ('ORDER_STATUS', 'PAYMENT_STATUS', 'SHIPPING_STATUS', 'NOTE');

ALTER TABLE "FrameBackground"
ADD COLUMN "frameOptionIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "FrameOption"
ALTER COLUMN "stock" DROP DEFAULT;

ALTER TABLE "FrameOption"
ALTER COLUMN "stock" DROP NOT NULL;

UPDATE "FrameOption"
SET "stock" = NULL
WHERE "stock" = 0;

ALTER TABLE "Order"
ADD COLUMN "zalo" TEXT,
ADD COLUMN "addressLine" TEXT,
ADD COLUMN "expiresAt" TIMESTAMP(3),
ADD COLUMN "cancelReason" TEXT;

ALTER TABLE "PaymentSetting"
ALTER COLUMN "codDepositEnabled" SET DEFAULT true;

ALTER TABLE "PaymentSetting"
ALTER COLUMN "codDepositPercent" SET DEFAULT 30;

UPDATE "PaymentSetting"
SET "codDepositEnabled" = true,
    "codDepositPercent" = 30
WHERE "id" = 'default-payment-setting'
  AND "codDepositPercent" = 0;

CREATE TABLE "OrderStatusHistory" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "type" "OrderStatusHistoryType" NOT NULL,
  "fromValue" TEXT,
  "toValue" TEXT,
  "note" TEXT,
  "changedByAdminId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrderStatusHistory_orderId_createdAt_idx"
ON "OrderStatusHistory"("orderId", "createdAt");

CREATE INDEX "OrderStatusHistory_changedByAdminId_idx"
ON "OrderStatusHistory"("changedByAdminId");

ALTER TABLE "OrderStatusHistory"
ADD CONSTRAINT "OrderStatusHistory_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderStatusHistory"
ADD CONSTRAINT "OrderStatusHistory_changedByAdminId_fkey"
FOREIGN KEY ("changedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
