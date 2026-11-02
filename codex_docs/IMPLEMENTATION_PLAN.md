# Lahm Customer App — Implementation Plan

**Status:** Draft for user review; implementation has not started.  
**Platform:** Expo SDK 58, React Native, TypeScript, NativeWind; Android and iOS.  
**Primary source:** `CUSTOMER_APP_ANALYSIS.md` plus current user decisions.

## Goal

Complete the existing customer application as a production-grade marketplace for grocery, meat, and restaurant merchants in Chennai. Build small, reviewable slices on the existing stack, with server-authoritative data and pricing. Do not treat the app as a mockup or introduce fabricated business data.

## Product boundaries

Included: guest discovery; phone authentication; location and saved addresses; marketplace home and search; merchant/outlet storefronts; dynamic product customization; one-outlet cart; COD checkout; customer orders; assigned-courier tracking, call action, and delivery OTP; profile; loading/empty/error/retry states; release validation.

Initial exclusions: online payments, customer cancellation, scheduled orders, push notifications, support chat, GST/serviceability policy decisions explicitly deferred by the customer, and additional cities. Excluded policies must not be represented by invented values. The API/UI should show a clear state when required backend pricing or serviceability data is unavailable.

## Architecture direction

- Preserve monorepo conventions and existing packages. No new dependency without a written reason and compatibility check against SDK 58.
- Screens call feature hooks; hooks use TanStack Query; API functions live in `@lahm/api`; NestJS remains authoritative for validation, availability, and pricing.
- TanStack Query owns server state. Zustand owns shared client cart/auth state only. Component-local state owns transient UI state.
- Keep Expo Router files as thin route bridges. Reuse `@lahm/ui` and `@lahm/tokens`; do not add speculative abstractions.
- Cart identity includes merchant, outlet, product, and selected customization option IDs. Switching merchant/outlet requires an explicit customer decision. Order items persist a server-validated price/name/customization snapshot.
- For each mutation, specify trigger, in-flight feedback, commit/cache behavior, and failure/timeout recovery. Backend writes need authorization, validation, transaction/locking, and idempotency where duplicate requests could create duplicate outcomes.
- Customer-facing API responses use explicit least-privilege DTOs; do not serialize full merchant/courier entities into customer routes.

## Proposed execution phases

Each numbered phase begins with a separate feature discussion. We agree the flow, edge cases, API contract, acceptance criteria, and validation before implementing that phase. A phase is not approved merely because it appears here.

### Phase 0 — Plan and product decisions

- Review this analysis and plan; correct status or scope where needed.
- Resolve only decisions needed by the next phase. Keep agreed deferred decisions visibly deferred.
- Set a fresh progress baseline; do not modify existing user work or old drafts.
- Exit gate: user approves the plan and the first feature-spec discussion begins.

### Phase 1 — Design system and UI direction (first implementation batch)

- First discuss and approve visual references/qualities, teal/white/black roles, typography, spacing, radius, elevation, icon style, component states, and navigation/accessibility rules.
- Audit current tokens and shared UI before changing them. Define customer-app tokens using existing `@lahm/tokens` conventions; agree which shared primitives belong in `@lahm/ui` and which remain customer-local.
- Produce a small reviewable UI direction artifact and screen flows/wireframes before coding the design system. The first implementation slice should establish approved tokens and one representative shared primitive/screen state, then be reviewed on iOS and Android.
- No bottom tab bar. Agree the header/profile menu pattern for Orders and Account.
- Exit gate: user approves design direction, token mapping, component conventions, and representative visual review before feature screens use the system.

### Phase 2 — Guest entry, authentication, and location foundation

- Specify the guest journey, phone OTP flow, registration fields, session restoration/expiry, permission denial, manual location, and checkout sign-in return path.
- Remove production-capable fake OTP/token success; verify error states and ownership-safe customer profile lookup.
- Connect device location and saved address selection without blocking browsing. Preserve cart intent across auth.
- Exit gate: guest can browse, authenticate, recover from auth/location errors, and return to intended checkout action.

### Phase 3 — Marketplace home and search

- Specify home content hierarchy, departments, merchant cards, search results, filters (distance/price/availability), pagination, and no-results behavior.
- Agree backend search query/response contract before wiring UI. Use real merchant/product data and TanStack Query loading, empty, error, retry, and refresh states.
- Exit gate: real location-aware discovery and agreed marketplace search work across all three verticals.

### Phase 4 — Storefront, product detail, customizations, and cart

