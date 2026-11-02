# Lahm Customer App — Implementation Plan

**Status:** For owner review; implementation has not started.  
**Target:** Production-grade customer app for Chennai, Tamil Nadu, on Android and iOS. Customer app stays on Expo 58. Merchant and delivery apps are outside this plan.

## Confirmed product direction

- Guests can browse and build a cart; sign-in is required at checkout and the cart must survive sign-in.
- General home with department selectors; no bottom tab bar. Orders and Account are reachable from the home header/profile menu.
- Grocery, meat and restaurant storefronts; product customization groups/options are merchant-defined and dynamic.
- One merchant and one outlet per order. COD only. Checkout includes item subtotal, fixed ₹5 platform fee, GST and delivery charge.
- No scheduled orders or customer cancellation at launch.
- After courier assignment, show a live map, courier phone action and delivery OTP. Order updates are in-app only. Lahm support is by phone.
- GST and delivery serviceability are deliberately deferred. They do not block unrelated work, but final checkout totals and delivery eligibility cannot be called production-ready until agreed.
- Before each feature, review a written specification covering user flow, rules, edge cases, API contract, states, acceptance criteria and tests.

## Existing implementation

- Customer Expo Router routes: index, home, login and shop/[id]. Root currently renders CustomerHomeScreen; the newer NewHomeScreen is not mounted by the inspected root route.
- Firebase phone OTP auth and shared auth session store exist.
- Nearby merchant API/client and device location/reverse-geocoding hook exist.
- Restaurant storefront, recursive categories and outlet-scoped catalog/pricing exist. Grocery and meat storefronts are not implemented.
- Zustand cart supports one merchant/outlet and quantities, but is memory-only and lacks the complete cart/checkout experience.
- Shared API, UI and token packages exist. Orders API client supports create/history/detail.
- Backend modules exist for auth, merchants/products, outlets, addresses, orders and courier allocation.

## Missing or incomplete

- Grocery/meat storefronts, product detail, and dynamic customization selection.
- Shop and product search plus distance, price and availability filters. Existing merchant search matches shop name/city/address; product search and the requested filters need real API contracts.
- Guest cart preservation through sign-in and confirmation before switching merchant/outlet.
- Address API client and customer screens/routes; backend address endpoints already exist.
- Checkout/COD status lifecycle; GST and serviceability deferred.
- Customer order history/detail/tracking UI.
- Customer-facing live courier-location read API. Courier location writes/storage exist, but customer reads were not found.
- Profile editing contract, preferences/settings and customer support phone entry.

## Important production risks

- Customer manifest declares Expo 58.0.22, React Native 0.88.1 and React 19.3.0. Expo 58 is owner-confirmed. The npm launcher fails because npm-cli.js is missing, so installed dependency compatibility and builds are unverified.
- Order responses load courier entity/user relations. Backend must return only approved customer-visible fields, so banking/license data cannot leak. OTP must appear only after courier assignment.
- Order creation reads stock before its transaction; no stock decrement/lock or idempotency key was observed.
- Static Chennai coordinates exist in customer location types; verify they are not runtime defaults and remove any sample-coordinate fallback.
- Some merchant/outlet endpoints appear unguarded; verify intended access and enforce authorization.
- Pre-existing working-tree changes and a deleted file must be preserved and reviewed, never reset or overwritten.

## Architecture

- Keep the existing monorepo and Expo Router. Routes remain thin; customer features live under the customer app. Share only genuine common components/contracts through @lahm/ui, @lahm/tokens and @lahm/api.
- Data flow: route/screen → feature hook using TanStack Query → typed @lahm/api service → NestJS → PostgreSQL.
- TanStack Query owns server data. Zustand owns auth session and shared cart. Keep local toggles local; clear user-scoped cache at logout.
- Use shared product/catalog contracts with vertical-specific grocery, meat and restaurant layouts. Outlet ID scopes inventory, price and fulfillment.
- Fetch merchant-defined options dynamically. Backend validates option IDs/constraints, recalculates price deltas and snapshots selected options on the order.
- Keep one merchant/outlet per cart. Preserve guest cart on sign-in; confirm before replacing it.
- Backend owns prices, stock, payment/order status and authorization. Add an assignment-scoped courier-location read projection and return only approved courier fields.
- Reuse existing Axios, Firebase, NativeWind and tokens. Add no library until SDK 58 compatibility and a concrete need are verified.

## Dependency order and batches

### Mandatory design foundation before feature screens

After T0 foundations and before T1 home/discovery, agree and implement the customer design system and UI direction. This is a real foundation batch, not just a document review. Approve the visual rules, then update/extend shared tokens and @lahm/ui primitives for color roles, typography, spacing, radii, controls, product/list surfaces, loading/empty/error states, sheets, icons, accessibility and interaction feedback. Keep the owner-selected teal/white/black palette, department-selector home and no-bottom-tabs navigation. Use the detailed [design-system proposal](../../../docs/customer-app/CUSTOMER_APP_DESIGN_SYSTEM.md). Verify the primitives on Expo 58 before using them in feature screens.

