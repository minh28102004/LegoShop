-- Manual rollback for the additive sample-media schema migration.
-- Run only after the sample-media import rollback has removed tagged data.
DROP TABLE IF EXISTS "SampleMediaImport";

DROP INDEX IF EXISTS "Collection_seedTag_idx";
DROP INDEX IF EXISTS "Collection_status_sortOrder_idx";
DROP INDEX IF EXISTS "Collection_sourceKey_key";

ALTER TABLE "Collection"
DROP COLUMN IF EXISTS "metadata",
DROP COLUMN IF EXISTS "seedTag",
DROP COLUMN IF EXISTS "sourceHash",
DROP COLUMN IF EXISTS "sourceKey",
DROP COLUMN IF EXISTS "naturalHeight",
DROP COLUMN IF EXISTS "naturalWidth",
DROP COLUMN IF EXISTS "sortOrder";

DROP INDEX IF EXISTS "FrameBackground_seedTag_idx";
DROP INDEX IF EXISTS "FrameBackground_category_status_sortOrder_idx";
DROP INDEX IF EXISTS "FrameBackground_sourceKey_key";
DROP INDEX IF EXISTS "FrameBackground_slug_key";

DROP INDEX IF EXISTS "Banner_seedTag_idx";
DROP INDEX IF EXISTS "Banner_status_sortOrder_idx";
DROP INDEX IF EXISTS "Banner_sourceKey_key";

DROP INDEX IF EXISTS "Accessory_seedTag_idx";
DROP INDEX IF EXISTS "Accessory_categoryId_status_sortOrder_idx";
DROP INDEX IF EXISTS "Accessory_status_sortOrder_idx";
DROP INDEX IF EXISTS "Accessory_sourceKey_key";
DROP INDEX IF EXISTS "Accessory_slug_key";
DROP INDEX IF EXISTS "AccessoryCategory_seedTag_idx";

ALTER TABLE "FrameBackground"
DROP COLUMN IF EXISTS "metadata",
DROP COLUMN IF EXISTS "seedTag",
DROP COLUMN IF EXISTS "sourceHash",
DROP COLUMN IF EXISTS "sourceKey",
DROP COLUMN IF EXISTS "naturalHeight",
DROP COLUMN IF EXISTS "naturalWidth",
DROP COLUMN IF EXISTS "thumbnailUrl",
DROP COLUMN IF EXISTS "category",
DROP COLUMN IF EXISTS "slug";

ALTER TABLE "Banner"
DROP COLUMN IF EXISTS "metadata",
DROP COLUMN IF EXISTS "seedTag",
DROP COLUMN IF EXISTS "sourceHash",
DROP COLUMN IF EXISTS "sourceKey",
DROP COLUMN IF EXISTS "naturalHeight",
DROP COLUMN IF EXISTS "naturalWidth";

ALTER TABLE "Accessory"
DROP COLUMN IF EXISTS "metadata",
DROP COLUMN IF EXISTS "seedTag",
DROP COLUMN IF EXISTS "sourceHash",
DROP COLUMN IF EXISTS "sourceKey",
DROP COLUMN IF EXISTS "naturalHeight",
DROP COLUMN IF EXISTS "naturalWidth",
DROP COLUMN IF EXISTS "sortOrder",
DROP COLUMN IF EXISTS "slug";

ALTER TABLE "AccessoryCategory"
DROP COLUMN IF EXISTS "seedTag";
