# Project Lahm — 3-App Deliverable Execution Plan

> **Final Outcome Specification:** See [`context/final-outcome.md`](./final-outcome.md) for the complete end-to-end 3-mobile architecture, role responsibilities, core ordering lifecycle, and acceptance criteria.  
> **Architecture Blueprint & Audit:** See [`3-app-deliverable-architecture-blueprint.md`](file:///home/codespace/.gemini/antigravity-cli/brain/f9a00796-ff07-4e3b-af55-dc6b81098783/3-app-deliverable-architecture-blueprint.md).

---

## 🎯 Target Launch & Velocity Scoreboard

- **Target Completion Date:** **October 27, 2026 IST** (Hard Launch Deadline)
- **Current Milestone Date:** **October 12, 2026 IST**
- **Calendar Days Remaining:** **15 Days**
- **Core Strategy:** Transition from fragmented micro-tasks to **3 Cohesive, Installable Application Releases**:
  - **Release 1: Lahm Customer Super-App** (Days 1–6: Oct 13 – Oct 18)
  - **Release 2: Lahm Merchant Partner App** (Days 7–9: Oct 19 – Oct 21)
  - **Release 3: Lahm Courier Delivery App** (Days 10–12: Oct 22 – Oct 24)
  - **Release 4: 3-App End-to-End Cross-Device Integration & Launch Verification** (Days 13–15: Oct 25 – Oct 27)

---

## Status Tracker: Deliverable Application Releases

| Deliverable Release | Target Window | Scope & Features | Status |
|---|---|---|:---:|
| **Foundation & Backend Engines** | Completed | 130 passing unit tests (Orders, Addresses, Products, Auth, Merchants) | [x] **Completed** |
| **Release 1: Lahm Customer Super-App** | Days 1–6 (Oct 13–18) | 5-Tab Shell, Meats/Dining/Groceries feeds, Cut Customizer, Floating Cart Drawer, Multi-Address Book, Haversine Checkout, Live OTP Tracking | ⏳ **In Progress** |
| **Release 2: Lahm Merchant Partner App** | Days 7–9 (Oct 19–21) | Store Status Toggle (`isOnline`), Kitchen Order Board (5s polling), Order Stepper (Accept→Prep→Ready), Multi-Vertical Catalog, Handover Modal | ⬜ Pending |
| **Release 3: Lahm Courier Delivery App** | Days 10–12 (Oct 22–24) | Duty Radar (Online/Offline), Incoming Dispatch Card (30s timer), Route Stepper, Secure 4-Digit OTP Handover Modal, Payout History | ⬜ Pending |
| **Release 4: 3-App E2E Integration & Launch** | Days 13–15 (Oct 25–27) | 3-Device Live Ordering Simulation, Multi-Currency (`formatCurrency`), E.164 Phone Verification, App Store Build Packaging | ⬜ Pending |

---

## Foundation & Backend Engines — [x] Completed (130 Unit Tests PASS)

All core transaction logic and server-authoritative calculations are implemented and verified in PostgreSQL:

### F.1 Backend: Orders Module — [x] Completed (36 Tests)
- [x] Strict state machine engine: `PLACED` → `ACCEPTED` → `PREPARING` → `READY_FOR_PICKUP` → `OUT_FOR_DELIVERY` → `DELIVERED`
- [x] Dynamic Haversine distance pricing: Server-authoritative subtotal, delivery fee, and platform fee
- [x] Secure 4-digit Delivery OTP generated on order creation
- [x] Atomic transactions wrapped in `DataSource.transaction`
- [x] Endpoints: `POST /orders`, `GET /orders/customer/my-orders`, `GET /orders/merchant/:merchantId`, `GET /orders/delivery-partner/my-orders`, `GET /orders/:id`, `PATCH /orders/:id/status`, `POST /orders/:id/verify-delivery`
- **Files:** `backend/src/orders/` (36 passing tests in `orders.service.spec.ts`)

### F.2 Backend: Customer Addresses Module — [x] Completed (39 Tests)
- [x] Address entity with WGS-84 coordinates (`latitude`, `longitude`), street address, landmark, city
- [x] Strict address ceiling (`MAX_ADDRESSES_PER_CUSTOMER = 20`)
- [x] Atomic single-default swap and auto-promotion on delete
- [x] IDOR defense via `@Roles(Role.CUSTOMER)` and composite `{ id, customerId }` queries
- [x] Endpoints: `POST /addresses`, `GET /addresses`, `GET /addresses/:id`, `PATCH /addresses/:id`, `PATCH /addresses/:id/set-default`, `DELETE /addresses/:id`
- **Files:** `backend/src/addresses/` (39 passing tests in `addresses.service.spec.ts`)

### F.3 Backend: Authentication & Products Modules — [x] Completed (55 Tests)
- [x] Firebase phone OTP login and registration with role separation
- [x] JWT token rotation with `POST /auth/refresh`
- [x] Products catalog CRUD protected by `@Roles(Role.MERCHANT)`
- [x] Nearby merchant discovery with batch-product hydration
- **Files:** `backend/src/authentication/`, `backend/src/products/`, `backend/src/merchants/`

### F.4 Shared Mobile Core Packages — [x] Completed
- [x] `@lahm/tokens`: Numeric point tokens (`tokens.json`), Theme 1 ("Warm Artisan") palette
- [x] `@lahm/api`: Centralized `QueryClient`, `tokenStorage` with `expo-secure-store`, `authStore` with Zustand
- [x] Customer auth views modularized into sub-views (`ChoiceView`, `PhoneFormView`, `OtpVerifyView`, `RegisterDetailsView`, `AuthSuccessView`)

---

## Release 1: Lahm Customer Super-App (Days 1–6: Oct 13 – Oct 18)

**Mission:** Deliver a complete, installable Halal Super-App providing 5-Tab department browsing, meat cut customization, persistent cart drawer, address management, checkout, and live OTP order tracking.

```
Customer App Architecture
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx           # 5-Tab bar (Meats, Restaurants, Groceries, Orders, Account)
│   │   ├── meats.tsx             # 🥩 Meats department bridge
│   │   ├── restaurants.tsx       # 🍽️ Restaurants department bridge
│   │   ├── groceries.tsx         # 🛒 Groceries department bridge
│   │   ├── orders.tsx            # 📦 Orders department bridge
│   │   └── account.tsx           # 👤 Account & settings bridge
│   ├── shop/[id].tsx             # Merchant storefront bridge
│   ├── checkout.tsx              # Order checkout bridge
│   └── order/[id].tsx            # Live tracking & OTP bridge
```

### 1.1 Shared UI Primitives in `@lahm/ui`
- [ ] Build **Card**: Native container with subtle elevation and active press scale (`transform: [{ scale: 0.98 }]`).
- [ ] Build **StatusBadge**: Semantic pill-shaped badge for order statuses and store availability.
- [ ] Build **QuantityStepper**: Tactile +/- buttons with `expo-haptics` and count display.
- [ ] Build **SkeletonLoader**: Content-shaped shimmer placeholder for feeds and cards.
- [ ] Build **BottomSheet**: Gesture-driven slide-up sheet with drag handle and backdrop dimming.
- [ ] Build **formatCurrency**: Internationalized currency formatter supporting INR, JPY (0 decimals), and CNY.

### 1.2 Customer 5-Tab Shell & Floating Cart Drawer
- [ ] Create Expo Router tab layout `app/(tabs)/_layout.tsx` with stroke vector icons (`@expo/vector-icons`).
- [ ] Implement persistent floating Cart Drawer pill (`FloatingCartPill.tsx`) anchored above bottom tabs.
- [ ] Implement `cartStore.ts` with Zustand enforcing single-merchant cart, quantity mutations, and minimum order rules.
- [ ] Implement gesture-driven `CartDrawer.tsx` displaying itemized cuts, quantity steppers, subtotal, and "Proceed to Checkout" CTA.

### 1.3 Department Feeds (Meats, Restaurants, Groceries)
- [ ] **🥩 Meats Feed (`MeatsHomeScreen.tsx`):** Location-aware fresh Halal butcher spotlights, category chips (Beef, Mutton, Poultry), Halal certificates, and distance badges consuming `GET /merchant/nearby`.
- [ ] **🍽️ Restaurants Feed (`RestaurantsHomeScreen.tsx`):** Halal restaurants and dining hotels, cuisine filters, prep times, and dish highlights consuming `GET /merchant/nearby?type=RESTAURANT`.
- [ ] **🛒 Groceries Feed (`GroceriesHomeScreen.tsx`):** Halal supermarket FMCG staples and grocery merchants consuming `GET /merchant/nearby?type=GROCERY`.

### 1.4 Merchant Storefront & Meat Cut Customizer
- [ ] Implement `ShopStorefrontScreen.tsx` (`app/shop/[id].tsx`) consuming `GET /merchant/storefront/:id`.
- [ ] Implement **Meat Cut Customizer** bottom sheet:
  - Thickness selection (Curry Cut, Biryani Cut, Steaks, Mince)
  - Preparation choice (Bone-In, Boneless, Fat Trimmed)
  - Weight selector with ±50g tactile stepper
  - "Add to Cart" CTA with spring animation and haptic confirmation

### 1.5 Multi-Address Book & Saved Address Picker
- [ ] Implement `AddressBookScreen.tsx` consuming `GET /addresses` and `POST /addresses`.
- [ ] Implement `AddressPickerSheet.tsx` for quick dropoff selection during cart/checkout.
- [ ] Support coordinate anchoring (`latitude`, `longitude`), landmark, street address, and "Set Default" atomic swap (`PATCH /addresses/:id/set-default`).

### 1.6 Dynamic Delivery Fee Checkout
- [ ] Implement `CheckoutScreen.tsx` (`app/checkout.tsx`):
  - Selected address review with distance calculation
  - Itemized order breakdown
  - Dynamic delivery fee, platform fee, and grand total display
  - "Place Halal Order" CTA triggering `POST /orders` via TanStack Query mutation
  - On success: Clear cart and transition to Live Tracking screen

### 1.7 Live Order Tracking Timeline & 4-Digit OTP Screen
- [ ] Implement `OrderTrackingScreen.tsx` (`app/order/[id].tsx`) consuming `GET /orders/:id`:
  - 5-second polling synchronization (`refetchInterval: 5000`)
  - Prominent 4-digit Delivery OTP card formatted with monospace code boxes
  - Visual status stepper: `PLACED` → `ACCEPTED` → `PREPARING` → `READY_FOR_PICKUP` → `OUT_FOR_DELIVERY` → `DELIVERED`
  - Delivery partner card with vehicle details and call button once assigned

### 1.8 Customer Order History & Itemized Receipts
- [ ] Implement `OrderHistoryScreen.tsx` on the Orders tab (`app/(tabs)/orders.tsx`) consuming `GET /orders/customer/my-orders`.
- [ ] Render chronological order cards with status badges, date, items summary, and one-tap reorder or tracking navigation.

---

## Release 2: Lahm Merchant Partner App (Days 7–9: Oct 19 – Oct 21)

**Mission:** Deliver a complete, installable Merchant Operations App enabling butchers, restaurateurs, and grocers to manage store availability, process orders in real time, transition preparation states, and verify courier handoffs.

```
Merchant App Architecture
├── app/
│   ├── dashboard.tsx             # Main merchant operations hub
│   ├── orders.tsx                # Kitchen / Order board
│   ├── catalog.tsx               # Product catalog management
│   └── settings.tsx              # Store timings & profile
```

### 2.1 Persistent Store Online/Offline Availability Switch
- [ ] Wire store status switch on merchant dashboard to `PATCH /merchant/user/:userId` (`isOnline: boolean`).
- [ ] Implement optimistic UI toggle with tactile haptic feedback and real-time backend persistence.
- [ ] Display store operational banner (Open for Orders vs Paused / Closed).

### 2.2 Kitchen Order Board with Live Polling Queue
- [ ] Implement `KitchenOrderBoardScreen.tsx` consuming `GET /orders/merchant/:merchantId` with 5-second polling.
- [ ] Add audible and tactile alerts when new `PLACED` orders arrive.
- [ ] Segment orders into clean status tabs:
  - **Incoming (`PLACED`):** Review order specifications with "Accept Order" and "Decline" CTAs.
  - **Preparing (`ACCEPTED`, `PREPARING`):** Active preparation with "Start Preparing" and "Mark Ready for Pickup" CTAs.
  - **Ready for Pickup (`READY_FOR_PICKUP`):** Packaged orders awaiting courier arrival.
  - **Completed (`OUT_FOR_DELIVERY`, `DELIVERED`):** Past order archive.

### 2.3 Order Preparation State Machine Actions
- [ ] Connect order card action buttons to `PATCH /orders/:id/status`:
  - `PLACED` → `ACCEPTED` (`status: ACCEPTED`)
  - `ACCEPTED` → `PREPARING` (`status: PREPARING`)
  - `PREPARING` → `READY_FOR_PICKUP` (`status: READY_FOR_PICKUP`)
  - `PLACED` → `DECLINED` (`status: DECLINED`, cancellation reason prompt)
- [ ] Invalidate TanStack Query cache on mutation success for instantaneous UI updates.

### 2.4 Multi-Vertical Catalog CRUD
- [ ] Refactor `ProductCatalogView.tsx` and `ProductFormModal.tsx` to support vertical-specific fields:
  - **Meats (`MEAT_SHOP`):** Cut type, weight pack, bone-in/boneless toggle.
  - **Restaurants (`RESTAURANT`):** Prep time in minutes, spice level, dish course.
  - **Groceries (`GROCERY`):** Unit size (e.g. 500g, 1L), FMCG brand.
- [ ] One-tap in-stock / out-of-stock toggle updating `isAvailable` via `PATCH /products/:id`.

### 2.5 Courier Handover Verification Modal
- [ ] When order is `READY_FOR_PICKUP` and courier arrives, provide "Verify Handover" modal.
- [ ] Display courier name, vehicle registration, and itemized package checklist to ensure correct handoff.

---

## Release 3: Lahm Courier Delivery App (Days 10–12: Oct 22 – Oct 24)

**Mission:** Deliver a complete, installable Delivery Partner App enabling drivers to toggle duty, receive dispatch requests with countdown timers, navigate pickup and dropoff routes, and securely verify delivery completion via the customer's 4-digit OTP.

```
Delivery App Architecture
├── app/
│   ├── dashboard.tsx             # Duty radar and active status
│   ├── active-delivery.tsx       # Route execution stepper
│   ├── history.tsx               # Payouts and earnings log
│   └── profile.tsx               # Vehicle and license details
```

### 3.1 Duty Radar (Online / Offline Mode)
- [ ] Implement `DutyRadarScreen.tsx` with animated pulsing radar in `app/dashboard.tsx`.
- [ ] One-tap Online/Offline duty toggle persisting to `PATCH /delivery-partners/user/:userId` (`isOnline: boolean`).
- [ ] Active state polls for assigned dispatches or available orders ready for pickup.

### 3.2 Incoming Dispatch Request Card with 30-Second Countdown
- [ ] Implement `IncomingDispatchCard.tsx`:
  - 30-second circular SVG countdown timer
  - Merchant shop name, address, and distance to pickup
  - Customer dropoff address and distance
  - Delivery payout amount (formatted via `formatCurrency`)
  - "Accept Dispatch" (`ASSIGNED`) and "Decline" action buttons

### 3.3 Step-by-Step Route Execution
- [ ] Implement `ActiveDeliveryScreen.tsx` with 2-stage execution flow:
  - **Phase 1: Navigate to Merchant:** Shop address, merchant phone CTA, itemized cut checklist, and "Confirm Pickup" button (`PATCH /orders/:id/status` → `OUT_FOR_DELIVERY`).
  - **Phase 2: Navigate to Customer:** Dropoff address, customer call CTA, and "Arrived at Dropoff" prompt.

### 3.4 Secure 4-Digit OTP Handover Verification Modal
- [ ] Implement `DeliveryOtpModal.tsx`:
  - 4-box PIN keypad input
  - Submits to `POST /orders/:id/verify-delivery { otp }`
  - On valid OTP: Order transitions to `DELIVERED`, triggers celebration haptics, updates shift earnings, and returns partner to available duty radar.
  - On invalid OTP: Tactile error shake and clear warning message.

### 3.5 Delivery History & Payout Tracker
- [ ] Implement `DeliveryHistoryScreen.tsx` consuming `GET /orders/delivery-partner/my-orders`.
- [ ] Display completed trips, total daily payout, distance covered, and tips.

---

## Release 4: 3-App End-to-End Cross-Device Integration & Launch Hardening (Days 13–15: Oct 25 – Oct 27)

**Mission:** Execute simultaneous live validation across Customer, Merchant, and Delivery Partner apps, enforce multi-country compliance, and verify 100% production readiness before the October 27, 2026 IST deadline.

### 4.1 Live Cross-Device Ordering Simulation
- [ ] Run simultaneous test on 3 devices:
  1. Customer places order on mobile 1 (`POST /orders`).
  2. Merchant receives polled alert on mobile 2, accepts and marks ready (`PATCH /orders/:id/status`).
  3. Delivery partner accepts dispatch on mobile 3, confirms pickup (`OUT_FOR_DELIVERY`).
  4. Delivery partner arrives at customer, inputs 4-digit OTP, submits to `POST /orders/:id/verify-delivery`.
  5. All 3 apps transition to `DELIVERED` in real time with zero stale state.

### 4.2 International Multi-Country Compliance Audit
- [ ] **Zero Hardcoded Currency Signs:** Verify zero hardcoded `₹`, `¥`, or `$` across all JSX files. All prices formatted via `formatCurrency`.
- [ ] **Zero-Decimal JPY Support:** Verify JPY formats without fractional decimals and INR/CNY format with 2 decimals.
- [ ] **Global E.164 Phone Format:** Verify phone authentication supports `+91` (India), `+81` (Japan), and `+86` (China) with vector flag icons.

### 4.3 Final Quality Gate & Launch Verification
- [ ] Verify zero mock data or placeholder strings remain across the monorepo.
- [ ] Verify `npx tsc --noEmit` compiles cleanly with 0 errors across all 3 mobile apps.
- [ ] Verify all 130+ backend tests pass with 100% success rate.
- [ ] Sign off for production release on **October 27, 2026 IST**.