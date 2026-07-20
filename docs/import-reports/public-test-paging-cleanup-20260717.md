# Public `test-paging-*` cleanup — 2026-07-17

Completed at: `2026-07-17T14:07:05.0844239+07:00`

## Result

- Database/schema: `postgres.public`
- Target: `Product` where `name` or `slug` starts with `test-paging-`, created on DB local date `2026-07-17`
- Dry-run candidates: **35**
- Deleted: **35**
- Remaining in authorized date scope: **0**
- Deleted IDs still present: **0**
- `OrderItem` references: **0** before and after
- Orphan/reference errors: **0**
- Transaction: **COMMITTED** at `SERIALIZABLE` isolation

## Safety gates

The dry-run displayed all 35 records and verified exact count, prefix, creation date, zero `OrderItem` references, zero references across every foreign key targeting `public.Product`, and zero outbound `collectionId` relations. Immediately before deletion, the transaction locked and compared all rows against the backup. The transaction would roll back on any mismatch.

Backup: `data/import/backups/public-test-paging-products-20260717.json`

Backup SHA-256: `b40e77385bbe899dee39b11d7067d4de41aa40a75a24ce16abd669031f03f597`

## Protected data

| Entity | Before | After | Result |
|---|---:|---:|---|
| Product | 50 | 15 | Exactly 35 authorized rows removed |
| Collection | 2 | 2 | Unchanged |
| Banner | 2 | 2 | Unchanged |
| FrameBackground | 4 | 4 | Unchanged |
| Accessory | 2 | 2 | Unchanged |
| AccessoryCategory | 2 | 2 | Unchanged |

No Figure Lab import data was touched. The public schema does not contain the `SampleMediaImport` ledger used by the isolated import workflow.

## Verification

- Independent read-only post-commit audit: **PASS**
- `GET http://127.0.0.1:3003/public/products`: **HTTP 200**, returned 15 products
- Backend `pnpm --filter backend typecheck`: **PASS**
- Backend `pnpm --filter backend build`: **PASS**
- Temporary QA backend on port 3003: **stopped**

## Scope note

There are 13 older `test-paging-*` fixtures dated before `2026-07-17`. They were outside the explicitly authorized date scope and were preserved. Therefore, “remaining `test-paging-*` = 0” is satisfied for the authorized 2026-07-17 scope; the global all-date count is 13.
