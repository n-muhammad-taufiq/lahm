# Lahm — Development Instructions

These instructions govern how every phase in `plan.md` is carried out. Read this file fully before making any change. Refer back to it before every task.

---

## 1. How to Carry Out Each Phase

### Before Starting Any Phase

1. **Read `plan.md`** — Understand what the phase delivers and which files are involved.
2. **Read `SKILL.md`** — The rules in `.agent/skills/SKILL.md` are non-negotiable. Every change must comply.
3. **Inspect existing code first (Full Context & Execution Loop)** — Before writing or proposing anything, view and read the **entire files** you will touch, along with their callers, interacting hooks, timers, entity relationships, and transaction boundaries. NEVER view only 10–20 lines in isolation. Understanding the full execution loop prevents blind spots, missed loading gates, and conflicting timers.
4. **Identify dependencies** — If Phase N depends on Phase N-1 outputs (e.g., Phase 5 needs TanStack Query from Phase 0.8), verify those are done first.

### During a Phase

5. **Strict 1–2 files limit per step** — ALWAYS keep the number of files changed to 1–2 per turn. If an implementation requires modifying or creating 3 or more files, you MUST split it into multiple separate steps (e.g. create DTO & service in step A, update controller/routes in step B). Never touch 3 or more files in a single step.
6. **~100 lines per change** — Each individual edit should be around 100 lines or less. This is not about cramming — it's about making small, reviewable, understandable changes.
7. **~200 lines per component** — A React component file should stay under or around 200 lines. If it grows past that, extract sub-components or hooks into colocated files in the same feature directory.
8. **Test after each change** — After every file change, mentally (or actually) verify: Does the app still compile? Does existing functionality still work? Did I break any imports?
9. **The 4-Stage Full-Stack Lifecycle Standard** — Every state mutation, backend transaction, asynchronous job, and user action across the stack MUST explicitly account for all 4 stages of its lifecycle:
   - **Trigger / Entry:** What initiates the operation? (User interaction, incoming HTTP request, scheduled event).
   - **In-Flight / Processing:** What happens while work is in progress? (Frontend: loading feedback, button debouncing, shimmer skeletons, splash gates; Backend: idempotency check, database transactions, row-level locking, preventing race conditions).
   - **Success / Commit:** Where does the returned data flow, and what state is updated? (DB commit, HTTP response, cache update, UI transition).
   - **Failure / Rollback / Timeout:** How are errors, disconnects, expired tokens, or unhandled exceptions managed cleanly without leaving the UI frozen, a database transaction hanging, or a silent failure?

### Step Communication Protocol (MANDATORY BEFORE & AFTER EACH STEP)

Before and after **EVERY SINGLE STEP / TURN**, the agent must explicitly provide:

1. **BEFORE executing the step:**
   - **Step Objective & Intent**: Explain clearly what the step will do and the architectural rationale behind it.
   - **File Manifest**: List all files that will be created, modified, or deleted (using markdown links).
   - **Scope & Changes**: Describe what functions, types, components, or entities are being introduced or updated (~100 lines target).

2. **AFTER completing the step:**
   - **Implementation Summary**: Detail how the code was implemented, how edge cases were handled, and any key decisions made.
   - **Architecture & Data Flow Context**: Explain how the change connects with existing hooks, state, or APIs.
   - **Verification & Next Step**: Confirm how the code was verified (compilation, types, lint) and state what the immediate next step will be.

### After Completing a Phase

9. **Verify the feature works end-to-end** — The backend endpoint returns real data, the frontend calls it, the UI renders it, loading/error/empty states work.
10. **No loose ends** — Don't leave `TODO` comments, commented-out code blocks, or half-implemented functions.
11. **Mark Completed in `plan.md`** — When a phase or sub-task is completed and verified, immediately update `context/plan.md` to mark it as `[x] Completed` to maintain an accurate progress trail.

---

## 2. Mistakes That Must Not Be Made

### Data & API Mistakes

- **NEVER use mock data.** No hardcoded arrays of fake shops, fake products, fake orders. If the backend API doesn't exist yet, build the backend first — don't fake it on the frontend.
- **NEVER use hardcoded fallback values to hide failures.** If an API call fails, show an error — don't silently return a default value. Example of what NOT to do: `rating: merchant.rating ?? 4.8` — this fabricates a rating.
- **NEVER use placeholder images from Unsplash or any URL as default data.** If a merchant has no banner, the UI should handle "no image" gracefully (show a placeholder icon or colored background), not fetch from an external URL hardcoded in the backend.
- **NEVER seed data in `onModuleInit` or service constructors.** If data needs to be seeded for development, create a separate seed script — not code that runs on every server start.
- **NEVER copy server state into Zustand.** TanStack Query owns server data. Zustand is only for genuinely client-side state (auth session, cart, UI preferences). Don't `useEffect(() => setStore(queryData))`.
- **NEVER create duplicate API functions.** Before writing a new API function, check if one already exists in `@lahm/api`. Reuse it.

