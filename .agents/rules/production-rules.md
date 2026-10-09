# Production Development Rules

## 1. Strictly Production-Only Code: Zero Mock, Sandbox, or Development Artifacts

Every piece of code that we write across the monorepo MUST be considered final code for production:

- NEVER add development, sandbox, or mock data, code, or UI elements.
- NEVER add sandbox notices, test bypasses, mock hints (e.g. mock OTP notices), or development-only branching.
- NEVER use mock data or hardcoded sample data to make a feature appear functional.
- NEVER create fake API responses or placeholder database records.
- NEVER use fallback data when real data/API/database is unavailable.
- NEVER replace a real integration with a temporary mock implementation.
- NEVER silently return fabricated/default business data.

If real data cannot be retrieved, handle the actual error properly or ask for clarification. Every single line of code must be production-ready.

## 2. Use the real application flow

Before implementing a feature:

- Inspect the existing frontend flow.
- Inspect the relevant backend controller/service.
- Inspect entities and database queries when applicable.
- Inspect existing API endpoints and DTOs.
- Reuse existing services and utilities where appropriate.
- Follow the existing architecture and patterns.

Do not create an alternative implementation without checking the existing implementation first.

## 3. Do not hide problems

If an API, database query, external service, configuration, or integration is failing:

- Do NOT add fallback data.
- Do NOT catch the error and pretend the operation succeeded.
- Do NOT return fake success responses.
- Do NOT bypass the failing integration.

Instead:

1. Identify the actual problem.
2. Follow the project's existing error-handling pattern.
3. Surface the error appropriately.
4. If the correct behavior is unclear, ask before implementing a workaround.

## 4. Do not guess business logic

Do not invent:

- Business rules
- API behavior
- Database relationships
- Permissions
- Status transitions
- Default values
- External API responses

If the required behavior cannot be determined from the existing code or requirements, ask for clarification.

## 5. Before modifying code

First inspect relevant existing code.

Understand:

- How the current feature works
- Where the data comes from
- Which service owns the logic
- Which API is being called
- Which database tables/entities are involved
- How errors are currently handled

Then make the smallest appropriate change.

## 6. Production-ready implementation

Code should be:

- Connected to real data sources
- Consistent with the existing architecture
- Type-safe
- Properly error-handled
- Maintainable
- Free from temporary/demo implementations

Do not implement something merely to make the UI look functional.

## 7. When uncertain

If there are multiple possible implementations and the correct one cannot be determined from the project:

STOP and explain the uncertainty.

Do not choose a mock, fallback, fabricated response, or guessed business rule just to complete the task.

## 8. Styling

When developing UI, first check what is the industry standard UI choices for developing that and ask me how I want it. But do not crawl over illegally on other websites. Do what is legit and permissible.

Dont use border radius such as 2xl, 3xl. Use rounded-sm,rounded-md or rounded-full

This is a React Native mobile application, not a responsive web application. Prioritize native mobile interaction patterns and existing project components. Do not use web-dashboard patterns unless specifically required.
Always use design tokens and reusable ui components implemented whenever possible

## 9. Modern Native Expo Standards

- Always prioritize the modern, official Expo and React Native standard APIs and libraries (e.g., `expo-location`, `expo-router`, `expo-image`, etc.) over outdated patterns or manual browser workarounds.
- Do not introduce complicated native bridging or overly complex abstractions. Keep code idiomatic, clean, and declarative.
- Before building a custom solution, check if a standard, first-party Expo/React Native mechanism exists for that functionality.

## 10. Component Simplicity & 200-Line Limit

- Keep every component simple, focused, and immediately readable.
- **Target length: Keep each component file under or around 200 lines.**
- If a component grows toward 200 lines, extract sub-views, modular cards, or dedicated custom hooks into colocated files.
- Each component should do one job well without bloated inline business logic.

## 11. Location & Permissions Standards

- On app open or entry into location-dependent customer flows:
  - Check permission status via standard Expo APIs (`getForegroundPermissionsAsync()`).
  - If permission is not yet granted or "while using app" is not selected, prompt the user for permission (`requestForegroundPermissionsAsync()`).
  - If permission is denied, handle it gracefully by offering a manual search/entry or a clean prompt to open device settings—never crash or show empty unresponsive screens.
  - Never fabricate fake/mock coordinates or dummy addresses.

## 12. Turn-by-Turn Granularity & Minimal Complexity

- Always keep changes under or equal to 100 lines per turn.
- Prefer editing 1-2 files at a time.
- Do not add unnecessary complexity.

## 13. Component, UI, and Business Logic Separation

Components should primarily be responsible for rendering UI and coordinating user interactions.

Do not place large amounts of business logic, API calls, data transformation, or complex state management directly inside JSX components.

Move reusable or non-trivial component logic into custom hooks.

Keep business logic outside presentation components whenever practical.

Components should be easy to understand by reading the component file without tracing through unrelated code.

Preferred flow:

Screen/Component → Custom Hook → API/State Layer → Backend

Avoid putting the entire application flow directly inside a screen component.

## 14. Server State and Client State

Use the appropriate state-management solution based on the type of state.

Use TanStack Query for server state:
- API data
- loading states
- errors
- caching
- refetching
- mutations
- invalidation

Use Zustand for genuinely shared client/application state.

