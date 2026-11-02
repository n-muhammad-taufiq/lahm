# Lahm Customer App Requirements

**Status:** Planning baseline, based on repository inspection on 2026-11-01.  
**Scope:** Customer app and the customer-facing backend/API work it depends on. Merchant and courier apps are out of implementation scope.

**Owner-confirmed direction:** Initial market is Chennai, Tamil Nadu; Android and iOS; guest browsing and cart building; home department selectors without a bottom tab bar, with Orders and Account reachable from the header/profile menu; all three merchant verticals; COD; one merchant and branch per order; no scheduled orders or customer cancellation; courier phone call; in-app-only order updates; Lahm customer support by phone. Delivery serviceability and GST rules are explicitly deferred.

**Runtime decision:** Keep the customer app on Expo SDK 58. Merchant and delivery apps remain on their current Expo 57 versions unless separately changed.

## Product outcome

A customer can discover a real grocery store, meat shop, or restaurant; choose the fulfilling outlet; browse that outlet's live catalog; place and follow an order; and manage account and delivery details. The interface must communicate actual availability, prices, location and order state without fabricated data.

## Current implementation baseline

Present in the checkout: Firebase phone auth flow and profile bootstrap; nearby merchant discovery; location permission and reverse geocoding; a restaurant storefront with recursive categories, outlet selection and outlet-scoped inventory/pricing; a Zustand cart; shared API, UI and token packages. The current root route renders `CustomerHomeScreen`. `NewHomeScreen` and supporting redesign files exist, but the inspected root route does not mount them. The current storefront dispatcher only implements restaurants; other verticals show an under-development message. No customer address screens/API client, checkout, customer orders screens, payment integration, or account screens/routes were found. Some discovery/storefront reads use component effects/local state instead of TanStack Query.

These are code observations, not claims that deployment data or all runtime paths have been verified.

## Functional requirements

### Identity and account

- Allow guest browsing and cart building; require sign-in before checkout/order placement.
- Register and log in with verified phone OTP; preserve role separation and handle existing accounts, registration details, resend cooldown, Firebase/network errors, and expired sessions.
- Restore a persisted session at launch; show a deterministic signed-out state if profile validation fails. Logout clears in-memory and secure tokens and query data belonging to that identity.
- Provide profile, saved addresses, preferences/settings, in-app order information and phone support, as requested. `GET /auth/me` exists; no customer profile update contract was found, so define editable fields and backend ownership behavior before implementation. Logout clears the local session; support uses a configured phone contact.

### Location and delivery address

- Request foreground location only in relevant journeys; explain denial and offer manual location/address entry. Never substitute fabricated coordinates.
- Create, list, view, update, set default, and delete saved addresses through the existing customer-scoped `/addresses` endpoints. Respect the 20-address cap, first-address default, atomic default swap, and backend ownership enforcement.
- Keep device discovery coordinates distinct from the selected delivery address. Validate delivery coverage and quote availability before order placement; no coverage/quote endpoint was found. The owner deferred the serviceability rule; decide and implement it before promising coverage.

### Discovery and search

- Home supports the three verticals through department selectors, real nearby merchants, location context, search, refresh, loading/empty/error/retry states, and navigation into a merchant. Orders and Account are reachable from the home header/profile menu; do not use a bottom tab bar.
- `GET /merchant/nearby` supports coordinates, radius, city and text search, and returns merchant categories, rating, distance, featured products and estimated delivery time. It does not expose an explicit vertical filter, pagination, sorting/filter facets, delivery eligibility, or outlet-level availability in the inspected DTO/service.
- Customers need to search both shops and products, and filter by distance, price and availability. Current search matches shop name, city and address, not product/dish names; merchant API lacks price/availability filters and paging. Define real backend contracts and semantics before implementation; do not simulate them client-side over incomplete results.

### Merchant storefront and catalog

- Resolve the merchant vertical from backend categories and render a dedicated grocery, meat, or restaurant browsing experience while sharing tokens and interaction primitives.
- Show verified merchant/outlet identity and available real products. Respect branch-specific price, availability, stock and coordinates from `GET /outlets/:id/storefront`.
- Support recursive categories and existing product customization groups/options in the product contract. The current restaurant view groups products by category; add-to-cart currently passes only product ID/name/price, so customization choices are not yet retained.
- Handle merchants with no active outlets, a selected outlet becoming unavailable, loading/errors, empty catalog, missing image, and stale product/stock data explicitly.
- `GET /merchant/storefront/:id` provides base merchant data/products. Grocery and meat screens, product detail/customization UI, and a reliable outlet selection default policy remain to be implemented/confirmed.

