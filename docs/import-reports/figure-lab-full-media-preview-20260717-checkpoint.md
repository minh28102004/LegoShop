# Figure Lab full import checkpoint — 2026-07-17

## Outcome

The full import is **blocked before apply**. The mandatory durable-storage persistence test stopped before uploading anything because `STORAGE_PUBLIC_BASE_URL` and the related local Supabase Storage configuration are absent.

No database import writes or storage uploads were performed. No commit, push, deploy, Render change, deletion, fixture cleanup, or cleanup35 rerun was performed.

## Backup

- File: `data/import/backups/figure-lab-public-pre-full-import-20260717T072933Z.json`
- Size: 22,965 bytes
- SHA-256: `87cf8321ef7317305201e5153c31333ce88446c5d0cd2a5596a528858c8bb3a3`
- Verified public counts: Product 15, Banner 2, Collection 2, FrameBackground 4, Accessory 2, AccessoryCategory 2, SampleMediaImport 0.

## Full dry-run

- Manifest records: 210/210 read.
- Unique media downloaded and processed: 202.
- Duplicate hash groups: 7.
- Errors: 0.
- Uploads/inserts/updates: 0/0/0.
- Planned runtime targets: Accessory 92, Banner 5, Collection 6, FrameBackground 48, Product 41.
- Ledger/storage-only homepage assets: 18.

Detailed reports:

- `data/import/reports/figure-lab-full-media-preview-20260717-dry-run.json`
- `docs/import-reports/figure-lab-full-media-preview-20260717-dry-run.md`

## Storage persistence gate

Command: `pnpm --filter backend test:sample-media-storage`

Result: failed before upload with `STORAGE_PUBLIC_BASE_URL is required`. No temporary object was created.

Before continuing, add the following values to the gitignored `apps/backend/.env.local`. Keep the secret local; do not paste it into chat or commit it.

```dotenv
DATABASE_SCHEMA=public
IMPORT_SAMPLE_ASSETS=false
IMPORT_PREVIEW_MODE=true
IMPORT_SEED_TAG=figure-lab-full-media-preview-20260717
SAMPLE_MEDIA_STORAGE_PROVIDER=supabase
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SECRET_KEY=<backend-only-secret>
SUPABASE_STORAGE_BUCKET=<public-bucket>
STORAGE_PUBLIC_BASE_URL=https://<project>.supabase.co/storage/v1/object/public/<public-bucket>
INCLUDE_STAGED_SAMPLE_MEDIA=true
STAGED_SAMPLE_MEDIA_SEED_TAG=figure-lab-full-media-preview-20260717
```

Rerun the persistence test. Only after it passes may `IMPORT_SAMPLE_ASSETS=true` be enabled and the public staged apply run with concurrency 1.

## Validation completed

- Backend typecheck: passed.
- Backend build: passed.
- Focused backend lint: passed.
- `git diff --check`: passed.
- Public API with preview disabled: passed; observed products 14, collections 2, banners 2, frame backgrounds 4, accessories 2, visible accessory categories 1.

Browser preview QA, the idempotency rerun, and rollback dry-run were not run because the mandatory storage gate did not pass.

## Final read-only database check

The final public-schema check still matches the pre-apply baseline: Product 15, Banner 2, Collection 2, FrameBackground 4, Accessory 2, AccessoryCategory 2, SampleMediaImport 0, Order 13, and OrderItem 17. The current seed tag has 0 ledger rows, and all 13 pre-existing `test-paging-*` fixtures remain untouched.
