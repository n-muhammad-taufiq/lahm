# Lahm Customer App Decisions

**Status:** Owner decisions captured on 2026-11-01; architecture recommendations remain proposals until the complete plan is approved.

## Owner-confirmed product decisions (2026-11-01)

| ID | Decision | Planning consequence |
|---|---|---|
| O-01 | Initial market is Chennai, Tamil Nadu; Android and iOS are required. | Scope regional launch and verify both platforms. |
| O-02 | Guest browsing and cart building are allowed; sign-in is required before checkout/order placement. | Preserve cart through authentication. |
| O-03 | General home uses department selectors; no bottom tab bar. Orders and Account are reachable from the home header/profile menu. | Design navigation around the home/header and make destinations discoverable. |
| O-04 | All three merchant verticals launch: groceries, meat shops and restaurants. | Three complete storefront experiences are required. |
| O-05 | Merchants define product customization groups/options dynamically. | Do not hardcode options; backend must validate and snapshot selected choices and price differences in orders. |
| O-06 | Delivery serviceability rules are deferred. | Keep this open; decide before implementing service eligibility/checkout and before launch. |
| O-07 | Checkout includes item subtotal, fixed ₹5 platform fee, GST and delivery charge; GST rule is deferred. | ₹5 is fixed; tax rate/base and delivery serviceability remain blockers for final totals. |
| O-08 | COD only at launch. | No online payment integration in initial scope; define cash collection/status lifecycle before production. |
| O-09 | One merchant and one outlet per order. | Cart/order scope follows this rule. |
| O-10 | No scheduled orders and no customer cancellation at launch. | Do not expose these customer actions. |
| O-11 | After courier assignment show live map, courier contact by phone, and delivery OTP. | Requires real courier location data flow and assignment-aware details. |
| O-12 | Order updates are in-app only. | No push/SMS/email notifications in initial scope. |
| O-13 | Customer support is by phone. | Add support call path; number and operating process need definition. |
| O-14 | The app must be real and production grade for customers, not a mockup. | Require real backend behavior, failure handling, security, data correctness and release verification. |
| O-15 | Keep the customer app on Expo SDK 58. | Use Expo 58 documentation and verify all customer dependencies/build tooling against SDK 58. Merchant and delivery remain on SDK 57 unless separately changed. |

Feature behavior, edge cases and acceptance criteria will still be discussed and agreed before implementing each feature.

## Confirmed from repository inspection

| ID | Observation | Status |
|---|---|---|
| F-01 | This is an existing monorepo with customer, merchant and delivery Expo apps, shared `@lahm/api`, `@lahm/ui`, `@lahm/tokens`, and NestJS/TypeORM backend. | Confirmed in files |
| F-02 | Customer order creation is server-priced; optional `outletId` scopes price/stock and distance; current order items contain product ID/quantity and snapshot name/price. | Confirmed in DTO/service/entity |
| F-03 | Addresses and orders have authenticated role/ownership checks; inspected outlet controller has no guards and merchant controller has unguarded update routes. | Confirmed in inspected controllers; security intent requires audit |
| F-04 | Customer home route imports `CustomerHomeScreen`; `NewHomeScreen` exists but the checked-in root route does not mount it. | Confirmed in current checkout; conflicts with handoff entry |
| F-05 | Customer manifest declares Expo 58 / RN 0.88; merchant and delivery declare Expo 57 / RN 0.86. | Confirmed from package manifests; installed graph not verified |
| F-06 | No customer address client/UI, payment flow, orders UI, product customization persistence, or grocery/meat storefront UI was found. | Confirmed by source inventory; no claim about remote deployments |
| F-07 | Current working tree has user changes/deletion/untracked home files. | Confirmed at analysis start; preserve and review |

## Proposed architecture choices

| ID | Recommendation | Rationale / alternatives |
|---|---|---|
| A-01 | Keep current monorepo and feature-based customer organization; Expo Router files remain thin route bridges. | Fits current code and avoids a parallel app or unnecessary restructuring. |
| A-02 | TanStack Query owns backend state; Zustand owns only shared cart/auth; local view state remains local. | Aligns project rules and avoids duplicate server caches. Current ad hoc discovery/storefront effects should migrate when touched. |
| A-03 | Enforce one merchant and one outlet per order. | Owner-confirmed and matches the current backend direction. |
| A-04 | Backend is authoritative for price, inventory, order status and ownership. Add customization snapshots/server validation before selling configurable items. | Current customer UI exposes incomplete customizations and order model has no option snapshot. |
| A-05 | Use existing Axios client and shared services; add typed contract-matched services/hooks. | Avoids duplicate HTTP client and invented endpoints. |
| A-06 | Use teal, white and black as the customer brand palette, NativeWind and native accessible patterns. | Owner-confirmed direction; exact token shades are checked during feature specs. |
| A-07 | Build customer workflows in C0–C11 dependency sequence in implementation plan. | Contracts/security and runtime choices precede screens dependent on them. |

## Still unresolved; do not assume

| ID | Question | Blocking work |
|---|---|---|
| D-01 | Confirm INR for launch price display/storage. | C0/C8 currency handling |
| D-02 | Define delivery serviceability method/limits. Owner explicitly deferred this. | Before C4/C6/C8 service eligibility and launch |
| D-03 | Define GST rate/base and authoritative source with responsible business/tax owner. Owner explicitly deferred this. | Before C8 final checkout totals and launch |
| D-04 | Define COD collection/settlement, failed delivery treatment and payment status. | C1/C8/C9 |
| D-05 | Define source/cadence/retention/access for live courier coordinates and support phone operating details. | C1/C9/C10 |
| D-06 | Define editable profile fields. | C10 |
| D-07 | Define production backend hosting and Android/iOS distribution/release process. | C0/C11 |

Unresolved items are not silently selected. Routine details can follow an approved feature spec; decisions affecting pricing, fulfillment, security, app structure or customer promises must be settled before that feature is implemented.

## Verification record

No tests, builds, or source mutations were performed while writing this planning package. The host `npm` launcher failed because its configured `npm-cli.js` path is missing. Manifest inspection is not evidence that dependencies are installed or compatible.
