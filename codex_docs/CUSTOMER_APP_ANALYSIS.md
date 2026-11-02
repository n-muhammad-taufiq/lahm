# Lahm Customer App — Repository Analysis

**Status:** Initial source review, read-only  
**Review date:** 2026-11-01  
**Scope:** Customer mobile app, shared frontend packages, and backend contracts needed by customer journeys.

## Executive summary

Lahm already has a useful full-stack foundation, but the customer journey is incomplete. The repository contains real discovery, outlet storefront, authentication, address, order, and delivery building blocks. Several are not yet connected into a complete customer journey, and some existing contracts conflict with the agreed product requirements. The app is not ready for a production release today.

This is a source-level inventory, not a claim that every runtime path or deployment environment has been verified. Existing worktree changes were preserved. No files were changed and no tests or builds were run during this analysis.

## Confirmed product decisions

- Launch market: Chennai, Tamil Nadu; iOS and Android.
- Expo SDK 58 is the chosen customer-app baseline and is already present in the customer package manifest.
- Customers may browse before signing in. Authentication is required to place an order; the cart should remain available through sign-in.
- Home is a general marketplace with department selectors for grocery, meat, and restaurants. Do not use a persistent bottom tab bar. Orders and account access belong in an agreed header/profile menu pattern.
- Search should cover merchants and products, with distance, price, and availability filters.
- Storefronts share a common foundation but may use vertical-specific presentation.
- Merchants define product customization groups/options dynamically. The customer selects the available options when adding a product.
- One merchant and one outlet per order.
- Checkout total includes item subtotal, fixed ₹5 platform fee, GST, and delivery charges. COD is the initial payment method.
- No customer cancellation or scheduled orders in the initial scope.
- After courier assignment, show live map tracking, a phone contact action, and the delivery OTP.
- Support contact is by phone; order updates are shown in the app.
- Brand palette direction: teal, white, and black. The current design is to be replaced.
- Feature specifications and edge cases must be discussed and agreed before implementation. Deferred pricing/serviceability policy decisions remain deferred and must not be guessed.

## Repository state and structure

- Monorepo contains `frontend/apps/customer`, merchant and delivery apps, shared `frontend/packages/api`, `ui`, and `tokens` packages, and a NestJS/PostgreSQL backend.
- Customer route files currently include root, home, login, and shop detail routes. Root and home routes render `CustomerHomeScreen`.
- A newer `NewHomeScreen` exists in the working tree but is not mounted by the root route. It currently includes a bottom navigation component and its own design choices, so it is not the agreed final UI.
- `@lahm/tokens` and `@lahm/ui` exist. The UI package has a small set of shared components; the design system needs an explicit customer-app audit and documented direction before feature UI work.
- Existing roadmap and app instruction files include older assumptions, including SDK 57, bottom tabs, a different product emphasis, and a past target date. They are not a substitute for this customer-specific plan.
- The Git working tree was already modified before this planning work. Those changes and older drafts are intentionally preserved.

## Feature status inventory

