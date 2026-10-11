# Lahm Platform — Final Outcome Traceability Checklist

This living checklist tracks the end-to-end implementation status of every requirement specified in [`context/final-outcome.md`](./final-outcome.md). Each feature must be backed by real code files, zero mock data, and verified by the `production-auditor`.

---

## 1. Customer Mobile App

| # | Requirement (from `final-outcome.md`) | Status | Backend Files / Endpoints | Frontend Files / Components | Verification |
|---|---|:---:|---|---|---|
| **C.1** | **Phone OTP & Firebase Authentication** | [x] Complete | `POST /auth/firebase-otp-login`, `POST /auth/firebase-otp-register` | [`ChoiceView.tsx`](../frontend/apps/customer/src/features/auth/components/ChoiceView.tsx), [`PhoneFormView.tsx`](../frontend/apps/customer/src/features/auth/components/PhoneFormView.tsx), [`OtpVerifyView.tsx`](../frontend/apps/customer/src/features/auth/components/OtpVerifyView.tsx), [`RegisterDetailsView.tsx`](../frontend/apps/customer/src/features/auth/components/RegisterDetailsView.tsx), [`index.tsx`](../frontend/apps/customer/src/app/index.tsx) | Clean TypeScript compile, zero mock notices |
| **C.2** | **Location-Aware Nearby Halal Shop Discovery** | [⏳] In Progress | `GET /merchant/nearby` in [`merchants.service.ts`](../backend/src/merchants/merchants.service.ts) | [`CustomerHomeScreen.tsx`](../frontend/apps/customer/src/features/home/CustomerHomeScreen.tsx), [`useCustomerLocation.ts`](../frontend/apps/customer/src/features/location/useCustomerLocation.ts) | Nearby Haversine query working; TanStack Query refactor pending |
| **C.3** | **Storefront & Fresh Meat Cuts Browsing** | [ ] Pending | `GET /merchant/storefront/:id` in `merchants.controller.ts` | Target: `features/shop/screens/ShopProfileScreen.tsx` | Not started |
| **C.4** | **Single-Merchant Cart & Quantity Controls** | [ ] Pending | Target: backend cart validation | Target: `stores/cartStore.ts`, `QuantityStepper.tsx` | Not started |
| **C.5** | **Delivery Address Management** | [ ] Pending | Target: `addresses/` module | Target: `features/address/` | Not started |
| **C.6** | **Checkout & Order Placement (`POST /orders`)** | [⏳] In Progress | [`orders.controller.ts`](../backend/src/orders/orders.controller.ts), [`orders.service.ts`](../backend/src/orders/orders.service.ts), [`orders.module.ts`](../backend/src/orders/orders.module.ts) | Target: `features/checkout/screens/CheckoutScreen.tsx` | Backend 100% complete; dynamic Haversine pricing, atomic transaction; 0 tsc errors |
| **C.7** | **Live Order Tracking Timeline & 4-Digit OTP** | [⏳] In Progress | `GET /orders/:id` in [`orders.controller.ts`](../backend/src/orders/orders.controller.ts), 4-digit OTP generator in [`orders.service.ts`](../backend/src/orders/orders.service.ts) | Target: `features/orders/screens/OrderTrackingScreen.tsx` | Backend complete with relational hydration; Frontend pending Phase 6.7 |
| **C.8** | **Order History & Itemized Receipts** | [⏳] In Progress | `GET /orders/customer/my-orders` in [`orders.controller.ts`](../backend/src/orders/orders.controller.ts) | Target: `features/orders/screens/OrderHistoryScreen.tsx` | Backend complete with `createdAt: 'DESC'` sort; Frontend pending Phase 6.8 |

---

## 2. Merchant Mobile App