### Architecture Mistakes

- **NEVER put business logic in components.** Components render UI. Logic goes in hooks. API calls go in the API layer. The flow is: `Screen → Hook → API → Backend`.
- **NEVER make raw API calls in components.** Don't use `axios.get()` or `fetch()` directly in a component or screen. Use the `@lahm/api` package.
- **NEVER put API calls in `useEffect`.** Use TanStack Query's `useQuery` for fetching and `useMutation` for writes. If you're writing `useEffect(() => { fetch(...) }, [])`, you're doing it wrong.
- **NEVER create a new abstraction layer without a real reason.** No factories, adapters, repositories, or manager patterns unless they solve a concrete problem. Prefer the simple `API → Hook → Component` flow.
- **NEVER create a "super component."** If a screen has multiple tabs, sections, or steps — each should be its own component file. The screen file orchestrates them.
- **NEVER import from one app into another.** Customer app code must not import from merchant app code. Shared code goes in `@lahm/ui`, `@lahm/tokens`, or `@lahm/api`.

### File & Structure Mistakes

- **NEVER put unrelated code in a single file.** Each file should have one clear responsibility. Don't put a cart helper function in a products utility file.
- **NEVER create large `utils.ts` or `helpers.ts` catch-all files.** Keep utilities close to the feature that owns them. Only move to a shared location when multiple features genuinely need it.
- **NEVER put feature logic in route files.** Expo Router route files (`app/products/index.tsx`) should be thin — they import and render the feature screen component. The screen component lives in `features/`.
- **NEVER rename or reorganize files that you're not working on.** Only change what the current task requires. Don't do drive-by refactors.

---

## 3. Development Approach

### Incremental Change Protocol

```
1. Read the relevant existing code & verify dependencies
2. EXPLAIN (Pre-Step): State what the step will do & list exact files to be changed
3. Make the focused change (~100 lines, 1-2 files max)
4. EXPLAIN (Post-Step): Detail how it was implemented & how it fits into architecture
5. Verify it compiles, types are sound, and no regressions occur
6. Move to the next incremental step
```

### File Creation Order (for new features)

When building a new feature (e.g., "Shop Profile"), create files in this order:

```
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

Each numbered step is a separate incremental change. Don't build the entire feature in one go.

### State Management Rules

| Type of State | Tool | Examples |
|---|---|---|
| Server data (API responses) | TanStack Query | Products list, order details, merchant info |
| Shared client state | Zustand | Auth session, cart contents, app preferences |
| Local UI state | `useState` | Modal open/close, form input values, active tab |
| Complex forms | React Hook Form + Zod | Multi-field forms with validation |

**Never mix these.** Don't store TanStack Query data in Zustand. Don't use Zustand for a toggle that belongs to one component.

### Feature Folder Structure

```
features/
└── orders/
    ├── screens/
    │   ├── OrdersListScreen.tsx
    │   └── OrderDetailScreen.tsx
    ├── components/
    │   ├── OrderCard.tsx
    │   └── OrderStatusTimeline.tsx
    ├── hooks/
    │   ├── useOrders.ts
    │   └── useOrderDetail.ts
    ├── types/
    │   └── index.ts
    └── index.ts          # Public exports
```

- **screens/** — Full page components rendered by routes
- **components/** — Feature-specific UI pieces (not shared across features)
- **hooks/** — Custom hooks that connect to API/state
- **types/** — TypeScript interfaces for this feature
- **index.ts** — Re-exports what other modules need

---

## 4. UI Design Rules

### Colors & Tokens

- **ALWAYS use design tokens from `@lahm/tokens`.** Never write raw hex values like `#E77A62` or `#1C1611` in component code.
- If you need a color that doesn't exist in tokens, add it to `tokens.json` first, then reference it.
- The brand palette is warm/earthy (terracotta, cream, zinc). Don't introduce cold blues or neon colors unless there's a specific reason.

### Border Radius