Use useState for small, local UI state.

Use React Hook Form for complex forms.

Use Zod for schema validation where appropriate.

Do not copy server data from TanStack Query into Zustand without a clear architectural reason.

Do not introduce global state for state that belongs to a single component or feature.

## 15. Avoid Unnecessary useEffect

Do not use useEffect simply because data needs to be fetched or state needs to be synchronized.

Prefer TanStack Query for server-state synchronization.

Prefer derived values instead of storing values that can be calculated from existing state.

Use useEffect when there is a genuine synchronization with an external system or side effect.

Before adding an effect, verify that the behavior cannot be expressed more simply through normal rendering, event handlers, derived values, or existing libraries.

Avoid chains such as:

useEffect → setState → useEffect → setState

when the same behavior can be represented directly.

## 16. API and Data Access Separation

Do not make raw API requests directly throughout UI components.

Keep API communication in dedicated API/service modules.

Custom hooks should consume the API layer rather than constructing HTTP requests inside JSX.

Keep request/response types aligned with the backend DTOs and API contracts.

Reuse existing API clients, interceptors, authentication handling, and error handling.

Do not create duplicate API functions when an existing function already provides the required operation.

Preferred structure:

Feature
├── components/
├── hooks/
├── api/
├── schemas/
└── types/

Keep feature-specific code together whenever practical.

## 17. Feature-Based Organization

Organize application code around features rather than creating large global folders containing unrelated code.

Prefer:

features/
├── products/
│   ├── components/
│   ├── hooks/
│   ├── api/
│   ├── schemas/
│   └── types/
├── orders/
│   ├── components/
│   ├── hooks/
│   ├── api/
│   └── types/
└── customers/

Avoid allowing global folders such as components/, hooks/, or utils/ to become large collections of unrelated feature code.

Shared code should only be placed in shared packages when it is genuinely shared.

## 18. Keep Routes and Screens Thin

For Expo Router:

Route files should primarily handle routing and connect routes to feature screens.

Do not allow route files to become large containers containing API logic, business rules, and complex UI.

Move substantial feature implementation into the appropriate feature/component/hook files.

Prefer:

app/
└── products/
    ├── index.tsx
    └── [id].tsx

features/
└── products/
    ├── screens/
    ├── components/
    ├── hooks/
    └── api/

## 19. Reusable Components

Create reusable components for genuine shared UI concepts.

Prefer existing project components before creating a new component.

Do not create abstractions merely because two pieces of UI look slightly similar.

Do not create overly generic components that make simple UI harder to understand.

Feature-specific components should remain within the feature unless there is a genuine need to share them.

Reuse should reduce complexity, not introduce another layer of abstraction.

## 20. Design System and Design Tokens

Always use the project's existing design tokens and reusable UI components.

Do not hardcode colors, spacing, typography, border radii, or other design values when an existing token is available.

If a required design token does not exist, add it to the appropriate design-token system rather than repeatedly hardcoding the value.

Prefer the project's shared UI primitives over creating one-off implementations.

Maintain visual consistency across all applications in the monorepo where the design system is intended to be shared.

## 21. Avoid Giant Utility and Helper Files

Do not place unrelated functions into a single large utils.ts or helpers.ts.

Keep feature-specific helpers close to the feature that owns them.

Only move a utility into a shared location when multiple features genuinely need it.

Give utility functions specific, descriptive names and responsibilities.

Avoid creating a generic utility layer merely to hide simple code.

## 22. Avoid Unnecessary Abstraction

Prefer simple and obvious implementations.

Do not introduce factories, managers, adapters, repositories, providers, or additional abstraction layers unless they solve a real architectural problem.

Do not create an abstraction only because it is theoretically reusable.

Follow existing project patterns before introducing a new architectural pattern.

Prefer:

API → Hook → Component

over introducing additional layers when they provide no real benefit.

## 23. TypeScript Safety

Use TypeScript strictly and maintain existing strict compiler settings.

Avoid any unless there is a documented and unavoidable reason.

Do not silence type errors with unnecessary type assertions.

Prefer properly defined types, interfaces, unions, and generics.

Handle null and undefined explicitly where required.

Keep frontend types aligned with backend contracts.

Do not weaken TypeScript configuration merely to make code compile.

## 24. AI-Assisted Code Changes

When modifying existing code with an AI coding agent:

Inspect the relevant existing implementation before making changes.

Follow the project's established patterns.

Make the smallest necessary change.

Do not perform unrelated refactoring.

Do not rename or reorganize unrelated files.

Do not introduce a new library when an existing project dependency already solves the problem.

Do not rewrite working code merely because another implementation looks cleaner.

Explain significant architectural changes before making them when the correct approach is not obvious.

The goal is to make the requested change while preserving the existing working system.

## 25. Dependency Direction

Maintain clear dependency boundaries.

Feature code may use shared UI, utilities, types, and services where appropriate.

Shared packages must not depend on application-specific features.

One application must not import implementation details from another application.

Avoid circular dependencies.

Keep backend responsibilities separate from frontend responsibilities.

Do not bypass established API boundaries to access another layer directly.

Shared code should remain genuinely reusable and independent of individual applications.

## 26. Always prefer expo/react native standard and nestjs standard . Always prefer declarative nature of react.
