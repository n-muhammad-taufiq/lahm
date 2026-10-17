# Lahm Platform — 3-App Deliverable Traceability Matrix

This living matrix tracks the end-to-end implementation and delivery status of Project Lahm across **3 complete mobile applications** and a unified backend, directly tied to [`context/final-outcome.md`](./final-outcome.md) and [`3-app-deliverable-architecture-blueprint.md`](file:///home/codespace/.gemini/antigravity-cli/brain/f9a00796-ff07-4e3b-af55-dc6b81098783/3-app-deliverable-architecture-blueprint.md).

---

## 🎯 Target Launch Velocity & Burn-Down Scoreboard

- **Target Launch Date:** **October 27, 2026 IST** (Production Release)
- **Current Milestone Date:** **October 12, 2026 IST**
- **Calendar Days Remaining:** **15 Days**
- **Architecture Baseline:** **130 Passing Backend Unit Tests** across 8 test suites (`npm test` PASS with zero mock data)
- **Deliverable Release Strategy:**
  - **Release 1: Lahm Customer Super-App** (Days 1–6: Oct 13 – Oct 18)
  - **Release 2: Lahm Merchant Partner App** (Days 7–9: Oct 19 – Oct 21)
  - **Release 3: Lahm Courier Delivery App** (Days 10–12: Oct 22 – Oct 24)
  - **Release 4: 3-App E2E Integration & Verification** (Days 13–15: Oct 25 – Oct 27)
- **Schedule Health:** **`ON TRACK WITH CONSOLIDATED DELIVERABLE SCOPE`** (Concentrated 3-App Release Cadence)

---

## 0. Foundation & Backend Transaction Engines (100% Complete)

| Component | Status | Backend Endpoints | Unit Tests | Verification Notes |
|---|:---:|---|---|---|
| **Orders Module Engine** | [x] Complete | `POST /orders`<br>`GET /orders/:id`<br>`GET /orders/customer/my-orders`<br>`GET /orders/merchant/:merchantId`<br>`GET /orders/delivery-partner/my-orders`<br>`PATCH /orders/:id/status`<br>`POST /orders/:id/verify-delivery` | **36/36 Tests PASS** in `orders.service.spec.ts` | Server-authoritative Haversine distance pricing, atomic transaction multi-table commits, 8-state transition engine, 4-digit OTP generation and verification |
| **Customer Addresses Module** | [x] Complete | `POST /addresses`<br>`GET /addresses`<br>`GET /addresses/:id`<br>`PATCH /addresses/:id`<br>`PATCH /addresses/:id/set-default`<br>`DELETE /addresses/:id` | **39/39 Tests PASS** in `addresses.service.spec.ts` | 20-address ceiling per customer, atomic single-default promotion, auto-promotion on delete, IDOR tenant isolation |
| **Products & Catalog Module** | [x] Complete | `GET /products`<br>`GET /products/merchant/:merchantId`<br>`GET /products/:id`<br>`POST /products`<br>`PATCH /products/:id`<br>`DELETE /products/:id` | **24/24 Tests PASS** in `products.service.spec.ts` & `products.controller.spec.ts` | Protected by `@Roles(Role.MERCHANT)`, merchant ownership verification |
| **Authentication & Tokens** | [x] Complete | `POST /auth/firebase-otp-login`<br>`POST /auth/firebase-otp-register`<br>`POST /auth/refresh`<br>`GET /auth/me` | **20/20 Tests PASS** in `authentication.service.spec.ts` | Firebase SMS verification, JWT refresh token rotation, persistent role claims |
| **Merchants Discovery** | [x] Complete | `GET /merchant/nearby`<br>`GET /merchant/storefront/:id`<br>`GET /merchant/:id`<br>`PATCH /merchant/user/:userId` | **11/11 Tests PASS** in `merchants.controller.spec.ts` & `app.controller.spec.ts` | Haversine coordinates search, batch product hydration, zero seed fallbacks |

---

## Release 1: Lahm Customer Super-App (`frontend/apps/customer`)

**Target Delivery Window:** Days 1–6 (October 13 – October 18, 2026 IST)

| # | Screen / Feature | Status | Live Backend Endpoint | Frontend Architecture & File Target | Verification Standard |
|---|---|:---:|---|---|---|
| **C.1** | **Customer Auth Flow (Splash, Phone, OTP, Profile)** | [x] Complete | `POST /auth/firebase-otp-login`<br>`POST /auth/firebase-otp-register` | [`ChoiceView.tsx`](../frontend/apps/customer/src/features/auth/components/ChoiceView.tsx), [`PhoneFormView.tsx`](../frontend/apps/customer/src/features/auth/components/PhoneFormView.tsx), [`OtpVerifyView.tsx`](../frontend/apps/customer/src/features/auth/components/OtpVerifyView.tsx), [`RegisterDetailsView.tsx`](../frontend/apps/customer/src/features/auth/components/RegisterDetailsView.tsx) | Clean TypeScript compile, zero mock notices, tokenized styles |
| **C.2** | **Customer 5-Tab Navigation Shell & Bottom Bar** | [⏳] In Progress | — | `app/(tabs)/_layout.tsx`, tabs: `meats`, `restaurants`, `groceries`, `orders`, `account` | Stroke vector icons only (`@expo/vector-icons`), safe area padding |
| **C.3** | **Floating Cart Drawer Pill & Zustand Store** | [⏳] In Progress | — | `stores/cartStore.ts`, `components/FloatingCartPill.tsx`, `components/CartDrawer.tsx` | Single-merchant enforcement, tactile steppers, spring animations |
| **C.4** | **🥩 Meats Department Feed** | [⏳] In Progress | `GET /merchant/nearby` | `features/meats/screens/MeatsHomeScreen.tsx`, `useNearbyMerchants.ts` | Halal butcher spotlight, category pills (Beef, Mutton, Chicken), distance |
| **C.5** | **Merchant Storefront Screen** | [ ] Pending | `GET /merchant/storefront/:id` | `app/shop/[id].tsx`, `features/shop/screens/ShopProfileScreen.tsx` | Shop banner, rating, available products list with "Add" CTAs |
| **C.6** | **Meat Cut Customizer Modal** | [ ] Pending | — | `features/shop/components/MeatCutCustomizerModal.tsx` | Gesture bottom sheet, cut thickness, trimming, ±50g weight stepper |
| **C.7** | **🍽️ Restaurants Department Feed** | [ ] Pending | `GET /merchant/nearby` | `features/restaurants/screens/RestaurantsHomeScreen.tsx` | Dining/hotels filtering, cuisine chips, prep time badges |
| **C.8** | **🛒 Groceries Department Feed** | [ ] Pending | `GET /merchant/nearby` | `features/groceries/screens/GroceriesHomeScreen.tsx` | Supermarket FMCG staples, pack sizes, pantry essentials |
| **C.9** | **Multi-Address Book & Saved Address Picker** | [⏳] In Progress | `GET /addresses`<br>`POST /addresses`<br>`PATCH /addresses/:id/set-default` | `features/address/screens/AddressBookScreen.tsx`, `AddressPickerSheet.tsx` | Consumes live Address endpoints; coordinate anchoring; ceiling of 20 |
| **C.10** | **Dynamic Delivery Fee Checkout Screen** | [⏳] In Progress | `POST /orders` | `app/checkout.tsx`, `features/checkout/screens/CheckoutScreen.tsx` | Server-authoritative subtotal, Haversine delivery fee, atomic order placement |
| **C.11** | **Live Order Tracking Timeline Screen & 4-Digit OTP** | [⏳] In Progress | `GET /orders/:id` | `app/order/[id].tsx`, `features/orders/screens/OrderTrackingScreen.tsx` | 5s TanStack polling, visual status stepper, prominent 4-box OTP card |
| **C.12** | **Order History & Receipts** | [⏳] In Progress | `GET /orders/customer/my-orders` | `app/(tabs)/orders.tsx`, `features/orders/screens/OrderHistoryScreen.tsx` | Chronological orders, status badges, one-tap reorder/track CTA |

---

## Release 2: Lahm Merchant Partner App (`frontend/apps/merchant`)

**Target Delivery Window:** Days 7–9 (October 19 – October 21, 2026 IST)

| # | Screen / Feature | Status | Live Backend Endpoint | Frontend Architecture & File Target | Verification Standard |
|---|---|:---:|---|---|---|
| **M.1** | **Merchant Auth & Store Profile Wizard** | [x] Complete | `POST /auth/firebase-otp-login`<br>`POST /merchant/register` | `MerchantLoginScreen.tsx`, `MerchantRegisterWizard.tsx` | Authenticates merchant role, captures shop address & coordinates |
| **M.2** | **Store Online/Offline Status Switch** | [ ] Pending | `PATCH /merchant/user/:userId` (`isOnline`) | `app/dashboard.tsx`, `useMerchantStoreStatus.ts` | One-tap switch with optimistic update, haptics, and DB persistence |
| **M.3** | **Kitchen Order Board with Polled Queue** | [⏳] In Progress | `GET /orders/merchant/:merchantId` | `features/orders/screens/KitchenOrderBoardScreen.tsx` | 5s TanStack Query polling, audible/tactile alerts on new `PLACED` orders |
| **M.4** | **Order Action Stepper (Accept → Prep → Ready)** | [⏳] In Progress | `PATCH /orders/:id/status` | `features/orders/components/MerchantOrderCard.tsx` | State machine transitions: `ACCEPTED`, `PREPARING`, `READY_FOR_PICKUP`, `DECLINED` |
| **M.5** | **Multi-Vertical Catalog CRUD** | [⏳] In Progress | `GET /products/merchant/:id`<br>`POST /products`<br>`PATCH /products/:id`<br>`DELETE /products/:id` | `ProductCatalogView.tsx`, `ProductFormModal.tsx` | Custom attributes for Meats (cuts/weights), Dining (prep time), Groceries (pack) |
| **M.6** | **Courier Handover Verification Modal** | [ ] Pending | `orders.service.ts` state check | `features/orders/components/CourierHandoverModal.tsx` | Courier identity check and itemized cut checklist upon courier arrival |

---

## Release 3: Lahm Courier Delivery App (`frontend/apps/delivery`)

**Target Delivery Window:** Days 10–12 (October 22 – October 24, 2026 IST)

| # | Screen / Feature | Status | Live Backend Endpoint | Frontend Architecture & File Target | Verification Standard |
|---|---|:---:|---|---|---|
| **D.1** | **Courier Auth & Vehicle Registration** | [x] Complete | `POST /auth/firebase-otp-login`<br>`POST /delivery-partners/register` | `DeliveryLoginScreen.tsx`, `DeliveryRegisterWizard.tsx` | Authenticates courier, captures vehicle type, registration, and license |
| **D.2** | **Duty Radar (Online/Offline Duty Toggle)** | [⏳] In Progress | `PATCH /delivery-partners/duty`<br>`PATCH /delivery-partners/location` | `app/dashboard.tsx`, `features/duty/DutyRadarScreen.tsx` | Backend 100% complete with RBAC guards & GPS heartbeat; Frontend pending |
| **D.3** | **Incoming Dispatch Request Card with 30s Countdown** | [ ] Pending | `GET /orders/delivery-partner/my-orders` | `features/dispatch/IncomingDispatchCard.tsx` | 30s countdown circular timer, pickup & dropoff distance, payout amount |
| **D.4** | **Step-by-Step Route Execution** | [⏳] In Progress | `PATCH /orders/:id/status` (`OUT_FOR_DELIVERY`) | `features/delivery/ActiveDeliveryScreen.tsx` | Phase 1 (Pickup at Shop + Confirm Pickup) → Phase 2 (Dropoff at Customer) |
| **D.5** | **Secure 4-Digit OTP Handover Verification Modal** | [⏳] In Progress | `POST /orders/:id/verify-delivery` | `features/delivery/DeliveryOtpModal.tsx` | 4-box PIN keypad input; validates match; jumps order to `DELIVERED` |
| **D.6** | **Shift Payout Tracker & Delivery History** | [ ] Pending | `GET /orders/delivery-partner/my-orders` | `features/history/DeliveryHistoryScreen.tsx` | Daily earnings tally, completed orders list, distance logged |

---

## Release 4: 3-App E2E Integration & Launch Hardening

**Target Delivery Window:** Days 13–15 (October 25 – October 27, 2026 IST)

| # | Quality Standard / Audit Item | Status | Verification Protocol | Target Completion |
|---|---|:---:|---|---|
| **E.1** | **3-App Live Cross-Device Ordering Simulation** | [ ] Pending | Customer places order → Merchant accepts & readies → Courier picks up → Customer provides 4-digit OTP → Courier verifies → All 3 apps update in real time | October 25, 2026 IST |
| **E.2** | **Zero Hardcoded Currency Signs & Multi-Currency** | [⏳] In Progress | Shared `formatCurrency` utility in `@lahm/ui`; zero raw `₹`, `¥`, or `$` in JSX; handles INR, JPY (0 decimals), and CNY | October 26, 2026 IST |
| **E.3** | **Global E.164 Phone Authentication (+91, +81, +86)** | [⏳] In Progress | Phone inputs format to E.164; country picker updated with vector flags (zero emojis) | October 26, 2026 IST |
| **E.4** | **Full Production Quality Gate & App Store Sign-Off** | [ ] Pending | Clean TypeScript compile across all 3 apps (`npx tsc --noEmit`), 130+ passing backend unit tests, zero mock notices | **October 27, 2026 IST** |