- **NEVER use `rounded-2xl`, `rounded-3xl`, or other oversized radii** as per SKILL.md rule 8.
- Use: `rounded-sm`, `rounded-md`, `rounded-lg`, or `rounded-full` only.
- For cards: `rounded-md` or `rounded-lg`
- For buttons: `rounded-md`
- For pills/badges: `rounded-full`
- For inputs: `rounded-md`

### Typography

- Use the design token font sizes. Don't invent arbitrary sizes like `text-[13.5px]`.
- Headings: `font-serif` + `font-extrabold` (the Lahm brand style)
- Body: system sans-serif
- Labels: uppercase, small, bold, tracking-wide (the existing pattern for field labels)

### Spacing & Layout

- Use consistent spacing from the token scale (4, 8, 12, 16, 20, 24, 32, etc.)
- Don't use arbitrary spacing like `mt-[7px]` or `px-[13px]`. Use the nearest standard value.
- Content padding: `px-5` (20px) is the standard horizontal page padding used across the app.
- Bottom navigation: always account for safe area insets at the bottom.

### Native-Friendly Mobile UI Standards (Eliminating the "Web App" Feel)

This is a **native mobile app**, NOT a responsive website. Interfaces that use web patterns (centered alert popups, emojis as icons, full-screen spinners, flat abrupt opacity changes, buttons buried deep in scroll views) feel cheap and unresponsive. Every screen must feel tactile, fluid, and native to iOS and Android:

1. **Native Bottom Sheets (NEVER Web Popups or Select Dropdowns):**
   - **NEVER** use web-style centered modal dialogs, browser-like select boxes, or inline dropdown menus for selectors, country pickers, quantity pickers, or filter menus.
   - **ALWAYS** use interactive native Bottom Sheets (`@gorhom/bottom-sheet` or gesture-driven sheets via `react-native-gesture-handler` + `react-native-reanimated`) with drag handles, spring physics, backdrop dimming, and swipe-down-to-dismiss.

2. **Tactile Haptic Feedback (`expo-haptics`):**
   - Mobile screens lack physical keys. Tactile feedback provides confirmation of actions:
     - `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` on quantity steppers (+/-), pill selectors, and tab switches.
     - `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)` on primary button presses ("Add to Cart", "Confirm Order").
     - `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)` on OTP completion, successful checkout, or delivery handoff.

3. **Fluid Press Micro-Animations (Spring Feedback):**
   - **NEVER** use plain `TouchableOpacity` with abrupt 0.2 opacity flashing or static non-reactive `Pressable`.
   - Use animated spring feedback on press (`transform: [{ scale: 0.97 }]` on press-in, spring back on release) or subtle native Android ripples (`android_ripple={{ color: 'rgba(0,0,0,0.08)' }}`).
   - Every tappable card, button, and stepper must feel physical and responsive under the user's thumb.

4. **Vector Icons Only (STRICTLY NO EMOJIS):**
   - **NEVER use raw emojis (`📱`, `🥩`, `🛒`, `🔍`) as UI icons.** Emojis render inconsistently across Android and iOS versions and give the app a prototype/toy feel.
   - **ALWAYS** use sleek, stroke-based vector icons from `@expo/vector-icons` (such as `lucide-react-native` or `Ionicons`) with consistent stroke widths (1.5–2px) and tokenized brand colors.

5. **Shimmer Skeleton Loading (NEVER Generic Full-Screen Spinners):**
   - **NEVER** show a blank white screen with a lone centered `<ActivityIndicator />` while fetching screen content. That is a web anti-pattern.
   - **ALWAYS** render content-shaped **shimmer skeletons** (`SkeletonCard`, `SkeletonList`, `SkeletonBanner`) matching the exact layout of the upcoming cards, text rows, and images while queries load.
   - Reserve centered activity spinners only for blocking modal transactions (e.g., "Verifying payment...").

6. **Mobile Thumb-Zone Layout & Safe Area Insets:**
   - Primary action buttons (Checkout, Add to Cart, Confirm Order) must live in the natural thumb zone: sticky or floating at the bottom with safe area insets (`paddingBottom: insets.bottom + 16`). Never bury the primary CTA inside deep scrollable content.
   - Use sticky translucent blur headers (`expo-glass-effect` or `BlurView`) with content smoothly scrolling underneath for native depth.
   - Floating cart preview bar anchored above the bottom navigation/safe area.

7. **Native Keyboard & Form Ergonomics:**
   - Always wrap input screens in `KeyboardAvoidingView` (`behavior={Platform.OS === 'ios' ? 'padding' : undefined}`).
   - Configure form scroll views with `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"` so keyboard dismissal feels natural.
   - Use explicit mobile input types: `keyboardType="phone-pad"`, `textContentType="oneTimeCode"`, `autoComplete="sms-otp"`, and `returnKeyType="done"`.