- Agree shared storefront shell plus grocery/meat/restaurant differences; category navigation; product availability; outlet switching; and product detail behavior.
- Define dynamic customization validation, min/max/required selection, option price deltas, display/rounding, and immutable order snapshot.
- Resolve cart persistence policy and explicit replace-cart confirmation. Validate branch-level availability and price changes.
- Exit gate: customer can build one valid merchant/outlet cart with exact selections and see changes or unavailable items handled clearly.

### Phase 5 — Addresses and COD checkout

- Specify address create/edit/default/delete, address selection, checkout review, failure recovery, duplicate-submit behavior, and post-order navigation.
- Backend contract must authoritatively calculate subtotal, ₹5 platform fee, delivery charge, GST only after approved policy, and total. Persist COD as payment method/state. Do not accept client-supplied totals.
- Review outlet ownership, serviceability, inventory locking, idempotency, transactional order creation, and rollback before UI is built.
- Exit gate: an authenticated customer can place exactly one valid COD order and sees server-returned itemized totals; rejected/timeout cases leave cart and UI coherent.

### Phase 6 — Order history and tracking

- Specify order history/detail, status vocabulary, refresh strategy, assigned-courier fields, map behavior, call action, OTP visibility, and delivery completion.
- Add or confirm customer-authorized courier location read contract and safe response DTO. Review location freshness, denied permissions, lost connectivity, polling backoff, OTP attempts, and privacy.
- Exit gate: customer sees own orders only and receives truthful status/location updates; courier personal data is minimized.

### Phase 7 — Profile, quality, and release readiness

- Agree profile fields/actions and account lifecycle; implement only required customer profile behavior.
- Validate accessibility, screen sizes, network loss, auth expiry, empty/error states, privacy/security, performance, and supported platform builds.
- Run scoped unit/API/integration tests plus complete customer-to-merchant-to-courier order journey on configured environments. Document outstanding release blockers.
- Exit gate: production checklist passes against real services/configuration. “Production-ready” is a verified release decision, not a code-completion claim.

## Cross-cutting production gates

- Authentication: no simulated login success or mock identity in release builds; tokens stored using the approved secure mechanism; expiry/refresh handled.
- Authorization: customer can read or mutate only their own resources; merchant/outlet management endpoints require correct role and ownership.
- Orders: server-calculated money, immutable item/customization snapshots, defined state transitions, transaction boundaries, duplicate-submit protection, race-safe inventory, and safe retry semantics.
- Data quality: no demo/seed business data in customer production responses, fabricated ratings/certifications, silent catches, or misleading fallback values.
- UI: approved teal/white/black tokens; vector icons; accessible labels/states; native interaction; safe-area-aware actions; content-shaped loading; explicit empty/error/retry states.
- API: typed request/response contracts; hooks centralize query keys, invalidation, retries, and stale behavior; components do not issue raw requests.
- End-to-end review: every affected order change is traced across data model, read APIs, client cart, checkout, merchant workflow, delivery allocation, and tracking/receipt lifecycle.

## First implementation batch

**Recommendation:** After plan approval, the first implementation batch should be the agreed design-system foundation, beginning with an audit and a short UI direction review. It should establish token roles and component conventions, then implement only the approved foundational tokens/primitive in the existing packages. This is first because the current customer UI is inconsistent with the teal/white/black direction, existing screens contain different styling, and every later screen depends on consistent tokens. Do not redesign all screens in the same batch.

Acceptance criteria for that batch:

1. User-approved visual direction and token mapping are documented before code edits.
2. Existing token/UI package conventions are reused; no duplicate theme or unnecessary library is added.
3. One representative shared primitive has explicit variant, size, pressed, disabled, loading, and accessibility behavior where applicable.
4. A representative customer screen/state is rendered and reviewed on iOS and Android before broader adoption.
5. Existing uncommitted work remains intact; focused type/build validation is recorded.

## Schedule and estimate

The earlier 2–3 day target (maximum 4–5 days) is not a credible production commitment until API gaps, security changes, GST/serviceability policies, and end-to-end validation are scoped. Estimate each approved phase after its feature discussion and dependency check. Prioritize completed, verified customer journeys over a calendar promise.

## Review protocol

Before each feature implementation, produce a concise feature spec covering: user goal and screens; entry/exit paths; guest/auth behavior; API/data contract; loading/empty/error/offline states; validation and edge cases; security/privacy; analytics/operational concerns if applicable; acceptance criteria; and commands/device scenarios for verification. Wait for user agreement before coding that feature. Keep changes to 1–2 files per implementation step under the repository rules, splitting work further where needed.

## Evidence and known limitations

Repository status and feature evidence are recorded in `CUSTOMER_APP_ANALYSIS.md`. The npm launcher failure prevented frontend build/lint verification during analysis. Security, runtime, deployment configuration, and real-device behavior require focused verification in their relevant feature phases.
