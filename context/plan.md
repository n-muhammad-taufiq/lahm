# Lahm — MVP Development Plan

> **Final Outcome Specification:** See [`context/final-outcome.md`](file:///c:/Users/afriq/Documents/company/project-lahm/context/final-outcome.md) for the complete end-to-end 3-mobile architecture, role responsibilities, 8-step core ordering lifecycle, and acceptance criteria.

---

## Current State Analysis

### What Exists (Working)

**Backend (NestJS + TypeORM + PostgreSQL)**
- Authentication: Firebase OTP login/register, email login, JWT tokens, guards
- Users: Entity, service, role enum (CUSTOMER, MERCHANT, DELIVERY_PARTNER)
- Customers: Entity (bare — just id + user relation), register endpoint
- Merchants: Entity (rich — shop details, location, ratings), register, nearby search (Haversine), storefront, CRUD
- Products: Entity, full CRUD (create, read, update, delete), merchant relation
- Delivery Partners: Entity (rich — vehicle, license, location), register, profile CRUD
- Firebase: Service for token verification

**Frontend (Expo/React Native monorepo with NativeWind)**
- Customer App: Auth flow (phone OTP via Firebase), home screen with nearby shops, location feature
- Merchant App: Auth flow, dashboard with product management (CRUD, toggle availability)
- Delivery App: Auth flow only, placeholder dashboard
- Shared Packages:
  - `@lahm/tokens`: Design tokens (colors, spacing, radii, fonts, layout)
  - `@lahm/ui`: 15 shared components (Button, Input, FormField, BrandHeader, etc.)
  - `@lahm/api`: Axios client with token interceptor, auth API, merchants API, products API

---

### What's Missing (36 Issues)

#### Backend Issues

1. **No Orders module** — No order entity, service, controller, or DTOs. The core transactional flow doesn't exist.
2. **No Cart module** — No cart entity or backend support for cart state.
3. **No Addresses module** — Customer entity has no address fields or saved addresses.
4. **No Delivery Allocation module** — No logic to assign orders to delivery partners.
5. **No Notifications module** — No push notification service (FCM).
6. **No Admin module** — No admin role, no admin management endpoints.
7. **No Payments module** — No payment integration or verification.
8. **Customer entity is bare** — Only `id` and `user` relation. No addresses, no saved locations.
9. **No role-based guards** — JWT guard exists but no `@Roles()` decorator or role guard to protect endpoints by role.
10. **No authorization on product endpoints** — Any authenticated (or even unauthenticated) user can create/edit/delete products.
11. **`synchronize: true` in production** — TypeORM auto-sync is dangerous for production. Should use migrations.
12. **`onModuleInit` in MerchantsService** — Hardcodes default coordinates and banner URLs on startup. This is seed/mock behavior that violates SKILL.md rules.
13. **Hardcoded fallback values** — `bannerUrl` defaults to an Unsplash URL in multiple places, `rating` defaults to `4.8` in `getStorefront`.
14. **N+1 query in `findNearby`** — For each merchant, two additional product queries run inside a loop.
15. **No refresh token rotation** — Refresh tokens are generated but there's no refresh endpoint or token invalidation.
16. **No input validation on some endpoints** — Missing `@UsePipes(ValidationPipe)` globally or per-controller.

#### Frontend Issues

17. **Customer `index.tsx` is 506 lines** — Violates the 200-line component limit. All auth steps (choice, phone, OTP, register, success) are in one file.
18. **Merchant `dashboard.tsx` is 348 lines** — Exceeds 200-line limit. Home tab and product catalog are in the same file.
19. **Hardcoded color values** — Despite having design tokens, many components use raw hex values (`#E77A62`, `#1C1611`, `#7D6F66`, `#F2D8CD`, `#B87B6A`, etc.) instead of token references.
20. **No shop profile page** — Customer can see nearby shops but cannot tap into a shop to view its products.
21. **No cart UI** — No cart screen, add-to-cart flow, quantity controls, or checkout.
22. **No order placement flow** — No checkout, payment, or order confirmation screens.
23. **No order tracking** — No order status screen, no real-time updates.
24. **No order management for merchants** — No incoming orders, accept/decline, preparation flow.
25. **No delivery partner active delivery UI** — No pickup/delivery flow, no map/navigation.
26. **No delivery allocation UI** — No delivery request acceptance/rejection.
27. **No admin app** — Not even a placeholder exists.
28. **No notifications UI** — No push notification handling or in-app notification list.
29. **No secure token storage** — Access token is stored in memory (`currentAccessToken`). On app restart, user is logged out. Should use `expo-secure-store`.
30. **No persistent auth state** — No check on app launch to see if user is already authenticated.
31. **`store status toggle` is local state only** — Merchant store online/offline toggle doesn't persist to backend.
32. **Delivery app has no features beyond auth** — Dashboard is a placeholder.
33. **No TanStack Query** — Despite SKILL.md requiring it, the merchant products hook uses raw `useState` + `useEffect` + manual fetch. No caching, no automatic refetch, no mutations.
34. **No Zustand** — No shared client state management.
35. **`explore.tsx` exists in all apps (~6.6KB each)** — Appears to be boilerplate/unused Expo template code.
36. **Missing UI components from design system** — Plan lists Card, Modal, Bottom Sheet, Header, List Item, Product Card, Shop Card, Status Badge, Loading/Empty/Error states, Confirmation Dialog — but `@lahm/ui` only has auth-related components.

---

## Production MVP Plan

The plan follows a **vertical slice** approach: each step delivers an end-to-end working feature. Development uses **small incremental changes** (~100 lines per change, components under ~200 lines, 1-2 files per change).

### Phase Status Tracker

| Phase | Description | Status |
|---|---|---|
| **Phase 0** | Foundation & Cleanup | ⏳ In Progress (0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8 Completed) |
| **Phase 1** | Design System Completion | ⬜ Pending |
| **Phase 2** | Authentication Hardening | ⬜ Pending |
| **Phase 3** | Customer Home & Discovery | ⬜ Pending |
| **Phase 4** | Merchant Storefront & Products | ⬜ Pending |
| **Phase 5** | Product Management | ⬜ Pending |
| **Phase 6** | Cart & Checkout Flow | ⬜ Pending |
| **Phase 7** | Merchant Order Processing | ⬜ Pending |
| **Phase 8** | Delivery Allocation & Execution | ⬜ Pending |
| **Phase 9** | Customer Order Tracking & History | ⬜ Pending |
| **Phase 9.5** | **End-to-End 3-App Integration & Verification** | ⬜ Pending |
| **Phase 10** | Push Notifications *(Secondary / Post-Core)* | ⬜ Pending |
| **Phase 11** | Admin Operations Panel *(Secondary / Post-Core)* | ⬜ Pending |

---

### Phase 0 — Foundation & Cleanup

Fix architectural issues and establish patterns before building features.

#### 0.1 Backend: Global Validation & Error Handling — [x] Completed
- [x] Add `ValidationPipe` globally in `main.ts`
- [x] Add a global exception filter for consistent error responses (`HttpExceptionFilter`)
- **Files:** `main.ts`, `common/filters/http-exception.filter.ts`

#### 0.2 Backend: Role-Based Authorization — [x] Completed
- [x] Create `@Roles()` decorator
- [x] Create `RolesGuard`
- [x] Apply to product mutation endpoints (`POST`, `PATCH`, `PUT`, `DELETE`) with `@Roles(Role.MERCHANT)`
- **Files:** `authentication/decorators/roles.decorator.ts`, `authentication/guards/roles.guard.ts`, `authentication/authentication.module.ts`, `products/products.controller.ts`

#### 0.3 Backend: Remove Startup Seeding — [x] Completed
- [x] Remove `onModuleInit` from `MerchantsService` (hardcoded coordinates/banner URLs)
- [x] Remove hardcoded Unsplash fallback URLs in service methods
- [x] Remove hardcoded `rating: 4.8` fallback in `getStorefront`
- **Files:** `merchants/merchants.service.ts`

#### 0.4 Backend: Fix N+1 Query in findNearby — [x] Completed
- [x] Refactor `findNearby` to batch-query products with `In(merchantIds)` and group in memory
- **Files:** `merchants/merchants.service.ts`

#### 0.5 Backend: Refresh Token Flow — [x] Completed
- [x] **0.5a**: Create `RefreshTokenDto` and implement `refreshToken()` in `AuthenticationService`
  - **Files (2 files):** `authentication/dtos/refresh-token.dto.ts`, `authentication/authentication.service.ts`
- [x] **0.5b**: Expose `POST /auth/refresh` on `AuthenticationController`
  - **Files (1 file):** `authentication/authentication.controller.ts`

#### 0.6 Frontend: Secure Token Storage — [x] Completed
- [x] Replace in-memory token storage with `expo-secure-store`
- [x] Create `tokenStorage.ts` utility in `@lahm/api` (save, read, clear tokens)
- [x] Update `client.ts` to load token on init
- **Files:** `tokenStorage.ts`, `client.ts`, `@lahm/api/package.json`

#### 0.7 Frontend: Auth State Persistence — [x] Completed
- [x] Create auth store with Zustand (user, tokens, isAuthenticated, loading)
- [x] On app launch, check `expo-secure-store` for existing tokens, validate with `GET /auth/me`
- [x] Connect `initializeAuth()` in `_layout.tsx` for persistent session management
- **Files:** `authStore.ts`, `api/src/index.ts`, `_layout.tsx` (customer, merchant, delivery)

#### 0.8 Frontend: Install & Configure TanStack Query — [x] Completed
- [x] Add `@tanstack/react-query` to `@lahm/api` dependencies
- [x] Create centralized `queryClient.ts` with mobile caching defaults
- [x] Wrap `QueryClientProvider` in `_layout.tsx` across all 3 apps
- **Files:** `package.json`, `queryClient.ts`, `api/src/index.ts`, `_layout.tsx` (customer, merchant, delivery)

#### 0.9 Frontend: Remove Unused Boilerplate
- Remove `explore.tsx` from all apps (Expo template leftover)
- Clean up any unused imports/files
- **Files:** `explore.tsx` in customer, merchant, delivery

#### 0.10 Frontend: Break Down Oversized Components
- Split customer `index.tsx` (506 lines) into:
  - `ChoiceView.tsx` (~80 lines)
  - `PhoneFormView.tsx` (~80 lines)
  - `OtpVerifyView.tsx` (~80 lines)
  - `RegisterDetailsView.tsx` (~80 lines)
  - `AuthSuccessView.tsx` (~40 lines)
  - `index.tsx` orchestrator (~60 lines)
- Split merchant `dashboard.tsx` (348 lines) into:
  - `HomeTab.tsx` (~150 lines)
  - `dashboard.tsx` orchestrator (~80 lines)
- **Files:** Multiple new files per step above (one file per incremental change)

---

### Phase 1 — Design System Completion

Build missing shared UI components needed by all subsequent features.

**Core Rule:** *When a reusable UI component is required, develop it first in `@lahm/ui` before consuming it in feature screens. Never write duplicate inline UI markup.*s  

#### 1.1 Core UI Components
Each component is a separate incremental change:

- **Card** — Native container with subtle elevation, tokenized borders, and active press scale. ~60 lines.
- **StatusBadge** — Pill-shaped label for order status, availability. ~40 lines.
- **SkeletonLoader** — Animated shimmer placeholder cards, text lines, and image blocks for loading feeds. ~70 lines.
- **LoadingState** — Minimal spinner for modal actions. ~30 lines.
- **EmptyState** — Vector icon + title + subtitle + optional CTA button. ~50 lines.
- **ErrorState** — Error message with retry button. ~40 lines.
- **ConfirmationDialog** — Modal with title, message, confirm/cancel buttons. ~80 lines.
- **BottomSheet** — Gesture-driven slide-up panel with drag handle and backdrop dimming. ~100 lines.
- **ListItem** — Row with vector icon, title, subtitle, right accessory. ~60 lines.
- **Header** — Screen header with blur/glass effect, title, back button, optional right action. ~60 lines.
- **ShopCard** — Shop name, image, rating, distance, delivery time, with touch feedback. ~80 lines.
- **QuantityStepper** — +/- tactile buttons (with haptic feedback) and count display. ~50 lines.

Each component is built in `@lahm/ui/src/`, exported from `index.ts`, and uses design tokens — not hardcoded values.

#### 1.2 Audit & Replace Hardcoded Colors
- Scan all component files for raw hex values
- Replace with design token references where tokens exist
- Add missing tokens for any genuinely new values
- **Approach:** One file per incremental change

---

### Phase 2 — Authentication Hardening

Make auth production-ready across all apps.

#### 2.1 Customer Auth (already working — needs cleanup)
- Refactor split components (Phase 0.10) to use design tokens
- Add persistent auth state (Phase 0.7)
- Add auto-redirect on app launch if already authenticated

#### 2.2 Merchant Auth (already working — needs cleanup)
- Same cleanup as customer auth
- Ensure merchant-specific registration captures shop details

#### 2.3 Delivery Partner Auth (already working — needs cleanup)
- Same cleanup as delivery auth
- Ensure registration captures vehicle/license details

#### 2.4 Protected Routes
- Create auth layout wrapper: if not authenticated, redirect to login
- Apply to all post-login screens in each app
- **Files:** `_layout.tsx` in each app, shared auth guard component

---

### Phase 3 — Customer: Shops List

Customer sees nearby halal shops based on location.

#### 3.1 Backend: Shops List API (already exists)
- `GET /merchant/nearby` with lat/lng/radius/city/search — already implemented
- Fix: Add proper product count via subquery instead of N+1 loop (Phase 0.4)

#### 3.2 Frontend: Refactor Home Screen to use TanStack Query
- Create `useNearbyShops` hook using TanStack Query (`useQuery`)
- Create API function in `@lahm/api/src/merchants/`
- Replace manual `useState`/`useEffect` fetch pattern
- **Files:** new `useNearbyShops.ts`, update `CustomerHomeScreen.tsx`

#### 3.3 Frontend: Shop Search
- Add search input to home screen
- Debounce search, pass as query param to `useNearbyShops`
- Show filtered results or "no shops found" empty state
- **Files:** Update `CustomerHomeScreen.tsx`, new `SearchBar.tsx` component

---

### Phase 4 — Merchant: Product Management

Merchant manages their product catalog.

#### 4.1 Backend: Product Authorization
- Apply JWT + Roles guard to product endpoints
- Ensure merchant can only CRUD their own products
- **Files:** `products.controller.ts`, `products.service.ts`

#### 4.2 Frontend: Refactor to TanStack Query
- Create `useMerchantProducts` with `useQuery` + `useMutation`
- Replace existing manual fetch pattern
- Automatic cache invalidation on create/update/delete
- **Files:** Refactor existing `useMerchantProducts.ts` hook

#### 4.3 Frontend: Store Online/Offline Persistence
- Add `PATCH /merchant/user/:userId` to toggle store status
- Connect the toggle button to a real API mutation
- **Files:** `merchants.service.ts` (backend), merchant dashboard (frontend)

---

### Phase 5 — Customer: Shop Profile Page

Customer taps a shop from the list and sees shop details + products.

#### 5.1 Backend: Storefront API (already exists)
- `GET /merchant/storefront/:id` — returns shop info + available products
- Already implemented, just needs to be consumed

#### 5.2 Frontend: Shop Profile Screen
- New route `app/shop/[id].tsx` (thin route file)
- New `features/shop/screens/ShopProfileScreen.tsx`
  - Shop header (banner, name, rating, delivery time)
  - Product list with "Add to Cart" buttons
- New `features/shop/hooks/useStorefront.ts` (TanStack Query)
- New API function in `@lahm/api`
- **Files:** Built incrementally, one file at a time

---

### Phase 6 — Customer: Cart & Checkout

Customer adds products to cart, manages quantities, proceeds to checkout.

#### 6.1 Backend: Orders Module (Specification-Driven Development)
Create the production-grade orders module serving Customer, Merchant, and Delivery Partner applications:

##### Architectural Principles
1. **Server-Authoritative Pricing (Anti-Tampering):** Clients submit only `{ merchantId, items: [{ productId, quantity }], deliveryAddress, customerCoordinates }`. The backend looks up active prices from PostgreSQL, calculates `unitPrice`, `subtotal`, dynamic `deliveryFee`, `platformFee`, and `totalAmount`.
2. **Atomic Database Transactions:** Multi-table writes (`orders`, `order_items`) execute inside `DataSource.transaction`.
3. **Dynamic Distance-Based Delivery Pricing:**
   - Great-circle distance calculated via Haversine formula using merchant coordinates (`merchant.latitude`, `merchant.longitude`) and dropoff coordinates (`deliveryLatitude`, `deliveryLongitude`).
   - Pricing Formula: `baseFare + (extraKm * perKmRate) + platformFee` (capped by min/max boundaries). Configurable now in code/env; ready for Admin DB configuration later.
4. **Strict State Machine & Role-Based Transitions:**
   - States: `PLACED` -> `ACCEPTED` -> `PREPARING` -> `READY_FOR_PICKUP` -> `OUT_FOR_DELIVERY` -> `DELIVERED`. Terminals: `CANCELLED`, `DECLINED`.
   - Transitions enforced by role (`CUSTOMER`, `MERCHANT`, `DELIVERY_PARTNER`).
5. **Secure 4-Digit Delivery OTP:** Generated on order creation, shown only to customer on tracking screen, verified by delivery partner on dropoff via `POST /orders/:id/verify-delivery`.

##### 7-Step Implementation Roadmap (1–2 files per step, ~100 lines/step)
- [x] **Step 1:** Create `order-status.enum.ts` & `order-item.entity.ts` (Done & verified with `npx tsc`).
- [ ] **Step 2:** Create `order.entity.ts` with relationships (`Customer`, `Merchant`, `DeliveryPartner`), coordinates, numeric transformers, dynamic pricing columns, and `deliveryOtp`.
- [ ] **Step 3:** Create DTOs (`create-order.dto.ts`, `update-order-status.dto.ts`, `verify-delivery-otp.dto.ts`) with `class-validator`.
- [ ] **Step 4:** Implement `orders.service.ts` (Part 1: Order creation with atomic transaction and backend pricing calculation).
- [ ] **Step 5:** Implement `orders.service.ts` (Part 2: Order queries and state machine transition engine).
- [ ] **Step 6:** Implement `orders.controller.ts` with guards (`JwtAuthGuard`, `RolesGuard`, `@Roles()`).
- [ ] **Step 7:** Create `orders.module.ts`, register in `app.module.ts`, and run compiler/type verification.


#### 6.2 Backend: Customer Addresses
- Add addresses to Customer entity or create separate Address entity
- CRUD endpoints for addresses
- **Files:** new `address.entity.ts`, `addresses.service.ts`, `addresses.controller.ts`

#### 6.3 Frontend: Cart (Zustand store — client-side only for MVP)
- Create `cartStore.ts` with Zustand
  - Items array: { product, quantity, merchantId }
  - Actions: addItem, removeItem, updateQuantity, clearCart
  - Derived: subtotal, itemCount
  - Constraint: all items must be from same merchant
- **Files:** new `stores/cartStore.ts`

#### 6.4 Frontend: Cart Screen
- New route `app/cart.tsx`
- New `features/cart/screens/CartScreen.tsx`
  - Cart items list with QuantityStepper
  - Price summary (subtotal, delivery fee, total)
  - "Proceed to Checkout" button
  - Empty cart state
- **Files:** Built incrementally

#### 6.5 Frontend: Checkout & Place Order
- New `features/checkout/screens/CheckoutScreen.tsx`
  - Address selection/entry
  - Order summary
  - Place Order button → `POST /orders`
- New `features/checkout/hooks/usePlaceOrder.ts` (TanStack mutation)
- **Files:** Built incrementally

#### 6.6 Frontend: Order Confirmation
- New `features/orders/screens/OrderConfirmationScreen.tsx`
  - Order details, estimated time, OTP display
  - Navigate to order tracking
- **Files:** Built incrementally

---

### Phase 7 — Merchant: Order Management

Merchant receives orders, accepts/declines, manages preparation.

#### 7.1 Backend: Merchant Order Endpoints
- `GET /orders/merchant/:merchantId` — list orders for merchant
- `PATCH /orders/:id/status` — with allowed transitions per role
- Only merchant can transition: PLACED → ACCEPTED, ACCEPTED → PREPARING, PREPARING → READY_FOR_PICKUP
- Only merchant can: PLACED → DECLINED
- **Files:** Updates to `orders.controller.ts`, `orders.service.ts`

#### 7.2 Frontend: Merchant Orders Tab
- Add "Orders" tab to merchant bottom nav
- New `features/orders/screens/MerchantOrdersScreen.tsx`
  - Incoming orders list
  - Order detail expansion
  - Accept / Decline buttons
  - Status progression buttons (Preparing → Ready)
- New `features/orders/hooks/useMerchantOrders.ts` (TanStack Query with polling/refetch)
- **Files:** Built incrementally

---

### Phase 8 — Delivery: Allocation & Active Delivery

System assigns orders to delivery partners. Partners pick up and deliver with OTP verification.

#### 8.1 Backend: Delivery Allocation & Partner Duty Status
- Add partner duty toggle: `PATCH /delivery-partners/duty` (`isOnline: boolean`)
- New `delivery-allocation` module
- When order status → READY_FOR_PICKUP, find eligible nearby online delivery partners
- Create DeliveryRequest entity (orderId, partnerId, status, expiresAt)
- Send delivery request (initially via responsive polling; push notifications later)
- Handle accept/reject/expire/reassign
- **Files:** new module with entity, service, controller — each file incremental

#### 8.2 Backend: Delivery Status Transitions & OTP Verification
- Partner can transition: DELIVERY_PARTNER_ASSIGNED → PICKED_UP → OUT_FOR_DELIVERY
- Verification endpoint: `POST /orders/:id/verify-delivery` (validates customer's 4-digit OTP before transitioning to `DELIVERED`)
- **Files:** Updates to orders service & controller

#### 8.3 Frontend: Delivery Partner — Duty Toggle & Request Screen
- Online / Offline duty switch on Delivery Dashboard
- Show incoming delivery request with pickup/delivery locations
- Accept / Reject buttons
- Timer for request expiry
- **Files:** new feature in delivery app

#### 8.4 Frontend: Delivery Partner — Active Delivery & OTP Handover
- Show pickup details, navigation prompt
- Confirm pickup button
- Show delivery details, call customer CTA
- Confirm delivery with 4-digit OTP entry (calls `verify-delivery`)
- **Files:** new feature in delivery app

---

### Phase 9 — Customer: Order Tracking

Customer tracks their order through the lifecycle.

#### 9.1 Backend: Order Tracking Data
- `GET /orders/:id` — returns full order with current status, delivery partner info
- `GET /orders/customer/:customerId` — order history
- **Files:** Already covered in Phase 6.1 orders module

#### 9.2 Frontend: Order Status Screen
- New `features/orders/screens/OrderTrackingScreen.tsx`
  - Visual status timeline (PLACED → ACCEPTED → ... → DELIVERED)
  - Delivery partner info when assigned
  - OTP display for delivery verification
  - Pull-to-refresh for status updates
- **Files:** Built incrementally

#### 9.3 Frontend: Order History
- New `features/orders/screens/OrderHistoryScreen.tsx`
  - List of past orders
  - Tap to view order details
- **Files:** Built incrementally

---

### Phase 9.5 — End-to-End 3-App Integration & Verification

Simultaneous cross-device verification of the complete core ordering lifecycle across Customer, Merchant, and Delivery Partner apps:
- **Step 1 (Customer):** Launch Customer App, select merchant, add cuts to cart, set delivery address, place order. Verify order created (`PLACED`) and 4-digit OTP generated.
- **Step 2 (Merchant):** Launch Merchant App, verify incoming order appears via polling, accept order (`ACCEPTED`), tap start preparing (`PREPARING`), package cut and tap ready for pickup (`READY_FOR_PICKUP`).
- **Step 3 (Delivery Partner):** Launch Delivery Partner App, toggle duty to Online, receive dispatch notification, review route details, tap accept (`ASSIGNED`).
- **Step 4 (Merchant Handover):** Delivery partner arrives at merchant, checks order item checklist, confirms pickup (`OUT_FOR_DELIVERY`).
- **Step 5 (Customer Delivery & OTP):** Delivery partner navigates to customer, collects customer's 4-digit OTP, submits OTP to backend. Order transitions to `DELIVERED`.
- **Step 6 (Multi-App State Sync):** Verify that all 3 apps synchronously update their active views and order history reflects the completed state with real database records.

---

### Phase 10 — Notifications (Secondary / Post-Core)

Push notifications for order lifecycle events.

#### 10.1 Backend: FCM Integration
- Create notifications module
- Integrate Firebase Cloud Messaging (FCM)
- Store device FCM tokens per user
- Send notifications on order status changes
- **Files:** new `notifications/` module

#### 10.2 Frontend: Push Notification Setup
- Register for push notifications with `expo-notifications`
- Send FCM token to backend on login
- Handle incoming notifications (navigate to relevant screen)
- **Files:** new notification setup per app

---

### Phase 11 — Admin Panel (Secondary / Post-Core)

Web-based admin dashboard for managing merchants, delivery partners, customers, and orders.

#### 11.1 Backend: Admin Endpoints
- Add `ADMIN` to Role enum
- Admin-only endpoints:
  - List/approve/disable merchants
  - List/approve/disable delivery partners
  - List customers
  - List/monitor orders
- Protected by `@Roles(Role.ADMIN)` guard
- **Files:** new `admin/` module or admin-specific endpoints in existing modules

#### 11.2 Frontend: Admin App
- Decide on approach: React web app (Vite) or React Native app
- Basic screens: Merchants list, Delivery Partners list, Customers list, Orders list
- Each entity: list view, detail view, action buttons (approve, disable)
- **Files:** New app in `frontend/apps/admin/`

---

## Development Approach

### Incremental Changes
- Each change touches ~100 lines or less
- 1-2 files per change
- Each change compiles and doesn't break existing functionality

### Component Limits
- Each React component: under ~200 lines
- If growing, extract sub-components or hooks into colocated files

### Per-Feature Vertical Structure
```
Feature
├── screens/        # Screen components
├── components/     # Feature-specific UI
├── hooks/          # Custom hooks (TanStack Query, logic)
├── api/            # API functions (or in @lahm/api)
├── types/          # TypeScript interfaces
└── index.ts        # Public exports
```

### Tech Stack (as per SKILL.md)
- **Server state:** TanStack Query (queries, mutations, cache)
- **Client state:** Zustand (auth, cart, UI preferences)
- **Local UI state:** `useState`
- **Forms:** React Hook Form + Zod (when needed)
- **API layer:** Axios via `@lahm/api` (never raw fetch in components)
- **Design:** `@lahm/tokens` + `@lahm/ui` (never hardcoded values)
- **Navigation:** Expo Router (thin route files → feature screens)

### Priority Order
```
Phase 0: Foundation & Cleanup
    ↓
Phase 1: Design System Completion
    ↓
Phase 2: Authentication Hardening
    ↓
Phase 3: Customer → Shops List (refactor)
    ↓
Phase 4: Merchant → Product Management (refactor)
    ↓
Phase 5: Customer → Shop Profile Page
    ↓
Phase 6: Customer → Cart & Checkout + Backend Orders
    ↓
Phase 7: Merchant → Order Management
    ↓
Phase 8: Delivery → Allocation & Active Delivery
    ↓
Phase 9: Customer → Order Tracking
    ↓
Phase 10: Notifications
    ↓
Phase 11: Admin Panel
```

Each phase is fully functional end-to-end before moving to the next.
No mock data. No fake API responses. No placeholder implementations.