8. **Native Pull-to-Refresh & Momentum Scrolling:**
   - All feeds and lists must include `RefreshControl` with tinted brand spinners (`tintColor={tokens.colors.brand.terracotta}`).
   - Ensure proper content insets (`contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}`) so bottom list items are never obscured by floating action buttons or navigation bars.

### Loading, Empty, and Error States

Every screen that fetches data MUST handle all four states:

1. **Loading** — Show content-shaped shimmer skeleton loaders (cards, rows, images). Do NOT show a blank screen or a lone centered spinner.
2. **Empty** — Show an illustrative icon + friendly message + clear action CTA (e.g., "No orders yet. Discover fresh meats in your neighborhood.").
3. **Success** — Smoothly transition to the actual data with subtle fade-in.
4. **Error** — Show a clean error card + specific problem description + a "Retry" button. Never fail silently.

Use the shared `SkeletonLoader`, `EmptyState`, and `ErrorState` components from `@lahm/ui`.

### Component Visual Patterns Already Established

These patterns exist in the codebase. Follow them for consistency:

- **Section headers:** Small uppercase label (`text-[11px] font-bold tracking-[1.2px] uppercase`) followed by a large serif title.
- **Error banners:** `bg-red-50 border border-red-200 rounded-md px-3 py-2` with red text.
- **Primary action buttons:** Full-width, `h-[52px]`, `rounded-md`, brand terracotta background, white bold text.
- **Secondary buttons:** White background, subtle border, dark text.
- **Disabled buttons:** Lighter background variant, muted text color.

Don't invent new visual patterns for the same UI concept. Reuse what exists.

### Reusable UI Component Rule: Develop When Required

- **"When a reusable UI component is required, develop it."**
- Before writing repetitive or inline UI markup across screens, evaluate if the element represents a shared primitive (e.g., card, stepper, badge, bottom sheet, banner, input wrapper, avatar).
- If such a component does not exist in `@lahm/ui`:
  1. **Develop it first in `@lahm/ui/src/`**: Build the component in its own directory with proper TypeScript types, tokenized styling, and export it from `@lahm/ui/src/index.ts`.
  2. **Keep it under ~200 lines**: Focused, clean, and declarative.
  3. **Consume it in the feature screen**: Import it from `@lahm/ui` rather than duplicating JSX markup inline.
- **Never create one-off copy-pasted UI fragments**: If two or more screens need the same visual element, create the reusable component in `@lahm/ui` as a distinct incremental step.

---

## 5. Backend-Specific Rules

### NestJS Patterns

- Every module follows the standard NestJS structure: `module.ts`, `controller.ts`, `service.ts`, `entities/`, `dtos/`.
- Controllers handle HTTP concerns only (parse params, call service, return response). No business logic in controllers.
- Services contain business logic and database queries.
- Use `class-validator` decorators in DTOs for input validation.
- Use `ParseIntPipe` for numeric route params.

### Database Rules

- **Entity changes are incremental.** Add one or two columns at a time, not ten.
- **Use proper TypeORM relations.** Don't store foreign keys as plain columns without `@ManyToOne` / `@OneToMany` etc.
- **Use proper column types.** Decimals for prices (`decimal(10,2)`), enums for status fields, timestamps for dates.
- **Don't use `synchronize: true` for production.** It's acceptable during early development but must be replaced with migrations before any real deployment.

### Authorization Pattern

```
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MERCHANT)
@Patch(':id')
async update(...) { ... }
```

- `JwtAuthGuard` — Verifies the JWT token is valid
- `RolesGuard` — Checks the user's role matches `@Roles()`
- For ownership checks (merchant can only edit THEIR products), the service layer should verify `product.merchantId === requestingUser.merchantId`

### Error Handling

- Use NestJS built-in exceptions: `NotFoundException`, `UnauthorizedException`, `ConflictException`, `BadRequestException`, `ForbiddenException`.
- Don't catch errors and return a fake success. Let exceptions propagate.
- The global exception filter (Phase 0.1) will format all errors consistently.

---

## 6. Frontend-Specific Rules

### TanStack Query Patterns

**Fetching data (read):**
```typescript
// In hooks/useProducts.ts
export function useProducts(merchantId: number) {
  return useQuery({
    queryKey: ['products', merchantId],
    queryFn: () => productsApi.getByMerchant(merchantId),
  });
}
```

