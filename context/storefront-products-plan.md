# StorefrontProductsList Component — Architectural Implementation Plan

> **Scope:** Implementation plan for `StorefrontProductsList.tsx` and its 3 vertical-tailored product cards (`MeatProductCard`, `RestaurantProductCard`, `GroceryProductCard`), grounded in Lahm's existing architecture, zero-mock-data standard, and cultural guidelines.

---

## 1. Core Principles & User Constraints

1. **Shared Foundation & Dynamic Vertical Cards:**
   - One shared list container (`StorefrontProductsList.tsx`) managing query state, pagination, shimmer skeletons, and cart actions.
   - Distinct, specialized product cards for each merchant type:
     - 🥩 **Meat Shops:** `MeatProductCard.tsx` (Cut weight, bone-in/boneless prep tags, fresh butchery metadata).
     - 🍽️ **Restaurants:** `RestaurantProductCard.tsx` (Dish title, appetizing 2-line description, customizable tag).
     - 🛒 **Groceries:** `GroceryProductCard.tsx` (Brand/pack size, volume/weight, quick in-stock badge).
2. **Single Category per Merchant (Current Constraint):**
   - For now, we restrict each merchant to their single primary category (or fetch all merchant products directly without multi-level drill-down switching).
3. **Placeholder Image Standard:**
   - Every product card features a soft warm-neutral rounded image container with a centered question mark `?` icon (`Feather name="help-circle"` or stylized `Text`).
   - **Strictly 0% raw meat, 0% animal depictions, 0% humans.**
4. **Cart Interaction:**
   - Tapping `+ ADD` immediately adds 1 item to `useCartStore` with light haptic feedback (`Haptics.impactAsync`).
   - If the product has required customization options (`customizationGroups.length > 0`), it opens the customization sheet.

---

## 2. Visual Design Reference

![Storefront Product Card Options](c:\Users\afriq\Documents\company\project-lahm\context\ui\storefront-product-card-options.png)

---

## 3. Component Architecture & Data Flow

```
MerchantStorefrontScreen.tsx (Master Dispatcher & Data Fetching)
  │
  ├── Reads `storefront.vertical` ('meats' | 'restaurants' | 'groceries')
  │
  ├── case 'meats':
  │     └── <MeatStorefront storefront={storefront} />
  │           ├── <ShopHeader ... />
  │           └── <MeatProductList /> (using useMerchantCatalog)
  │                 └── <MeatProductCard product={item} onAdd={...} />
  │
  ├── case 'restaurants':
  │     └── <RestaurantStorefront storefront={storefront} />
  │           ├── <ShopHeader ... />
  │           └── <RestaurantProductList /> (using useMerchantCatalog)
  │                 └── <RestaurantProductCard product={item} onAdd={...} />
  │
  └── case 'groceries':
        └── <GroceryStorefront storefront={storefront} />
              ├── <ShopHeader ... />
              └── <GroceryProductList /> (using useMerchantCatalog)
                    └── <GroceryProductCard product={item} onAdd={...} />
```

---

## 4. Execution Roadmap: Restaurant Storefront First (End-to-End)

Per user directive, we are fully completing the **Food / Restaurant Storefront** first before moving to other verticals.

---

### Step 1: Image Placeholder Primitive & Restaurant Product Card
- **File 1:** `frontend/apps/customer/src/features/merchant/components/cards/ProductPlaceholderImage.tsx`
  - Reusable soft warm-neutral container with centered question mark `?` icon (`bg-zinc-100`, zero raw meat, zero humans).
- **File 2:** `frontend/apps/customer/src/features/merchant/components/cards/RestaurantProductCard.tsx`
  - Horizontal dish card displaying:
    - Left: `ProductPlaceholderImage` (72x72dp rounded-xl).
    - Middle: Dish name (bold `#0F172A`), 2-line description (`text-zinc-500 text-xs`), price (`₹420`), and `Customizable` pill badge if options exist.
    - Right: Tactile `+ ADD` pill button with haptic feedback.

---

### Step 2: RestaurantStorefront Layout Component
- **File 1:** `frontend/apps/customer/src/features/merchant/components/storefronts/RestaurantStorefront.tsx`
  - Assembles:
    1. `ShopHeader` (configured with `vertical="restaurants"`).
    2. Section Header: e.g. `"Menu Items"` or single category name with item count.
    3. Product catalog feed fetching from `useMerchantCatalog({ merchantId })`.
    4. Maps products to `<RestaurantProductCard />`.
    5. Content-shaped shimmer skeleton loader when fetching.
    6. Empty state when no items are available.

---

### Step 3: Wire into MerchantStorefrontScreen & Live Verification
- **File 1:** `frontend/apps/customer/src/features/merchant/screens/MerchantStorefrontScreen.tsx`
  - Dispatch to `<RestaurantStorefront />` when `storefront.vertical === 'restaurants'`.
  - Pass down storefront metadata and navigation back handler.
- **Verification:**
  - Verify clean TypeScript compilation (`npx tsc --noEmit`).
  - Test live on physical Android device by tapping *Al-Basha Mandi & Grills* or *Zaitoon Signature Restaurant*.

---

## 5. Next Verticals (After Restaurant Storefront is 100% Completed & Verified)
- **Phase B:** Meat Storefront (`MeatStorefront.tsx` + `MeatProductCard.tsx`).
- **Phase C:** Grocery Storefront (`GroceryStorefront.tsx` + `GroceryProductCard.tsx`).


