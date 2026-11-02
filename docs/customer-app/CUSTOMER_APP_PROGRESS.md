# Lahm Customer App Progress

**Last reviewed:** 2026-11-01  
**Phase:** Repository analysis and planning only. No customer app implementation was performed for this planning package.

## Owner input captured

- Launch in Chennai, Tamil Nadu on Android and iOS; support all three merchant verticals.
- Keep the customer app on Expo SDK 58; merchant and delivery remain on SDK 57 unless separately changed.
- Allow browsing and cart building as a guest; require sign-in at checkout and preserve the cart.
- General home with department selectors; no bottom tab bar; Orders and Account from the header/profile menu.
- Merchant-defined dynamic product customization; one merchant and outlet per order.
- COD only; fixed ₹5 platform fee; item subtotal, GST and delivery charge are part of checkout.
- No scheduled orders or customer cancellation at launch.
- Once assigned, show live courier map, phone-call action and delivery OTP. Order updates are in-app only; customer support is by phone.
- Delivery serviceability and GST calculation details are deliberately deferred. They do not block planning or independent feature work; they gate final checkout totals, delivery eligibility, and production sign-off for those flows.
- Product behavior, edge cases and acceptance criteria will be discussed before implementing each feature (spec-driven workflow).

## Current baseline

| Area | Observed status | Evidence / limitation |
|---|---|---|
| Backend foundations | Auth, merchant/product discovery, catalog, outlet, address, order and delivery-allocation modules exist. | Code inspection only; prior project plan claims 130 backend tests passed, not rerun in this review. |
| Customer identity | Firebase OTP views and shared auth/session store exist; login/register flow is present. | No customer profile update contract; token refresh endpoint exists but no client refresh/replay interceptor was observed. |
| Discovery | Nearby merchant endpoint/client and location hook exist; customer home screens/components exist. | Root route currently imports `CustomerHomeScreen`; a recent handoff says `NewHomeScreen` was mounted, which does not match the checked-in route content. Discovery hook uses local state + effect rather than TanStack Query. |
| Storefront | Restaurant category grouping, outlet selector, outlet storefront hooks and outlet-scoped cart metadata exist. | Storefront dispatcher only renders restaurant; grocery/meat are placeholders. Product selection does not retain customization groups/options in cart. |
| Cart | Zustand store supports one merchant/outlet and quantity changes. | In-memory only; silently replaces items on a different scope; no cart drawer/checkout flow; no option snapshots/validation. |
| Addresses | Backend customer-scoped CRUD/default endpoints exist. | No customer address API module or customer address routes/screens found. |
| Orders and courier tracking | Backend create/history/detail/status/OTP and courier location write operations exist; shared order client supports create/history/detail. | No customer order UI; no customer-facing courier location read flow; order response currently loads the courier entity/user, which must be projected to avoid private-field exposure. Stock concurrency/idempotency also need review. |
| COD and discounts | Owner selected COD; no customer payment UI or COD collection/payment-status lifecycle was found. | Define COD status/collection/failed-delivery contract before checkout implementation; no discount model/API found. |
| Location integrity | Device GPS hook and backend courier coordinate storage exist. | Static Chennai coordinates appear in customer location types and need audit/removal from runtime paths; do not use sample coordinates as a fallback. |
| UI foundation | Token, UI and API packages exist; home/storefront/auth UI components are present. | Skeleton/error/empty primitives are incomplete; several screens use ad hoc effects/spinners/raw style values; `RestaurantStorefront.tsx` is 273 lines. |
| Runtime compatibility | Customer manifest is Expo 58.0.22 / RN 0.88.1 / React 19.3.0; merchant/delivery are Expo 57 / RN 0.86. | Expo 58 is owner-confirmed for customer. `npm ls` could not run: npm launcher points to missing `npm-cli.js`; installed dependency graph is unverified. |
| Verification | No checks run during this analysis. | `npm` command failed before dependency inspection; resolve tooling before claiming builds/tests. |

## Production readiness meaning

The owner's target is a real production-grade application usable by customers, not a visual mockup. The final gate must prove complete real backend flows, secure customer/order data, server-authoritative prices and inventory, COD/fulfillment integrity, clear failure/offline states, production configuration and real-device journeys on Android and iOS. GST, serviceability, COD settlement and live courier tracking must be defined and implemented before claiming the related launch flows are ready.

## Planning artifacts

- `CUSTOMER_APP_REQUIREMENTS.md` — user journeys, verified capabilities/gaps, acceptance baseline and decisions.
- `CUSTOMER_APP_ARCHITECTURE.md` — proposed structure, data flow, state/security/performance and compatibility notes.
- `CUSTOMER_APP_DESIGN_SYSTEM.md` — token-aligned visual and native interaction direction.
- `CUSTOMER_APP_IMPLEMENTATION_PLAN.md` — dependency-ordered work IDs C0–C11 with acceptance and verification.
- `CUSTOMER_APP_DECISIONS.md` — recorded observations, recommendations and approvals still required.

## Existing workspace state to preserve

At review start, `git status` showed pre-existing customer UI, auth/navigation/config/package and lockfile modifications, a modified communication log, deletion of `lead-management/legal.md`, and six untracked customer home files. This review did not alter those files. Review them with their author before staging, reverting, or merging.

## Next gate

Continue the repository/API contract audit and finish the plan; GST and delivery serviceability may remain deferred while planning and independent features proceed. Resolve remaining items (currency confirmation, COD settlement, courier-location source, profile fields, and release operations) before the dependent feature specs. Owner approves the overall plan before feature implementation. After approval, begin C0/C1 with compatibility and backend contract/security review, then update this file with actual verified progress.