### Cart and pricing

- Enforce a single merchant and single outlet cart. Switching merchant/outlet must clearly confirm clearing existing items; current `cartStore.addItem` silently replaces scoped items, and current outlet selection clears the cart directly. Preserve a guest cart through sign-in.
- Preserve item customizations, quantities, and user notes in the cart model. Revalidate outlet, product availability, stock, and price before order creation.
- Show item subtotal (sum of selected product prices) and fixed ₹5 platform fee. Backend currently calculates subtotal, outlet override price, delivery fee from outlet/merchant and dropoff coordinates, platform fee and total at `POST /orders`. Display server-calculated totals; GST rate/base and delivery serviceability remain deferred and must be resolved before final checkout totals and launch.
- No discount/coupon model or endpoint was found. Do not display offers or apply client-authored discount rules.

### Checkout, payment and confirmation

- Select a saved or newly entered delivery address, present merchant/outlet, itemized contents and a server-authoritative final total, then submit exactly one order request with duplicate-submit protection.
- Backend `POST /orders` accepts merchant, optional outlet, product IDs/quantities, delivery address and optional coordinates; it validates product/merchant/outlet relations and computes totals inside its current flow. The client order service exists.
- COD is the confirmed launch payment method. COD collection/payment status is not implemented in the inspected backend; define its lifecycle before production checkout. Never represent an order as paid merely because it was placed. Online payment is out of initial scope unless later approved.
- On success, navigate using the returned order ID and use the returned order snapshot; on error preserve cart/address and let the customer retry safely.

### Orders and fulfillment

- Provide customer order history, details, live status, delivery address/outlet snapshot, itemized amount, and reorder with fresh availability/price validation. Customer cancellation and scheduled orders are out of initial scope; do not expose those actions.
- Existing API has `GET /orders/customer/my-orders`, `GET /orders/:id`, and `PATCH /orders/:id/status`. Backend permits customer cancellation only from `PLACED`. Client orders API currently exposes create, history and detail, but not status mutation/cancel.
- After courier assignment, show live map tracking, courier phone contact and delivery OTP. Polling alone cannot supply live courier position; a real courier-location API/update mechanism is required. Order updates are in-app only at launch; no push, SMS or email notifications are in scope.
- Poll active order detail at a bounded interval and stop when terminal; handle authorization, not-found, offline and stale responses. Keep OTP access scoped to the authorized customer and assigned-order lifecycle.
- Status sequence currently includes `PLACED`, `ACCEPTED`, `PREPARING`, `READY_FOR_PICKUP`, `OUT_FOR_DELIVERY`, `DELIVERED`, plus `CANCELLED` and `DECLINED`. Delivery allocation is triggered asynchronously when status becomes `PREPARING`; its failure is logged, not returned to the customer. Align tracking expectations to this actual behavior.

## Cross-cutting acceptance criteria

- All displayed business data and claims come from backend responses or clearly identified local user input.
- Every server-backed screen has loading, success, empty and recoverable error states; mutations disable duplicate submission and recover cleanly.
- Customer data access is scoped to the authenticated user; state and caches do not leak across login/logout.
- VoiceOver/TalkBack labels, touch targets, keyboard behavior, safe areas, dynamic text, low-end Android scrolling and image failures are addressed.
- Critical business rules are server authoritative and tested; client validation improves UX but never replaces backend checks.
- Each feature has verified API-contract tests, relevant unit/integration coverage, app type/lint checks and the applicable build/device journey before being marked complete.

## Explicit decisions needed before implementation

1. Confirm INR as the launch currency (implied by the fixed ₹5 platform fee) for price formatting and persistence.
2. **Deferred by owner:** Delivery serviceability method/limits. Resolve before the related delivery eligibility/checkout feature and before launch; do not assume a radius or postal-code policy.
3. **Deferred by owner:** GST rate, taxable components and authoritative source. Resolve before final checkout totals and before launch.
4. Define COD collection/settlement, failed-delivery handling and payment status.
5. Define live courier location source/update cadence and the support phone number/hours/escalation process.
6. Define editable customer profile fields.
7. Define production backend hosting and Android/iOS distribution/release process.