| Batch | Work | Completion criteria |
|---|---|---|
| T0 Foundations | Restore package tooling; verify Expo 58 dependencies/build; audit API contracts, authorization, COD, customization snapshots, order integrity and courier projection. Review working-tree changes. | Supported checks run; contracts/security gaps documented; no unrelated changes overwritten. |
| T1 Home and discovery | Mount one general home with department selectors; real nearby shops; shop/product search; distance/price/availability filters and guest browsing. | Real API data, matching filter semantics, loading/empty/error/retry, refresh and location-denied/manual path; no fake coordinates. |
| T2 Catalog | Grocery/meat/restaurant layouts, outlet selection, product detail and dynamic merchant-defined customizations. | Correct outlet inventory/prices; option constraints and price deltas work; stale data and errors handled. |
| T3 Addresses | Address API service/hooks and list/create/edit/default/delete flows; GPS/manual input. | Ownership, validation, default swap, 20-address cap and permission-denied paths work. |
| T4 Cart | Guest cart with options/quantities, one merchant/outlet, auth continuity and explicit switch confirmation. | Cart survives sign-in; no silent replacement; server remains price authority. |
| T5 COD checkout | Sign-in gate, address/order review, order mutation, COD lifecycle, duplicate-submit and stock-concurrency safeguards. Add GST/serviceability as later substeps after decisions. | Server validates address/outlet/options; correct server total; failures preserve cart. GST/serviceability remain open gates. |
| T6 Orders and tracking | History/detail, in-app status, live courier map, phone action, assignment-only OTP and reorder. | Owner-scoped data; no courier private-field leakage; map freshness/loss states; polling stops at terminal status; reorder revalidates. |
| T7 Account | Profile, preferences/settings, address access and phone support. | Customer-owned data, persisted settings and working support call. No unapproved notification channels. |
| T8 Production gate | Unit/integration/E2E tests, lint/types/build, real-device journeys and production configuration/security/operations review. | Full browse→customize→guest cart→sign-in→address→COD→courier map/call/OTP→completion journey works on Android and iOS; no fake data/success. |

For every batch, first review its feature specification. Implementation then follows the repository's one-to-two-file incremental rule with validation after each code step. This plan does not authorize code before owner approval.

## Schedule and feasibility

The requested target is 2–3 days, maximum 4–5 days. An aggressive schedule is: Day 1 foundations and discovery; Day 2 catalogs, addresses and cart; Day 3 checkout and tracking; Day 4 account and device verification; Day 5 hardening and production builds.

This is not a reliable commitment yet. Search APIs, customization snapshots, COD lifecycle, stock/idempotency safeguards, live courier read/security, support data and two-platform verification are unfinished or unverified. A production-grade complete app in 2–3 days is not credible unless these dependencies, infrastructure and device/build access are already ready. Re-estimate after T0; do not drop production checks to meet the date.

## Validation commands

After repairing npm tooling and confirming dependencies:

- Customer TypeScript: npm --prefix frontend/apps/customer run build
- Backend compile: npm --prefix backend run build
- Backend tests: npm --prefix backend test -- --runInBand
- Backend e2e: npm --prefix backend run test:e2e -- --runInBand
- Customer lint: npm --prefix frontend/apps/customer run lint
- Backend lint: npm --prefix backend run lint (script uses auto-fix; inspect before running)
- Build merchant/delivery only if a shared package change requires it.

No checks were run for this plan. The earlier handoff log reports a customer TypeScript pass, but it was not rerun.

## Remaining decisions for relevant feature specifications

- Confirm INR as currency for all prices.
- Define COD collection/status, failed delivery and settlement.
- Define courier-location source/update cadence/privacy, support phone number/hours and editable profile fields.
- Define production backend hosting, distribution/release process and operational ownership.
- GST and delivery serviceability stay deferred until their affected features are specified.

## Recommended first implementation batch

After plan approval, start with **T0 Foundations**: restore npm tooling, verify the confirmed Expo 58 app build, and complete the API/security contract audit. Feature work cannot be responsibly verified while the package runner is broken.

The first customer-visible batch should then be **T1 Home and discovery**. It is the customer entry point and establishes guest browsing and department-selector navigation. Product search and filters must use real backend contracts, not mocked client-side results.

## Related planning documents

- [Requirements](../../../docs/customer-app/CUSTOMER_APP_REQUIREMENTS.md)
- [Architecture](../../../docs/customer-app/CUSTOMER_APP_ARCHITECTURE.md)
- [Design direction](../../../docs/customer-app/CUSTOMER_APP_DESIGN_SYSTEM.md)
- [Decisions](../../../docs/customer-app/CUSTOMER_APP_DECISIONS.md)
- [Progress](../../../docs/customer-app/CUSTOMER_APP_PROGRESS.md)