**Mutating data (write):**
```typescript
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductInput) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

**In the component:**
```typescript
const { data: products, isLoading, error } = useProducts(merchantId);
const createMutation = useCreateProduct();
```

Never use `useEffect` + `useState` for data fetching. That pattern is replaced by TanStack Query.

### Zustand Patterns

```typescript
// stores/cartStore.ts
interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (product, quantity) =>
    set((state) => ({ items: [...state.items, { product, quantity }] })),
  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter(i => i.product.id !== productId) })),
  clearCart: () => set({ items: [] }),
}));
```

Only use Zustand for state that genuinely needs to be shared across components and is NOT server data.

### Expo Router Patterns

**Route file (thin):**
```typescript
// app/shop/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { ShopProfileScreen } from '../../features/shop';

export default function ShopRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ShopProfileScreen shopId={Number(id)} />;
}
```

The route file is just a bridge. All logic and UI lives in the feature directory.

### Import Rules

```
✅ Component → Hook → @lahm/api → Backend
✅ Component → @lahm/ui (shared components)
✅ Component → @lahm/tokens (design values)
✅ Feature A → @lahm/api (shared API client)

❌ Feature A → Feature B (direct import between features)
❌ Component → axios.get() (direct API call)
❌ @lahm/ui → Customer App code (shared package importing app code)
❌ Customer App → Merchant App (cross-app import)
```

---

## 7. Common Pitfalls Specific to This Project

1. **The `#E77A62` problem** — This hex color appears all over the codebase as raw values instead of using the design token `brand.terracotta` (`#B04A37`). They're actually different colors — meaning the design tokens and the actual UI are out of sync. When fixing this, decide which is the canonical brand color and update tokens if needed, then reference tokens everywhere.

2. **The `onModuleInit` anti-pattern** — `MerchantsService` has an `onModuleInit` that auto-fills merchant coordinates and banner URLs. This violates the "no mock data" rule. Remove it. If merchants need coordinates, they should provide them during registration.

3. **The explore.tsx boilerplate** — All three apps have an `explore.tsx` that's Expo's default template code (~6.6KB each). Remove these — they're not part of the app.

4. **In-memory token storage** — `@lahm/api/src/client.ts` stores the access token in a module-level variable (`let currentAccessToken`). This means users are logged out every time the app restarts. Must be replaced with `expo-secure-store`.

5. **The merchant dashboard has inline tab routing** — Instead of using Expo Router tabs, the dashboard uses `useState('home' | 'products')` to switch views. This is fine for now but means there's no URL-based navigation for tabs. Keep this pattern but don't extend it — if more tabs are needed, consider Expo Router tab navigation.

6. **Product endpoints are unprotected** — Any user (or even unauthenticated requests) can create, edit, and delete products. This must be fixed with JWT + Roles guards before building more features on top.

---

## 8. Quality Checklist (Before Marking Any Phase Complete)

- [ ] **Step Communication Protocol followed**: Explained goal and listed files before change, detailed implementation and verification after change
- [ ] **Reusable UI components developed when required**: Shared UI primitives are created in `@lahm/ui` first rather than writing copy-pasted inline JSX
- [ ] No hardcoded hex colors — all colors reference design tokens
- [ ] No raw API calls in components — all go through `@lahm/api` + hooks
- [ ] No `useEffect` for data fetching — all use TanStack Query
- [ ] No mock/fake/hardcoded data anywhere
- [ ] Every screen handles loading (shimmer skeleton), empty, success, and error states
- [ ] Strictly NO raw emojis used as icons — only vector icons from `@expo/vector-icons` / `lucide-react-native`
- [ ] Interactive elements have tactile/spring feedback (Haptics, scale press feedback)
- [ ] Native Bottom Sheets used instead of web alert dialogs or dropdowns
- [ ] Primary action buttons anchored to thumb zone with `insets.bottom` safe area padding
- [ ] Forms have `KeyboardAvoidingView`, `keyboardDismissMode="on-drag"`, and `keyboardShouldPersistTaps="handled"`
- [ ] Every component is under ~200 lines
- [ ] Every change is strictly 1–2 files and under ~100 lines (split if 3+ files required)
- [ ] Route files are thin (just import and render the feature screen)
- [ ] TypeScript has no `any` types (unless absolutely unavoidable and documented)
- [ ] No unused imports, variables, or dead code
- [ ] Safe area insets are respected on all screens
- [ ] Touch targets are adequately sized (minimum 44x44 points)
- [ ] The app compiles without errors after every change
