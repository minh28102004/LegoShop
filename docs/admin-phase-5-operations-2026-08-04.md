# Admin Phase 5 — Operational modules

Audit date: 2026-08-04

## Scope and result

| Module | Admin flow | API / website consumer | Result |
| --- | --- | --- | --- |
| Orders | Search by order code, customer name, phone or email; filter by order/payment/shipping/payment-method state; inspect snapshots; perform guarded state transitions | `AdminOrdersService`; public order tracking reads order-item snapshots | Fixed and covered by tests |
| Vouchers | List derived operational state; validate dates, value and usage limits; create/edit/delete | `VouchersService` is shared by public voucher validation and checkout order creation | Fixed and covered by tests |
| Business contacts | Create normalized inquiry; Admin search/filter/detail; update operational state | Public business inquiry form and Admin business-inquiry routes | Verified; normalization covered by tests |
| Dashboard | Revenue, customer count, 7-day revenue trend, order-state distribution and recent orders | `/admin-dashboard/stats` | Replaced inaccurate client-side/fallback metrics with API data |
| Settings / RBAC | Payment settings remain Admin-only; all `/admin/*` and `/admin-dashboard/*` endpoints require server-side Admin role | `JwtAuthGuard` | Fixed P0 authorization gap and covered by tests |

## Orders

The list supports the operational filters already exposed by the Admin API. State changes now use shared transition maps rather than arbitrary enum changes.

- Order: `pending -> confirmed|cancelled`, `confirmed -> processing|cancelled`, `processing -> shipping|cancelled`, `shipping -> completed|cancelled`; terminal states cannot be reopened.
- Shipping: `pending -> preparing|cancelled`, `preparing -> shipping|cancelled`, `shipping -> delivered|cancelled`; terminal states cannot be reopened.
- Payment transitions use a dedicated payment-state map; refunded is terminal.
- Cancelling an order restores stock once, writes order and shipping histories, and synchronizes shipping to `cancelled`.
- The Admin status selectors only show the current and valid next states.
- Public tracking and Admin detail use `OrderItem` snapshots (`productName`, `price`, `accessories`, `designData`, `componentSnapshot`, `previewUrl`), so historical orders do not depend on later catalog edits/deletes.

Order totals continue to use the persisted order snapshot: item subtotal, gift/polaroid options, discount/voucher, shipping fee and final total. The audit did not introduce a destructive migration.

## Vouchers

Manual availability and operational state are now separated.

- Manual switch: enabled/disabled (`status`) remains because an operator must be able to stop a voucher.
- Effective state is derived as `active`, `scheduled`, `expired`, `exhausted` or `disabled` from the switch, time window and usage limit.
- Admin list renders the effective state instead of showing a misleading generic status.
- Partial edits validate the merged existing/new start and end dates.
- Usage increments atomically and cannot pass the configured limit.
- Deletion is blocked when the voucher has usage or is referenced by an order.
- Public validation and checkout both use `VouchersService`; there is no separate client-side business rule.

## Business contacts

These states are operational and intentionally retained: `new`, `contacted`, `processing`, `done`, `cancelled`. They are not catalog availability states.

Before persistence, the public create flow trims names/messages, lowercases email, and normalizes Vietnamese phone numbers. Admin list/detail already provide search, state filtering and state updates.

## Dashboard

- Revenue counts paid orders at full value and deposit-paid orders at the paid deposit amount; unpaid, cancelled and refunded money is excluded.
- Customer count is the number of distinct phone numbers on non-cancelled orders.
- The seven-day trend is returned by the API with all seven dates filled.
- Order-state distribution is calculated from all orders, not only the latest page.
- The inaccurate top-products approximation was removed because the current snapshots do not provide a reliable aggregate for that card.
- The Admin dashboard now displays an API error with retry instead of silently substituting a misleading fallback.

## RBAC and technical debt

Authentication alone no longer grants access to Admin APIs. `JwtAuthGuard` enforces the `admin` role on `/admin/*` and `/admin-dashboard/*`, including the `/api` prefix, while leaving authenticated customer routes unchanged.

The current schema has roles but no granular permissions. Phase 5 deliberately does not introduce a large permission migration. Fine-grained permissions remain technical debt; backend authorization must be extended before any future UI-only permission controls are added.

## Automated verification

- Backend typecheck: passed.
- Backend Jest: 41 suites, 64 tests passed.
- Dedicated coverage includes Admin RBAC path enforcement, order transition/cancellation synchronization, voucher effective states/date validation/atomic usage, dashboard payment-aware metrics and business-contact normalization.
