CREATE TABLE "Feedback" (
  "id" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "productType" TEXT NOT NULL,
  "quote" TEXT NOT NULL,
  "rating" INTEGER NOT NULL DEFAULT 5,
  "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "status" "ProductStatus" NOT NULL DEFAULT 'inactive',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Feedback_status_sortOrder_idx" ON "Feedback"("status", "sortOrder");
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");
