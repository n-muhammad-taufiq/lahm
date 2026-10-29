---
name: lahm-development
description: >-
  Development workflow, step-by-step protocol, native mobile UI rules, 
  and architecture guidelines for Project Lahm. Use whenever writing, 
  modifying, or reviewing code in Lahm.
---

# Lahm Development Skill

This skill guides all development across the Lahm monorepo (Customer, Merchant, Delivery apps, and NestJS backend).

## Core References
- Detailed Development Instructions: [`context/instructions.md`](../../context/instructions.md)
- Development Plan & Roadmap: [`context/plan.md`](../../context/plan.md)
- Project Architecture Overview: [`context/project-overview.md`](../../context/project-overview.md)

---

## 1. Mandatory Step Communication Protocol

Before and after **EVERY SINGLE STEP / TURN**, follow this protocol:

### Before Making Changes:
1. **Objective:** Explain clearly what the step will do and the architectural rationale.
2. **File Manifest:** List all files to be created, modified, or deleted (using markdown links).
3. **Scope:** Detail the exact functions, types, components, or entities to be touched (~100 lines target).

### After Making Changes:
1. **Implementation Summary:** Detail how the code was implemented and how edge cases were handled.
2. **Architecture & Data Flow Context:** Explain how the change connects with existing hooks, state, or APIs.
3. **Verification:** Confirm compilation, type safety, and state the immediate next step.
4. **Mark Progress:** When a task or phase is completed and verified, immediately update `context/plan.md` to mark it as `[x] Completed`.

---

## 2. Incremental Change Protocol

- **Strict 1–2 files limit per step:** ALWAYS keep changes to 1–2 files per turn. If a feature or fix requires touching 3 or more files, you MUST split it into multiple separate steps.
- **~100 lines per turn:** Make small, reviewable changes.
- **~200 lines per component:** React component files should stay under or around 200 lines. Extract sub-views or custom hooks into colocated files when approaching this limit.
- **Verify after every step:** Verify clean compilation after every change before proceeding to the next.

---

## 3. Reusable UI Components

- **"When a reusable UI component is required, develop it."**
- Before writing repetitive or inline UI markup across screens, evaluate if it represents a shared primitive (e.g., card, stepper, badge, bottom sheet, banner, input wrapper, avatar).
- If it does not exist in `@lahm/ui`:
  1. **Develop it first in `@lahm/ui/src/`**: Build the component in its own directory with proper TypeScript types, tokenized styling, and export it from `@lahm/ui/src/index.ts`.
  2. **Keep it under ~200 lines**: Focused, clean, and declarative.
  3. **Consume it in the feature screen**: Import it from `@lahm/ui` rather than duplicating JSX markup inline.
- **Never create one-off copy-pasted UI fragments**: If two or more screens need the same visual element, create the reusable component in `@lahm/ui` as a distinct incremental step.

---

## 4. Native-Friendly Mobile UI Standards

This is a **native mobile app**, NOT a web application. Avoid web anti-patterns:
- **No Emojis as Icons:** STRICTLY NO raw emojis (`📱`, `🥩`, `🛒`, `🔍`) as icons. Use stroke-based vector icons (`@expo/vector-icons` / `lucide-react-native`).
- **Native Bottom Sheets:** Use gesture-driven bottom sheets (`@gorhom/bottom-sheet` or Reanimated sheets) with drag handles and spring physics—NEVER centered web-style alert modals or dropdowns.
- **Tactile Haptic Feedback:** Use `expo-haptics` for steppers, primary buttons, and successful completion states.
- **Spring Press Animations:** Use scale-down spring feedback on press (`transform: [{ scale: 0.97 }]`) or Android ripples.
- **Shimmer Skeletons:** Use content-shaped shimmer skeleton loaders (`SkeletonCard`, `SkeletonList`) for content feeds. NEVER show a blank white screen with a lone centered spinner.
- **Thumb-Zone Layout:** Primary CTAs must be anchored at the bottom with safe area insets (`paddingBottom: insets.bottom + 16`).
- **Keyboard & Forms:** Always use `KeyboardAvoidingView`, `keyboardDismissMode="on-drag"`, and `keyboardShouldPersistTaps="handled"`.

---

## 5. Feature Implementation Order

When building a new full-stack feature (e.g. "Shop Profile", "Cart & Checkout"), execute in this order:

