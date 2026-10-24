# Project Lahm — Remote Agent Handoff Briefing

> **Purpose:** This document is the primary briefing for any incoming autonomous or remote AI agent taking over development on Project Lahm. Read this file completely before taking any action.

---

## 1. Project Context & Milestone Velocity

- **Hard Launch Deadline:** **October 27, 2026 IST**
- **Current Milestone:** **Release 1: Lahm Customer Super-App** (October 13 – October 18/19, 2026 IST)
- **Active Testing Setup:** The customer app is being actively tested on a **physical Android mobile device (`192.168.1.3`)** connected to the local Metro bundler (`npx expo start -c` on port `8081`).
- **Direct App Landing:** The customer app launches directly into [`CustomerHomeScreen.tsx`](file:///c:/Users/afriq/Documents/company/project-lahm/frontend/apps/customer/src/features/home/CustomerHomeScreen.tsx) (`frontend/apps/customer/src/app/index.tsx`). Authentication is preserved at `frontend/apps/customer/src/app/login.tsx`.

---

## 2. Completed Home Screen Components (Steps 1–4)

The Customer Home Screen is being assembled piece-by-piece from a blank canvas following the approved **Version 9 Design**:

| Step | Component | File Path | Status & Implementation Highlights |
|---|---|---|---|
| **Step 1** | Delivery Header | [`HomeDeliveryHeader.tsx`](file:///c:/Users/afriq/Documents/company/project-lahm/frontend/apps/customer/src/features/home/components/HomeDeliveryHeader.tsx) | Pinned header: `DELIVER TO: Home - Anna Nagar, Chennai 📍 ▾` with notification bell, haptic feedback, and `useCustomerLocation` hook. |
| **Step 2** | Search & Filter Bar | [`HomeSearchBar.tsx`](file:///c:/Users/afriq/Documents/company/project-lahm/frontend/apps/customer/src/features/home/components/HomeSearchBar.tsx) | 48dp rounded-2xl search container, search vector icon, clear button, and tactile filter sliders trigger button. |
| **Step 3** | Category Switcher | [`DepartmentSwitcher.tsx`](file:///c:/Users/afriq/Documents/company/project-lahm/frontend/apps/customer/src/features/home/components/DepartmentSwitcher.tsx) | 44dp segmented capsule track (Option 1). Controls `activeDepartment` state (`'meat' \| 'restaurants' \| 'groceries'`). Uses **Halal Quality Shield (`Ionicons shield-checkmark-outline`)** for Meats. |
| **Step 4** | Brand Hero Banner | [`HeroCampaignBanner.tsx`](file:///c:/Users/afriq/Documents/company/project-lahm/frontend/apps/customer/src/features/home/components/HeroCampaignBanner.tsx) | Evergreen Brand Hero Banner: Warm terracotta peach gradient (`#E77A62` → `#D9664E`), `LAHM لحم • 100% HALAL VERIFIED`, `Pure, Farm-Fresh & 100% Halal Certified`, and `Discover Lahm ➔` CTA button. Fully tokenized via `@lahm/tokens`. |

All four components are mounted and rendered inside [`CustomerHomeScreen.tsx`](file:///c:/Users/afriq/Documents/company/project-lahm/frontend/apps/customer/src/features/home/CustomerHomeScreen.tsx) within a native `ScrollView`.

---

## 3. Non-Negotiable Directives & Rules (CRITICAL)

Every incoming agent must strictly comply with these project rules without exception:

1. **Strict Zero-Meat & Zero-Living-Things Rule:**
   - **STRICTLY NO** depictions of raw meat, carcass, steaks, cuts of meat, or living animals/livestock anywhere in UI icons or hero banners.
   - For Meat Shops, use the **Halal Quality Shield icon (`Ionicons name="shield-checkmark-outline"`)**.
2. **Strict Zero-Human Rule:**
   - **STRICTLY NO** photos of human faces, chefs, butchers, or people on the home screen cards.
3. **No Raw Emojis:**
   - Never use raw emojis (`🥩`, `🍽️`, `🛒`, `🔍`) as icons in the production UI. Use vector stroke icons (`@expo/vector-icons` / `Feather` / `Ionicons`).
4. **Strict Incremental Protocol:**
   - **1–2 files limit per turn** (~100 lines target). If a change requires 3+ files, split it into separate turns.
   - React components must stay under ~200 lines.
5. **No Mock Data:**
   - Connect all feeds to real backend API endpoints (`GET /merchants/nearby`) via TanStack Query.
6. **Colocation Commitment:**
   - Keep Customer Home components in `frontend/apps/customer/src/features/home/components/`. Do not prematurely export to `@lahm/ui` unless multiple apps require the primitive.
7. **Consultation Protocol:**
   - When the user asks for **suggestions, opinions, or design choices**, **DO NOT CODE ANYTHING**. Provide visual design sheets or architectural analysis only.

---

## 4. Visual Design References in Repository

Before implementing new visual components, refer to the high-resolution mockups saved in `context/ui/`:
- **Version 9 Approved Reference:** [`context/ui/version9.png`](file:///c:/Users/afriq/Documents/company/project-lahm/context/ui/version9.png) (Full-bleed merchant cards, white floating cart, 4-tab bar).
- **Category Switcher Options Sheet:** [`context/ui/category-switcher-options.png`](file:///c:/Users/afriq/Documents/company/project-lahm/context/ui/category-switcher-options.png)
- **Dynamic Brand Hero Exploration:** [`context/ui/dynamic-hero-banner-options.png`](file:///c:/Users/afriq/Documents/company/project-lahm/context/ui/dynamic-hero-banner-options.png)
- **Option 1 Background Scrim Preview:** [`context/ui/option1-bg-image-preview.png`](file:///c:/Users/afriq/Documents/company/project-lahm/context/ui/option1-bg-image-preview.png)

---

## 5. Next Immediate Implementation Tasks

### Completed Milestones
- [x] **Step 5: The Merchant Discovery Feed (`MerchantCard.tsx` / `CustomerHomeScreen.tsx`):** Connected to real Ambattur OT merchants seeded in PostgreSQL via `useNearbyMerchants`. Mock arrays and candy badges eliminated.
- [x] **Shop Header UI Architecture:** Authored `ShopHeader.tsx`, `ShopHeaderHeroBanner.tsx`, and `ShopIdentityCard.tsx` with clean typographic metadata line (`★ 4.9 • Category • Chennai • Open until 11:00 PM`).
- [x] **Product Category Database Foundation:** Created `ProductCategory` entity with self-referencing hierarchy (`parentId`), merchant tenant isolation, configurable depth column (`MAX_CATEGORY_DEPTH`), and linked `Product` entity with index.

### Active Milestone: C.5 Merchant Storefront Screen & Recursive Product Category Catalog

We are building the recursive category catalog supporting up to 4 levels of nested categories (e.g., `Biryani → Chicken Biryani → Platters`) with zero mock data.

#### Execution Roadmap (Strict Rule: One Method / One File at a Time):
1. [x] **Step 4.1:** Implement `getMerchantCategories` method in `ProductsService`:
   - Returns the category tree up to `process.env.MAX_CATEGORY_DEPTH || '4'`.
   - Computes `hasChildren` and real-time `productCount`.
2. [x] **Step 4.2:** Implement `getMerchantCatalog` method in `ProductsService`:
   - Paginated product browsing by `categoryId` with shop tenant validation, search, and customization options joined (meatDetails omitted per user instruction).
3. [x] **Step 4.3:** Add endpoints to `ProductsController` (`GET /products/merchant/:merchantId/categories` and `GET /products/merchant/:merchantId/catalog`).
4. [x] **Step 4.4:** Update `seeder.service.ts` to seed real multi-level categories for Ambattur merchants and re-run seed.
5. [x] **Step 4.5:** Update `@lahm/api` with category/catalog DTOs & API client methods, and implement TanStack Query hooks (`useMerchantCategories`, `useMerchantCatalog`).
6. [ ] **Step 4.6 (Active):** Build mobile UI components (`CategoryDrillDownSelector.tsx`, `StorefrontProductList.tsx`) and integrate into `MerchantStorefrontScreen.tsx`.

### Step 6: White Floating Cart Capsule (`FloatingCartCapsule.tsx`)
- Persistent white floating pill anchored above safe area bottom insets:
  `🛒 2 items • ₹650 | View Cart ➔`.
- Bound to Zustand `cartStore.ts`.

### Step 7: 4-Tab Bottom Navigation Bar
- Native bottom tab bar: `[Home, Shop, Orders, Profile]`.

---

## 6. How to Run & Verify

1. **Start Metro Bundler:**
   ```powershell
   cd c:\Users\afriq\Documents\company\project-lahm\frontend\apps\customer
   npx expo start -c
   ```
2. **Type Check:**
   ```powershell
   cd c:\Users\afriq\Documents\company\project-lahm\frontend\apps\customer
   npx tsc --noEmit
   ```
3. **Log Every Turn:**
   Update [`context/communication.md`](file:///c:/Users/afriq/Documents/company/project-lahm/context/communication.md) after every single step following the Mandatory Step Communication Protocol.
