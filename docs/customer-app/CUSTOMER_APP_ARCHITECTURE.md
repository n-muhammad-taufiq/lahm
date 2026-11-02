# Lahm Customer App Architecture

**Status:** Proposed, grounded in the existing monorepo; requires review before feature implementation.  
**Current flow:** Expo Router customer app → feature code → `@lahm/api` Axios services → NestJS controllers/services → TypeORM/PostgreSQL.

## 1. Application boundaries and structure

Keep the existing monorepo and customer app. Keep `frontend/apps/customer/src/app` as thin Expo Router route bridges. Organize customer behavior by feature; share only genuinely cross-app primitives/contracts through `@lahm/ui`, `@lahm/tokens`, and `@lahm/api`.

```text
apps/customer/src/
  app/                         # route bridges and layouts
  features/
    auth/{screens,components,hooks,schemas,types}
    home/{screens,components,hooks}
    search/{screens,components,hooks,types}
    merchant/{screens,components,hooks,types}
    cart/{screens,components,hooks,store,types}
    addresses/{screens,components,hooks,schemas,types}
    checkout/{screens,components,hooks,schemas,types}
    orders/{screens,components,hooks,components,types}
    account/{screens,components,hooks}
    location/{hooks,types}
packages/{api,ui,tokens}/
```

Do not move working code solely to match this diagram. Extract/rename only when a feature step requires it. Keep route files declarative, avoid customer imports from merchant/delivery apps, and keep business rules in the backend or feature hooks/domain helpers.

## 2. Navigation

Use Expo Router as the sole route source. Owner direction is a general home with department selectors and no bottom tab bar. Put Orders and Account entry points in the home header/profile menu; use stack routes for merchant, product, cart, checkout, order detail and address management. Allow guest browsing/cart building; require authentication before checkout and preserve the guest cart across sign-in. Route transitions use typed route params and IDs, not serialized server objects. Feature specs must verify that Orders, Account, search and cart stay easy to find without bottom tabs.

The current app has `index`, `home`, `login`, and `shop/[id]`; there is no tabs layout. The checked-in root route renders `CustomerHomeScreen`; a proposed new home screen is not currently mounted. Mount the approved department-selector home through Expo Router and avoid competing home entry points.

## 3. Data and state ownership

- **TanStack Query:** server-owned merchants, categories, outlet storefront, addresses, profile, cart revalidation/quote if an endpoint is defined, and orders. Query keys include relevant user/merchant/outlet/coordinates; use `enabled` guards and bounded polling for active orders. Invalidate affected keys on successful mutations; clear user-scoped queries at logout.
- **Zustand:** shared client cart and auth session only. Cart is currently in-memory and does not persist. Decide whether persistence is required; if used, scope/clear it by user and avoid persisting credentials outside existing SecureStore.
- **Local component state:** visible sheet, active local filters or text input draft; derive totals/views instead of duplicating them as state.
- Replace ad hoc fetch-in-`useEffect` patterns in discovery/storefront with query hooks as each feature is revisited. Do not mirror query results into Zustand.

## 4. API and contract strategy

Reuse the shared Axios client and `@lahm/api` services. Add typed API functions only after matching them to existing controllers, DTO validation and service behavior. Hooks own query/mutation lifecycle; screens render state and invoke callbacks. Do not call Axios in UI components.

Existing services include auth, merchants, products, outlets and orders. Missing customer client service: addresses. Missing client operations: customer order status/cancel; profile updates; payment. Backend contracts absent or incomplete for vertical-filtered discovery, product search, delivery coverage/quote, discount validation and payment. Verify whether currently public merchant/outlet endpoints are intentional; several inspected controllers do not apply auth guards, while address/order routes do. Authorization remediation is backend work and must be included before exposing sensitive capabilities.

`api/client.ts` chooses an environment URL, attempts Expo host detection, and finally falls back to a fixed LAN address. It attaches a stored access token and has error formatting, but no observed 401 refresh/replay flow despite a backend refresh endpoint. Treat URL configuration, token expiry/refresh races, refresh-token rotation and offline timeout behavior as architecture work to verify before production. Do not echo secrets from local `.env` files.

## 5. Authentication and forms

Reuse Firebase phone verification and NestJS ID-token exchange in `@lahm/api`; keep the current customer-specific registration semantics explicit. Auth initialization currently blocks root layout behind profile loading and a 3-second splash failsafe. Verify session bootstrap and ensure a network timeout does not silently clear a still-valid session. Add query cache clearing on logout. Use React Hook Form + Zod for multi-field address/profile forms if installed/approved; otherwise keep validation schema logic small and typed. Country/phone rules must follow an agreed supported-region policy; current shared default is UAE (+971), inconsistent with the India-focused launch context.

