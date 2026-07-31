# Figure Lab minifigure catalog import

This importer copies real component images from
`data/minifigs-catalog-clean.json` into the existing public Supabase Storage
bucket and upserts the existing `CharacterPart` table.

## Existing schema reused

- Table: `CharacterPart`
- Unique key: `slug` (`minifigs-{safeSourceId}`)
- Front image: `imageUrl`
- Catalog/source, Storage paths, back image URL, alt text, inventory flags, and
  composition compatibility: `compatibility`
- Search/filter labels: `category` and `tags`
- Storage bucket: `SUPABASE_STORAGE_BUCKET` (currently `figure-lab-media`)

No new table or migration is required. Imported records use
`compatibility.source = "minifigs-catalog"` and never delete manually managed
records.

## Category mapping

| Source category                                  | Studio part type |
| ------------------------------------------------ | ---------------- |
| Hair & Hats (hair collections)                   | `HAIR`           |
| Hair & Hats (explicit hats/headwear collections) | `HAT`            |
| Bodies                                           | `TORSO`          |
| Legs                                             | `LEGS`           |
| Accessories                                      | `ACCESSORY`      |

`No Hat or Hair` is represented by the Studio “No selection” action. Gift
Display stays outside `CharacterPart`. Heads and Skin Tones are not mocked.

## Run

Configure the existing backend-only variables in
`apps/backend/.env.local` or `apps/backend/.env`:

```dotenv
DATABASE_URL=
SUPABASE_URL=
SUPABASE_SECRET_KEY=
SUPABASE_STORAGE_BUCKET=
STORAGE_PUBLIC_BASE_URL=
```

Preview the import:

```bash
pnpm --filter backend import:minifig-images:dry
```

Apply it with the explicit write guard:

```bash
IMPORT_MINIFIG_ASSETS=true pnpm --filter backend import:minifig-images
```

PowerShell:

```powershell
$env:IMPORT_MINIFIG_ASSETS='true'
pnpm --filter backend import:minifig-images
```

Optional importer arguments are `--concurrency=N`, `--retries=N`, and
`--limit=N`. The importer retries downloads, limits concurrency, reuses
unchanged Storage objects, preserves existing database IDs, continues after an
individual image error, and writes a JSON report under
`data/import/reports/`.

## Pricing

Catalog prices are used only to select a small project-friendly surcharge
inside each part type. Hair is kept around 5,000-15,000 VND, hats
8,000-18,000 VND, torsos 10,000-50,000 VND, legs 5,000-30,000 VND, and
accessories 5,000-25,000 VND. Values are rounded to the nearest 1,000 VND and
written to `CharacterPart.priceAdjustment`. Source price, currency, pricing
strategy, and tier rules are retained in `compatibility` for audit. Re-running
the importer refreshes prices without re-uploading unchanged images.

## Preview composition

The source assets are product photos with different framing and dimensions.
Studio keeps their proportions and fits each image into a stable slot for hair,
hat, torso, legs, face, or accessory. They are tagged with
`compositionMode: "slot"`; legacy full-canvas layers continue to use their
existing composition. Front/back switching uses the imported Supabase back
image when one exists.
