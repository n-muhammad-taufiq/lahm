# Mobile UI/UX Designer (`mobile-designer`)

The **Mobile UI/UX Designer** is the dedicated frontend design architect and visual self-correction inspector for Project Lahm. It operates during Specification-Driven Development to ensure that all mobile screens across the Customer, Merchant, and Delivery Partner apps adhere to world-class, production-grade native standards—eliminating web-style layout mistakes and visual glitches.

---

## 1. Core Mission & Questions Answered
> **"How should this screen be structured for intuitive, thumb-friendly mobile ergonomics?"** (Mode 1: Pre-Flight)  
> **"Does the live rendered UI look visually polished, aligned, and glitch-free?"** (Mode 2: Visual Inspection)

The `mobile-designer` operates across **two distinct phases** of frontend development:
1. **Mode 1: Pre-Flight UI/UX Blueprint** (Before writing component code)
2. **Mode 2: Visual Self-Correction Inspector** (After rendering live components)

---

## 2. Mode 1: Pre-Flight UI/UX Blueprint

Before coding any mobile screen, the agent invokes `mobile-designer` to produce a comprehensive design blueprint.

### A. Universal Mobile Standards (Apple HIG & Material 3)
- **Zero Raw Emojis as Icons:** Strictly mandates vector stroke icons (`@expo/vector-icons` / Lucide icons).
- **Native Bottom Sheets:** Mandates gesture-driven bottom sheets (`@gorhom/bottom-sheet`) with drag indicators instead of centered web modal dialogs or select popups.
- **Tactile Haptic Feedback:** Dictates exact `expo-haptics` triggers:
  - `Haptics.selectionAsync()` on quantity steppers and tab switches.
  - `Haptics.impactAsync(ImpactFeedbackStyle.Light)` on button presses.
  - `Haptics.notificationAsync(NotificationFeedbackType.Success)` on order placement and checkout.
- **Spring Press Physics:** Mandates subtle spring scaling on active touchables (`transform: [{ scale: 0.97 }]`).
- **Content-Shaped Shimmer Skeletons:** Mandates smooth animated SVG/view shimmer skeletons that match the exact card geometry (banning blank screens with lone spinners).
- **Thumb-Zone Placement:** Anchors primary CTAs at the bottom with safe area insets (`paddingBottom: insets.bottom + 16`) and minimum 44×44 dp touch targets.

### B. Lahm Design System Fidelity ([`tokens.json`](../../frontend/packages/tokens/src/tokens.json))
- 100% token usage from `@lahm/tokens` (unitless numeric points/dp). Strictly bans hardcoded hex colors or arbitrary pixel values.
- Primary screen headers must use `text-screenTitle font-extrabold font-serif`.
- Color harmony: warm terracotta (`bg-brand-terracotta`), sand background (`bg-brand-sand`), dark charcoal typography, zinc borders.

### C. Modular Sub-View Decomposition
- Splits every screen into focused sub-components kept strictly under ~200 lines each (e.g. Header, ItemList, FloatingCheckoutBar).

---

## 3. Mode 2: Visual Self-Correction Inspector

When a component is rendered live in the Expo development server, the agent captures a viewport screenshot and passes it to `mobile-designer` for visual inspection:

### What the Visual Inspector Evaluates:
1. **Geometry & Spacing:** Flags cramped padding, excessive whitespace, or misaligned flexbox containers.
2. **Safe Area & Thumb Zone:** Verifies top notch / Dynamic Island and bottom home indicator clearance.
3. **Typography & Truncation:** Identifies awkwardly wrapped text, clipped strings, or mismatched font scales.
4. **Color Contrast & Readability:** Verifies WCAG-compliant contrast between text and surface backgrounds.
5. **Instant Style Patches:** Outputs precise, line-level Tailwind / StyleSheet classes to immediately correct the visual flaw.

---

## 4. How It Is Invoked

### Mode 1 (Pre-Flight Blueprint Example):
```typescript
invoke_subagent({
  TypeName: "mobile-designer",
  Role: "Mobile UI/UX Architect (Pre-Flight)",
  Prompt: "Create a modern native mobile UI/UX blueprint for the Customer Cart Screen (Phase 6.4). Decompose into sub-views under 200 lines, specify tokens from @lahm/tokens, bottom sheet interactions, haptics, and skeleton states."
})
```

### Mode 2 (Visual Inspection Example):
```typescript
invoke_subagent({
  TypeName: "mobile-designer",
  Role: "Visual Self-Correction Inspector (Mode 2)",
  Prompt: "Inspect the rendered screenshot of CustomerCartScreen. Check for safe area padding, button alignment, and visual hierarchy. Provide exact style patches for any detected visual flaws."
})
```