## 6. Catalog, merchant verticals and outlets

Use merchant category and product vertical data from APIs. Treat outlet as the fulfillment/pricing/inventory scope. The current restaurant flow fetches outlets, selects one and uses `/outlets/:id/storefront`; branch product availability and override pricing originate from `OutletProduct`. Keep `outletId` in the cart and order payload. Validate stale outlet/product data on checkout and handle a branch closing between browse and order.

Product contracts already include merchant-defined customization groups/options and price deltas, but cart/order DTO and `OrderItem` currently carry only product ID, quantity and base snapshot name/price. Fetch options dynamically for each product; do not hardcode option lists. Before configurable ordering, design backend validation for option IDs/constraints and snapshots of selected option identity/name/price; recalculate totals server-side. Grocery, meat and restaurant presentations can differ while using shared product, price and availability contracts.

## 7. Cart, checkout and payment data flow

```text
Guest product selection → cart store (merchantId + outletId + product/customization selection)
→ sign-in gate (preserve cart) → selected owned address → serviceability/total validation (rules pending)
→ POST /orders
→ backend validates IDs, stock and outlet; calculates authoritative totals
→ returned OrderResponse → order detail/tracking query
```

COD is the confirmed method. Checkout includes item subtotal, fixed ₹5 platform fee, GST and delivery charge; GST/serviceability rules are deferred. Define COD collection confirmation, failed-delivery treatment, settlement and payment status. GST/serviceability must be resolved before final checkout totals and launch. Current order creation reads stock before its transaction, does not decrement/lock inventory, and has no idempotency key; address concurrency and duplicate submission. Never simulate payment or delivery coverage.

## 8. Fulfillment tracking and customer communication

After courier assignment, show a live map, courier phone action and delivery OTP. The backend currently has an authenticated courier location write endpoint and stores coordinates/timestamp, but no customer-facing location read contract was found. Add an authenticated, order-assignment-scoped projection with freshness/error behavior and a defined privacy/retention policy. Customer order responses currently load the courier entity/user relation; project only approved fields (for example name, phone and live coordinates) so bank, license and other private courier data cannot leak. OTP is returned on order responses today; change this to assignment-aware exposure as required by the owner. Customer support is by phone; order updates are in-app only at launch (no push, SMS or email).

## 9. Error handling, loading and accessibility

Use shared UI primitives where they exist and add reusable primitives only for repeated concepts. Every query screen provides layout-matched loading, empty, error/retry and success states. Every mutation has pending/disabled feedback, success navigation/cache handling, and recoverable errors without losing user-entered data. Respect safe areas, keyboard dismissal/persistence, screen-reader semantics, reduced motion, touch targets and image loading failures. The current UI package has buttons, inputs, form fields, selection fields, location status and auth components; it does not yet provide the full planned skeleton/error/empty/card/stepper set.

## 10. Performance, security and observability

- Keep nearby discovery and catalogs paginated when backend contracts support it; avoid loading all products for large catalogs.
- Use image caching/resizing primitives supported by the resolved Expo SDK; avoid unnecessary nested scroll views and rerenders.
- Never trust client totals, role, ownership, outlet membership, stock or selected option pricing. Enforce these in backend DTO/service/transaction boundaries.
- Customer data endpoints must be authenticated and customer scoped. Validate public read/write endpoints and ensure order detail/OTP visibility is owner-safe.
- Courier live location and contact are disclosed only for the courier assigned to that customer's order, with only the minimum approved response fields. Never serialize the full courier entity into a customer response.
- Audit static Chennai coordinate constants in the customer location feature; discovery and delivery flows must use actual device/manual input or backend-owned merchant/outlet coordinates, never fallback sample coordinates.
- Capture actionable request errors without logging OTPs, access tokens, addresses or other sensitive payloads.
- Add analytics/crash reporting only after the repository has a chosen provider and privacy/consent requirements.

## 10. Compatibility and decisions

Owner confirmed the customer app will stay on Expo SDK 58. Its manifest declares Expo `58.0.22`, React Native `0.88.1`, React `19.3.0`, Expo Router `~58.0.29`; merchant and delivery remain on Expo 57 / React Native 0.86. Follow SDK 58 documentation for customer work and avoid changing the other apps. A package-manager listing could not be run because the host npm launcher is broken (`npm-cli.js` missing); manifest versions are verified, installed versions are not. Recheck dependency compatibility/build tooling with a working package manager before native feature implementation.

Recommended alternatives: keep one shared app-wide QueryClient rather than one per screen; use existing Axios/services rather than introducing a second networking abstraction; use native Expo/React Native controls and current bottom-sheet package only after checking compatibility; avoid adding payment/location/map providers until business requirements and credentials/contracts are known.
