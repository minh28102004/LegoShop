# Figure Lab responsive + VI/EN audit

Audit date: 2026-07-30

This document records the route inventory and baseline findings captured before
the responsive and localization fixes in this change set.

## Route inventory

### Customer website

- `/`
- `/business`
- `/cart`
- `/checkout`
- `/collection`
- `/loading-lab`
- `/login`
- `/order-success`
- `/order-tracking`
- `/payment/cancel`
- `/payment/success`
- `/privacy-policy`
- `/register`
- `/studio`
- `/studio/character`
- `/studio/frame`

### Admin

- `/login`
- `/dashboard`
- `/products`
- `/frame-options`
- `/accessories`
- `/characters`
- `/character-presets`
- `/frame-backgrounds`
- `/collections`
- `/banners`
- `/orders`
- `/orders/[id]`
- `/business-inquiries`
- `/business-inquiries/[id]`
- `/vouchers`
- `/payment-settings`
- `/profile`
- `/change-password`
- Legacy/hidden routes: `/templates`, `/template-categories`,
  `/accessory-categories`, `/frame-sizes`, `/frame-colors`

## Baseline responsive findings

| Area | Baseline status | Finding |
| --- | --- | --- |
| Customer pages | Pass with follow-up | No document-level horizontal overflow at the audited breakpoints. |
| `/studio/frame` | Pass with follow-up | No document-level horizontal overflow; the 360×640 tool content has one intentional scroll region. |
| `/studio/character` | Fail | Mobile and tablet create a page scroll plus a second internal vertical scroll region. |
| Admin shell | Pass with follow-up | Mobile off-canvas navigation works and the page stays within the viewport. |
| Admin tables | Needs hardening | Tables use their own horizontal scroller; the document must never inherit that width. |
| Admin modals/forms | Needs hardening | Long forms need viewport-safe height, single body scrolling, and stacked mobile actions. |

The Studio routes were measured at 360×640, 390×844, 768×1024, 1024×768,
1366×768, 1536×864, and 1920×1080. Customer and Admin route families were
sampled at their mobile, tablet, laptop, and desktop breakpoints before the
shared layout fixes.

## Baseline localization findings

- Both applications already use their own existing `I18nProvider`; no new
  localization runtime is needed.
- Locale persistence already exists (`figure-lab-locale` on Web and
  `admin_locale` on Admin).
- Dictionary parity was not enforced by a repository check.
- Admin entity management still contains direct `locale === 'vi'` UI copy and
  fixed `vi-VN` number/currency formatters.
- A small set of Web/Admin TSX files still contains hardcoded visible copy.
- Shared modal overlay labels and breadcrumb labels contain untranslated
  accessibility text.
- API failures need to be resolved through stable error codes before reaching
  toasts or validation summaries.

## Fix verification

### Browser matrix

- Viewports: `360x640`, `390x844`, `768x1024`, `1024x768`,
  `1366x768`, `1536x864`, and `1920x1080`.
- Customer routes checked: `/`, `/business`, `/cart`, `/checkout`,
  `/collection`, `/login`, `/register`, `/order-tracking`, `/payment/cancel`,
  `/payment/success`, `/privacy-policy`, `/studio/frame`, and
  `/studio/character`.
- Admin route families checked: dashboard, products, frames, accessories,
  character parts, character presets, frame backgrounds, collections, banners,
  orders, business inquiries, vouchers, payment settings, profile, and password
  change.
- Result: no document-level horizontal overflow in the checked matrix.
  Data tables keep their intentional local horizontal scrolling. Studio mobile
  uses normal page scrolling instead of a desktop-style nested workspace.

### Localization verification

- Web dictionaries: `vi=1426`, `en=1426`, missing in either locale: `0`.
- Admin dictionaries: `vi=686`, `en=686`, missing in either locale: `0`.
- The language switch updates the active UI and `html[lang]` immediately,
  survives reload, and does not remount the current form/cart/design state.
- Client page titles now follow the selected locale; collection and order
  tracking no longer duplicate the `Figure Lab` suffix.
- Prices and dates use locale-aware `Intl.NumberFormat` and
  `Intl.DateTimeFormat`.
- API failures pass through stable error-code resolvers before being shown in
  forms or toasts.

### Responsive fixes

- Hardened the customer header/mobile menu, tap targets, modal and drawer
  actions, card grids, long labels, images, and form controls.
- Removed unnecessary nested vertical scrolling from the character builder on
  mobile/tablet and kept the desktop Studio workspace inside the viewport.
- Made the frame Studio tool drawer overlay the canvas on compact screens,
  constrained panel bodies to one purposeful scroll region, and protected the
  canvas from scrollbars until zoomed content exceeds its viewport.
- Added viewport-safe Admin shell, toolbar, tables, filter drawers, modals,
  pagination, long forms, and stacked mobile actions.
- Replaced the deprecated Ant Design Drawer `width` prop with `size`.

### Automated checks

- `pnpm --filter web lint`
- `pnpm --filter admin lint`
- `pnpm --filter web typecheck`
- `pnpm --filter admin typecheck`
- `pnpm audit:i18n`
- `pnpm --filter web build`
- `pnpm --filter admin build`