| Area | Status | Evidence and gap |
|---|---|---|
| Guest browsing | PARTIAL | Root route opens a home screen without login. Complete guest-to-checkout gating and cart preservation are not demonstrated. |
| Phone authentication | PARTIAL / BLOCKED | Firebase phone-auth integration and backend auth exist. The shared phone-auth service can return simulated success/mock tokens if config/verifier is missing or Firebase fails; production behavior must fail closed. |
| Location | PARTIAL | Customer location hook uses device location and reverse geocoding. Saved-address selection and permission-denied/manual selection journey need completion. |
| Home discovery | PARTIAL | Nearby merchant endpoint and customer hook exist. Hook uses local `useEffect` fetching rather than TanStack Query. Department filtering/search behavior needs contract review. |
| Marketplace search/filters | MISSING / PARTIAL | Merchant search exists. Catalog search is scoped to one merchant. Marketplace product search and distance/price/availability filters are not established end-to-end. |
| Merchant storefront | PARTIAL | Outlet storefront and catalog/category API hooks exist. Customer UI appears restaurant-specific; grocery/meat layouts and shared product detail flow are not complete. |
| Product customization | PARTIAL / BLOCKED | Backend customization groups/options and catalog response types exist. Cart/order DTOs do not carry a validated selected-option snapshot and pricing through checkout. |
| Outlet pricing/availability | PARTIAL | Outlet and outlet-product data, storefront response, and cart branch metadata exist. End-to-end availability validation, branch switch confirmation, and cart identity need verification. |
| Cart | PARTIAL | Zustand cart handles one merchant/outlet and computes a client display subtotal. It does not persist, encode customizations, or ask before replacing contents on merchant/outlet change. |
| Address book | PARTIAL | Customer-only backend CRUD/default-address endpoints exist. A customer-facing shared API service, query hooks, and screens were not found in the reviewed feature set. |
| Checkout/pricing | PARTIAL / BLOCKED | Backend calculates product prices, delivery fee, and order total. Platform fee constant is ₹1, not agreed ₹5. GST is absent from the order pricing model. COD/payment method is not recorded. |
| Order creation/history/detail | PARTIAL | Customer create/history/detail endpoints and shared API functions exist. Customer routes/screens and complete journey need implementation. |
| Order lifecycle/security | NEEDS VERIFICATION | Order status transitions and role checks exist. Audit idempotency, concurrent stock safety, customer-safe response projection, and failure behavior before release. |
| Courier assignment/tracking | PARTIAL / NEEDS VERIFICATION | Delivery allocation and courier location write operations exist. Customer-readable live-location contract, polling/stream strategy, privacy projection, and contact details need verification. |
| Delivery OTP | PARTIAL | Backend generates and verifies a 4-digit OTP. Confirm only the authorized customer sees it and design expiry/attempt/rate-limit handling. |
| Tests/build | NEEDS VERIFICATION | Backend tests exist for core areas. Customer build/lint and full journey validation were not run; the available npm launcher fails because its referenced npm CLI file is missing. |

## High-priority findings

1. **Authentication must be production-safe.** Remove or strictly isolate simulated OTP success and mock-token paths from release builds; verify Firebase and backend registration behavior.
2. **Authorization needs a focused API audit.** `outlets` create/update routes have no visible guards in the controller. Delivery-partner lookup/update routes also need ownership and role review. Do not expose management APIs publicly.
3. **Order pricing contract is incomplete.** Change the fixed platform fee only after a reviewed spec; add tax/payment snapshots as agreed. Keep all price calculation authoritative on the server and expose a consistent itemized quote.
4. **Customization must survive the whole order lifecycle.** Validate selections and option price deltas on the server, persist a snapshot on order items, and return that snapshot in history/receipts.
5. **Tracking responses need least-privilege data.** Review serialized order relations before customer UI consumes them; expose only courier fields needed for name, phone, and current location.
6. **Avoid fabricated fallback data.** The source contains a development OTP simulation and home copy that implies verified/certified claims. Production UI must use server-backed facts and honest empty/error states.

## Constraints and open policy decisions

- GST calculation/rate and its taxable base are not specified here; the customer has deferred this decision.
- Delivery serviceability rules and exact delivery-fee policy are deferred. Existing backend formula is not approved as the final business policy.
- Confirm whether browsing and cart must work without location permission, and what manual location/address path is acceptable.
- Confirm search ranking, category taxonomy, and whether filters are marketplace-wide or also available within a store.
- Confirm customization price display/rounding and whether selected options may be changed after adding to cart.
- Confirm order update refresh behavior (poll interval vs push/realtime) after reviewing backend capabilities and operating cost.
- Confirm which customer profile fields are editable and whether profile completion is needed before checkout.

## Current recommendation

Do not start feature implementation yet. First agree the customer-app UI direction/design-system spec and the foundational guest/auth/location journey. Then discuss, specify, and approve each feature batch before implementation. See `IMPLEMENTATION_PLAN.md` for the proposed order and gates.