```text
1. Backend entity (if new)          → e.g., order.entity.ts
2. Backend DTO                      → e.g., create-order.dto.ts
3. Backend service                  → e.g., orders.service.ts
4. Backend controller               → e.g., orders.controller.ts
5. Backend module                   → e.g., orders.module.ts (register in app.module.ts)
6. Frontend API function            → e.g., @lahm/api/src/orders/
7. Frontend types                   → e.g., features/orders/types/
8. Frontend hook (TanStack Query)   → e.g., features/orders/hooks/useOrders.ts
9. Frontend screen component        → e.g., features/orders/screens/OrdersScreen.tsx
10. Frontend sub-components         → e.g., features/orders/components/OrderCard.tsx
11. Route file (thin)               → e.g., app/orders/index.tsx
```

---

## 6. State Management Rules

| State Type | Management Tool | Guidelines |
|---|---|---|
| **Server Data** | TanStack Query | Products, orders, merchants, user profile. Handle loading/empty/error states. Never mirror into Zustand. |
| **Shared Client State** | Zustand | Active cart items, auth session tokens, UI preferences. |
| **Local Screen State** | `useState` | Modal open/close toggles, active tab index, temporary text fields. |
| **Forms** | React Hook Form + Zod | Complex forms with validation schemas. |

---

## 8. Holistic Multi-File Feature Completeness & Proactive Awareness

> *"This happens because AI coding agents like Google Antigravity can understand a feature at a high level but still fail to apply every required change across all affected files. The main problem is often not the quality of the code it writes, but the way the implementation task is planned, executed, and verified."* — ChatGPT

### The Anti-Tunnel-Vision Mandate
AI agents naturally suffer from tunnel vision: focusing exclusively on the immediate screen or entity in front of them and declaring victory, while leaving downstream systems silently broken or unaddressed.

Whenever introducing, extending, or modifying an architectural capability or entity relation (e.g., `outletId`, refunds, order status, discount codes, multi-currency), you MUST NOT wait for the user to discover missing downstream steps. You MUST proactively audit and map out the entire lifecycle across all affected files before declaring any phase complete.

### The 7-Stage End-to-End Operational Pipeline
Every feature that alters data or order flow must be audited against these 7 stages:
1. **Data Modeling, Constraints & Seeding:** Entities, migrations, unique constraints, relations, and realistic PostgreSQL seeder data.
2. **Read APIs & Storefront Resolution:** Discovery feeds, catalog queries, price/inventory overrides, and sister-entity resolution.
3. **Client State & Scoping:** Zustand stores, cache invalidation, single-tenant/branch basket scoping, and switch-confirmation modals.
4. **Checkout, Pricing & Persistence:** Authoritative server-side subtotal, GPS distance re-anchoring, dynamic delivery fees, and order persistence with all relational IDs.
5. **Merchant Operations & Kitchen Queues:** Merchant app dashboards, branch-scoped order retrieval (so branch A never sees branch B orders), and kitchen acceptance.
6. **Delivery Allocation & Courier Dispatch:** Automated dispatch engines (e.g. `delivery-allocation.service.ts`), courier radar searches anchored to fulfilling branch GPS (NOT corporate HQ), escalation loops, and pickup addresses on courier offer cards.
7. **Tracking, Receipts & Post-Order Lifecycle:** Customer live tracking maps, courier navigation, push notifications, digital receipts, and ledger attribution.

**Rule:** NEVER declare a feature "done" or "about to be completed" without explicitly listing which of these 7 downstream stages are affected and verifying them file-by-file.

---

## 9. Quality Checklist

Before marking any task complete, verify:
- [ ] Step Communication Protocol followed (explained before & after)
- [ ] Holistic 7-Stage Operational Pipeline audited across all affected files
- [ ] Reusable UI components developed in `@lahm/ui` when required
- [ ] No hardcoded hex colors (all use `@lahm/tokens`)
- [ ] No raw API calls in components (all go through `@lahm/api` + hooks)
- [ ] No `useEffect` for data fetching (all use TanStack Query)
- [ ] No mock or fake data
- [ ] All four states handled (shimmer loading, empty, success, error)
- [ ] No raw emojis used as icons (vector icons only)
- [ ] Interactive elements have tactile/spring feedback
- [ ] Every component is under ~200 lines
- [ ] Every change is under ~100 lines (strict 1–2 files per turn)
- [ ] The app compiles cleanly without errors

