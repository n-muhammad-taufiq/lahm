# Lahm Customer App Design System

**Status:** Proposed direction grounded in existing tokens and UI. Owner direction: teal, white and black; general home with department selectors; no bottom tab bar.

## Visual direction

Use the owner-selected teal, white and black identity: dark teal `#0C3B3B` for primary actions/selected states, white canvas, and black/high-contrast text. Use restrained mist surfaces and borders from `@lahm/tokens` to separate content. Do not use terracotta/gold as major brand colors unless approved. Components reference token exports or NativeWind token classes instead of repeating hex values. Exact brand shades should be checked against current token definitions during the feature design review.

Use Plus Jakarta Sans for interface text and the existing Parisienne face only for small brand accents. Establish clear hierarchy: concise screen title, readable section title, one-line metadata, and 13–16 px body text using the current token scale. Use the spacing scale (4/8/12/16/20/24/32), standard page gutters, 8–10 px functional radii and full-round pills. Existing JSON contains larger radii, but project rules prohibit oversized 2xl/3xl styling; do not use those for new surfaces.

## Components and interaction

- **Navigation:** no bottom tab bar. The home screen uses department selectors. Orders and Account are reachable from the header/profile menu; search and cart entry points must remain clear and reachable. Use native stack navigation and safe-area-aware headers.
- **Merchant discovery:** prioritize identity, distance/delivery estimate, availability and one useful proof point. Use whitespace and dividers; reserve elevated/filled surfaces for meaningful grouping.
- **Vertical storefronts:** share typography, controls and product contracts, but tailor information hierarchy: grocery by category/pack size, meat by cut/weight/preparation, restaurant by menu category/preparation time. Only show fields actually provided by backend.
- **Product choice:** accessible product details and option selectors; use a native sheet for complex choices where current Expo/RN support is verified. Show price deltas and required/min/max selections explicitly.
- **Cart and checkout:** persistent cart entry point above navigation; clear outlet identity, item edits, fees, delivery address and server-calculated total. Pin primary action in the safe-area thumb zone. Confirm destructive cart reset on store/outlet switch.
- **Forms:** labeled fields, native keyboard type/autofill, keyboard avoidance, on-drag dismissal and taps handled while keyboard is open. Inline validation near the field and a clear submit state.
- **Feedback:** restrained press feedback and haptics for meaningful actions. Respect reduced-motion/accessibility settings. Avoid blanket scale animations on list rows.

## Data states and accessibility

Every data surface has content-shaped skeleton, meaningful empty state, recoverable error with retry, and success presentation. Do not use a lone spinner for a feed. Reserve blocking activity feedback for short transactions. Missing images use a branded neutral treatment, never a fabricated remote photo. Provide screen-reader labels, selected/disabled states, at least 44 pt/48 dp touch targets, adequate contrast, dynamic text support, and no icon-only critical actions.

## Existing assets and component base

`@lahm/tokens` provides colors, spacing, radii, typography and layout values. `@lahm/ui` already exports Button, Input, FormField, SelectField, BrandHeader, PhonePillInput, location/auth and progress components. Customer home has merchant cards, search, category switcher, banner, cart capsule and skeleton card. Audit each candidate for native behavior, token compliance, reuse and accessibility before extending it. New shared primitives should be built in `@lahm/ui` only when multiple features need the same behavior.

## Known consistency issues to resolve

- The repo roadmap and home prototype disagree on navigation; owner has selected department selectors and no bottom tab bar. Existing tokens include warm accent colors, but owner-selected primary palette is teal, white and black.
- Existing code has raw colors, arbitrary dimensions, ActivityIndicator-only fetch states and oversized storefront files. Improve incrementally when features are touched; do not run a broad visual rewrite as a prerequisite.
- The app currently uses NativeWind and shared tokens; do not introduce another styling system without a specific gap and compatibility review.