| # | Requirement (from `final-outcome.md`) | Status | Backend Files / Endpoints | Frontend Files / Components | Verification |
|---|---|:---:|---|---|---|
| **M.1** | **Merchant Authentication & Session** | [x] Complete | `POST /auth/firebase-otp-login` (`role: merchant`) | `MerchantLoginScreen.tsx` | Authenticates merchant role |
| **M.2** | **Store Online/Offline Availability Toggle** | [ ] Pending | Target: `PATCH /merchants/status` | Target: Merchant Dashboard status switch | Not started |
| **M.3** | **Catalog Management (CRUD & In-Stock)** | [⏳] In Progress | `products.controller.ts`, `products.service.ts` | `ProductCatalogView.tsx`, `ProductFormModal.tsx` | Backend CRUD complete with `@Roles(Role.MERCHANT)`; Frontend rebuild planned |
| **M.4** | **Real-Time Incoming Order Queue** | [⏳] In Progress | `GET /orders/merchant/:merchantId` in [`orders.controller.ts`](../backend/src/orders/orders.controller.ts) | Target: `features/orders/screens/MerchantOrdersScreen.tsx` | Backend complete with store ownership gating; Frontend pending Phase 7.2 |
| **M.5** | **Order Preparation Flow (Accept/Preparing/Ready)** | [⏳] In Progress | `PATCH /orders/:id/status` in [`orders.controller.ts`](../backend/src/orders/orders.controller.ts) | Target: Merchant order action buttons | Backend complete with 8-state machine engine; Frontend pending Phase 7.3 |
| **M.6** | **Delivery Partner Pickup Handover Verification** | [⏳] In Progress | `orders.service.ts` status transition (`READY_FOR_PICKUP`) | Target: Handover checklist modal | Backend complete; Frontend pending Phase 7.4 |

---

## 3. Delivery Partner Mobile App

| # | Requirement (from `final-outcome.md`) | Status | Backend Files / Endpoints | Frontend Files / Components | Verification |
|---|---|:---:|---|---|---|
| **D.1** | **Partner Auth & Vehicle Profile Setup** | [x] Complete | `POST /auth/firebase-otp-login` (`role: delivery_partner`) | `DeliveryLoginScreen.tsx`, `DeliveryRegisterWizard.tsx` | Profile captures vehicle details |
| **D.2** | **Online/Offline Duty Toggle** | [ ] Pending | Target: `PATCH /delivery-partners/duty` | Target: Delivery Dashboard duty switch | Not started |
| **D.3** | **Dispatch Allocation & Incoming Request Card** | [ ] Pending | Target: `delivery-allocation/` module | Target: Incoming dispatch modal / card | Not started |
| **D.4** | **Merchant Pickup Confirmation** | [⏳] In Progress | `PATCH /orders/:id/status` (`OUT_FOR_DELIVERY`) in [`orders.controller.ts`](../backend/src/orders/orders.controller.ts) | Target: `ConfirmPickupButton` in Delivery App | Backend complete with driver assignment; Frontend pending Phase 8.3 |
| **D.5** | **Customer OTP Delivery Verification** | [⏳] In Progress | `POST /orders/:id/verify-delivery` in [`orders.controller.ts`](../backend/src/orders/orders.controller.ts) | Target: `DeliveryOtpModal` in Delivery App | Backend complete with 4-digit OTP match & `DELIVERED` state jump; Frontend pending Phase 8.4 |

---

## 4. End-to-End State Consistency & Quality

| Standard | Status | Implementation Details |
|---|:---:|---|
| **Strictly Production-Only Code (Zero Mock/Sandbox)** | [x] Active | Enforced by Rule 1 in `production-rules.md`. Mock notices removed. |
| **Unified Design Tokens (Unitless Points/dp)** | [x] Active | `tokens.json` converted to numeric values; `screenTitle: 28` tokenized. |
| **Native Mobile UX (No Emojis, Native Sheets, Haptics)** | [⏳] In Progress | Component rules enforced; Phase 1 UI primitives will finalize this. |
| **Multi-App State Synchronization** | [ ] Pending | Will be verified in Phase 9.5 cross-device end-to-end integration test. |
