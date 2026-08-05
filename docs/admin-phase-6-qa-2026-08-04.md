# Admin Phase 6 — Final page-by-page QA

QA date: 2026-08-04

## Method and limits

- Direct browser QA used the authenticated local Admin at `http://localhost:3001` and the local Website at `http://localhost:3002`.
- Core list routes were checked at 1280×720, 1366×768, 1536×864 and 1920×1080.
- The in-app browser does not expose browser zoom. The 125% case was therefore emulated with the equivalent 1024×576 CSS viewport for a 1280×720 screen. A literal Chrome 125% run remains a manual follow-up.
- Create/edit modals and delete confirmations were inspected without persisting or deleting production-like fixture rows. Backend create/update/delete rules and reference guards are covered by automated tests.
- Product pagination and Accessory/Frame Background pagination were exercised directly because those datasets contain multiple pages. One-page datasets correctly render no enabled next page.

## Route matrix

| Route | List | Create | Edit | Delete | Responsive | Website sync | Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/dashboard` | Real API metrics, trend, distribution and recent orders | N/A | N/A | N/A | Pass | N/A | Pass |
| `/products` | Search, filter, sort and pagination exercised | Modal, sections and required validation pass | Modal opens with existing data; no raw JSON | Confirmation pass; reference rules tested | Pass | Home and `/collection` load product data and images | Pass |
| `/frame-options` | Search, filter and sort controls pass | Modal pass; width/height/price now validate before request | Shared edit form inspected | Confirmation + backend reference tests | Pass | `/studio/frame` loads frame sizes and prices | Pass |
| `/accessories` | Search, category/date filter, sort and pagination pass | Modal and required validation pass | Shared edit form inspected | Confirmation + reference guard tests | Pass | Both Studio routes load accessory data/prices | Pass |
| `/characters` | Search, filter and sort pass; Availability replaces legacy Status | Modal pass | Shared edit form inspected | Confirmation + preset/product reference tests | Pass | `/studio/character` loads parts/prices/images | Pass |
| `/character-presets` | Empty state and search/filter/sort controls pass | Modal pass | N/A: local dataset is empty | N/A: local dataset is empty; relation guard tested | Pass | Character Builder renders the blank state and public preset contract | Pass with empty fixture |
| `/frame-backgrounds` | Search, status/date filter, sort and pagination pass | Modal pass | Shared edit form inspected | Confirmation + frame-reference tests | Pass | `/studio/frame` loads public active/order-sorted backgrounds | Pass |
| `/collections` | Search, active/date filter and sort pass | Modal pass | Shared edit form inspected | Confirmation + item relation checks | Pass | `/collection` loads 55 products without broken images | Pass |
| `/banners` | Search, active/date filter and sort pass | Modal pass | Shared edit form inspected | Confirmation pass | Pass | Homepage loader consumes active/order-sorted banners | Pass |
| `/orders` | Search, status filters and sort action pass | N/A | Detail and guarded state selectors pass | N/A | Pass | `/order-tracking` loads and Admin detail uses order snapshots | Pass |
| `/orders/[id]` | Customer, totals, shipping, items, preview, payments and status history supported | N/A | Valid next transitions only | N/A | Pass | Tracking uses persisted item/status snapshots | Pass |
| `/business-inquiries` | Search, state filter and sort action pass | Website-owned create flow | Detail and operational state selector pass | N/A | Pass | `/business` creates normalized inquiries | Pass |
| `/business-inquiries/[id]` | Detail loads fixture data | N/A | Operational state update UI present | N/A | Pass | Same inquiry record/API | Pass |
| `/vouchers` | Search, effective-status filter and sort action pass | Modal/date/value validation pass | Shared edit form inspected | Confirmation + order/usage guard tests | Pass | Checkout and Admin use the same voucher service | Pass |
| `/payment-settings` | Settings load | N/A | Form controls load | N/A | Pass | Checkout consumes payment settings | Pass |
| `/profile` | Profile loads | N/A | Profile UI loads | N/A | Pass | N/A | Pass |
| `/change-password` | Form loads | N/A | Validation controls load | N/A | Pass | N/A | Pass |
| `/accessory-categories` | Table loads | Modal available | Edit available | Confirmation available | Pass | Accessory category relation | Pass (internal route) |
| `/frame-sizes` | Table loads | Modal available | Edit available | Confirmation available | Pass | Legacy/internal route; main Studio uses frame options | Pass with technical-debt note |
| `/frame-colors` | Table loads | Modal available | Edit available | Confirmation available | Pass | Legacy/internal route | Pass with technical-debt note |
| `/template-categories` | Table loads | Modal available | Edit available | Confirmation available | Pass | Template relation | Pass (internal route) |
| `/templates` | Table loads | Modal available | Edit available | Confirmation available | Pass | Legacy template catalog | Pass with technical-debt note |

## Direct browser evidence

- Product search reached the translated empty state and clearing search restored data.
- Product pagination advanced to `Showing 21-40 of 56 products`.
- Accessory pagination advanced to `Showing 21-40 of 94 accessories`.
- Frame Background pagination advanced to `Showing 21-40 of 52 frame image backgrounds`.
- Search empty states were verified for Product, Frame, Accessory, Character Part, Character Preset, Frame Background, Collection, Banner, Order, Business Inquiry and Voucher.
- Filter drawers opened and closed on all 11 list modules above.
- Sort changed the first visible row on Product, Accessory, Character Part, Frame Background, Collection and Banner. One-page/single-row modules accepted the sort action without an error.
- Product edit dialog at 1280×720 measured about 1000×647 px, stayed inside the viewport and had no horizontal overflow.
- Create dialogs for Frame, Accessory, Character Part, Character Preset, Frame Background, Collection, Banner and Voucher stayed inside 1280×720; only the modal body scrolls.
- Product configuration has no horizontal scrollbar, and the normal form does not expose raw JSON.
- Empty Product and Accessory submissions stayed open and showed localized field/form validation.
- Frame required numbers no longer initialize to zero. Width and height require at least 0.1; price and stock cannot be negative.
- Order detail displayed persisted item names, prices, accessories/design snapshots, totals and payment logs without depending on live catalog rows.
- Business Inquiry detail loaded its operational state and showed no page overflow.

## Responsive results

- No horizontal page overflow was found on the core routes at 1280, 1366, 1536 or 1920 widths.
- At the 125%-equivalent logical viewport, narrow tables use their own horizontal container only when their configured minimum width exceeds the available content width. The document itself does not scroll horizontally.
- Table headers, 64–72 px rows, 44–52 px thumbnails, action columns and modal boundaries remained stable.
- Auxiliary routes (`payment-settings`, account routes and internal catalog routes) also had no horizontal document overflow at 1280×720.

## Acceptance criteria

1. Generic Status is absent from Product, Accessory, Frame Option and Character Part. Character Part shows the business field Availability.
2. Accessory uses the full `Category` header; no `D...`/ambiguous header remains.
3. Truncated table values have a native title/tooltip path.
4. No horizontal document scroll was found in the tested desktop viewports.
5. Product Config has no horizontal scrollbar.
6. Tested create/edit modals fit the viewport.
7. Shared modal uses fixed header/footer rows and a scrolling body.
8. Product's normal create/edit flow has no raw JSON editor.
9. Module forms use module-specific fields and sections.
10. Core table modules have individual width policies.
11. No console errors were emitted on the tested Admin or Website routes. The login-only Three.js deprecation warning below remains pre-existing.
12. Admin, Backend and Website TypeScript checks pass.
13. Admin production build passes.
14. Backend Jest passes: 41 suites / 64 tests.
15. Homepage, Collection, Studio Frame, Studio Character and Order Tracking loaded API-backed data with zero broken completed images in the direct QA pass.

## Remaining issues / follow-up

| Severity | Issue | Related area | Recommended next step |
| --- | --- | --- | --- |
| P2 | Literal browser zoom 125% was not available in the in-app browser; an equivalent CSS viewport was used. | All Admin routes | Run one final Chrome/Edge manual pass at browser zoom 125%. |
| P3 | Login emits `THREE.Clock` deprecation from `@react-three/fiber` with Three.js 0.184. No Admin route after login emits a warning/error, and builds are clean. | Admin login 3D scene / dependencies | Upgrade the Three/R3F pair together in a dedicated dependency task and re-test the login scene. |
| P3 | `/frame-sizes`, `/frame-colors` and `/templates` remain internal/legacy routes outside the main sidebar flow. | Admin routing/catalog | Decide whether to formally retire or expose them; do not migrate/delete data during QA. |
| P3 | Destructive delete was intentionally stopped at the confirmation dialog for fixture data. | Catalog modules | If required, run a seeded disposable-database CRUD suite in CI rather than deleting shared local fixtures. |

## Automated verification

- `pnpm --filter @lego-shop/shared build`: passed.
- `pnpm --filter @lego-shop/api build`: passed.
- `pnpm --filter backend typecheck`: passed.
- `pnpm --filter backend build`: passed.
- `pnpm --filter backend test -- --runInBand`: 41 suites, 64 tests passed.
- `pnpm --filter admin typecheck`: passed.
- `pnpm --filter admin build`: passed; all 24 Admin routes generated.
- `pnpm --filter web typecheck`: passed.
- `pnpm --filter web build`: passed; all 18 Website routes generated.
