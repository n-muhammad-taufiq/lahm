# Project Lahm — Agent Development Rules

These rules govern all AI coding agents working on Project Lahm. Every agent MUST read and strictly adhere to these instructions.

---

## 1. Primary Documentation & Plan
- **Instructions:** Always read and follow [`context/instructions.md`](file:///c:/Users/afriq/Documents/company/project-lahm/context/instructions.md).
- **Roadmap:** Follow the phased execution order in [`context/plan.md`](file:///c:/Users/afriq/Documents/company/project-lahm/context/plan.md).

---

## 2. Mandatory Step Communication Protocol
Before and after **EVERY SINGLE STEP / TURN**, you must provide:
1. **BEFORE making changes:**
   - **Objective:** What the step will do and the architectural rationale.
   - **File Manifest:** Exact files that will be created, modified, or deleted (using markdown links).
   - **Scope:** Functions, types, components, or entities being touched (~100 lines target).
2. **AFTER completing changes:**
   - **Implementation Summary:** How the code was implemented and edge cases handled.
   - **Architecture & Data Flow:** How it integrates into the existing pipeline (API client, queries, stores).
   - **Verification:** Verification of clean compilation, type safety, and the immediate next step.
3. **PHASE / TASK COMPLETION:**
   - When a phase or sub-phase is completed and verified, immediately update [`context/plan.md`](file:///c:/Users/afriq/Documents/company/project-lahm/context/plan.md) to mark it as `[x] Completed`.

---

## 3. Incremental Changes & File Limits
- **Strict 1–2 files limit per step:** ALWAYS keep changes to 1–2 files per turn. If a feature or fix requires touching 3 or more files, you MUST split it into multiple separate steps.
- **~100 lines per change:** Make small, reviewable, focused modifications.
- **~200 lines per component:** React component files should stay under or around 200 lines. Extract sub-views or custom hooks into colocated files when approaching this limit.
- **Verify every change:** Verify clean compilation after each step before proceeding to the next.

---

## 4. Reusable UI Components
- **"When a reusable UI component is required, develop it."**
- Before writing repetitive or inline UI markup across screens, evaluate if it represents a shared primitive (card, stepper, badge, bottom sheet, banner, input).
- If it doesn't exist in `@lahm/ui`, develop it first in `@lahm/ui/src/` as its own incremental step, using design tokens from `@lahm/tokens`. Then import and consume it. Never copy-paste one-off inline UI fragments.

---

## 5. Native-Friendly Mobile UI Standards
This is a **native mobile app**, NOT a web application. Avoid web anti-patterns:
- **No Emojis as Icons:** STRICTLY NO raw emojis (`📱`, `🥩`, `🛒`, `🔍`) as icons. Use stroke-based vector icons (`@expo/vector-icons` / `lucide-react-native`).
- **Native Bottom Sheets:** Use gesture-driven bottom sheets (`@gorhom/bottom-sheet` or Reanimated sheets) with drag handles and spring physics—NEVER centered web-style alert modals or dropdowns.
- **Tactile Haptic Feedback:** Use `expo-haptics` for steppers, primary buttons, and successful completion states.
- **Spring Press Animations:** Use scale-down spring feedback on press (`transform: [{ scale: 0.97 }]`) or Android ripples.
- **Shimmer Skeletons:** Use content-shaped shimmer skeleton loaders (`SkeletonCard`, `SkeletonList`) for content feeds. NEVER show a blank white screen with a lone centered spinner.
- **Thumb-Zone Layout:** Primary CTAs must be anchored at the bottom with safe area insets (`paddingBottom: insets.bottom + 16`).
- **Keyboard & Forms:** Always use `KeyboardAvoidingView`, `keyboardDismissMode="on-drag"`, and `keyboardShouldPersistTaps="handled"`.

---

## 6. Architecture & Data Flow
- **No Mock Data:** NEVER use fake data, dummy fallback values, or seed on startup. Connect to real endpoints.
- **Data Flow:** `Screen → Custom Hook (TanStack Query) → @lahm/api → NestJS Backend`.
- **State Separation:** TanStack Query owns server state; Zustand owns shared client state (cart, auth); `useState` for local UI toggles. Never duplicate server data into Zustand.
- **Thin Routes:** Expo Router files in `app/` must remain thin bridges (import and render feature screens from `features/`).

---

## 7. The 4-Stage Full-Stack Lifecycle Standard
Every state mutation, backend transaction, asynchronous job, and user action across the stack MUST explicitly account for all 4 stages of its lifecycle:
1. **Trigger / Entry:** What initiates the operation? (User interaction, incoming HTTP request, scheduled event).
2. **In-Flight / Processing:** What happens while work is in progress?
   - *Frontend:* Loading feedback, button disabling/debouncing, content-shaped shimmer skeletons, splash gates.
   - *Backend:* Idempotency check, database transactions, row-level locking, preventing race conditions or duplicate execution.
3. **Success / Commit:** Where does the returned data flow, and what state is updated? (DB commit, HTTP response, cache update, UI transition).
4. **Failure / Rollback / Timeout:** How are errors, disconnects, expired tokens, or unhandled exceptions managed cleanly without leaving the UI frozen, a database transaction hanging, or a silent failure?

---

## 8. Full Context & Execution Loop Inspection
- **NEVER inspect only the 10–20 lines around an edit.**
- **Frontend:** Read the entire component, parent layout wrappers, custom hooks, timers, and store subscriptions.
- **Backend:** Read the entire service method, caller controller, entity relationships, guards, filters, and transaction boundaries.
- Tracing the complete call loop prevents blind spots, missed loading gates, database leaks, and conflicting timers.
