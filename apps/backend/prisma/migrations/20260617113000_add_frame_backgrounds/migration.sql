CREATE TABLE "FrameBackground" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "status" "ProductStatus" NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "FrameBackground_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FrameBackground_status_sortOrder_idx" ON "FrameBackground"("status", "sortOrder");

INSERT INTO "FrameBackground" ("id", "title", "imageUrl", "sortOrder", "status", "createdAt", "updatedAt")
VALUES
  ('shared-bg-template-1', 'Graduation Frame Background', '/shared/images/bg_template/1.png', 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('shared-bg-template-2', 'Frame Background 2', '/shared/images/bg_template/2.png', 2, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('shared-bg-template-3', 'Frame Background 3', '/shared/images/bg_template/3.png', 3, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('shared-bg-template-4', 'Frame Background 4', '/shared/images/bg_template/4.png', 4, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Banner" ("id", "title", "imageUrl", "linkUrl", "sortOrder", "status", "createdAt", "updatedAt")
SELECT
  'shared-banner-desktop',
  'Desktop hero banner',
  '/shared/images/banner/desktop.png',
  NULL,
  0,
  'active',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "Banner" WHERE "imageUrl" = '/shared/images/banner/desktop.png'
);
