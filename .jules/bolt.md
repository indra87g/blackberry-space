# Performance Learnings & Optimizations

## Libraries Added
- **TanStack Query (v5)**: Implemented for robust server-state management, caching, and optimistic UI updates.

## Libraries Removed
- **Million.js**: Removed due to hydration conflicts and instability with Next.js 16/React 19. While it offers performance benefits, stability was prioritized to prevent broken user journeys (e.g., auth callback hangs).

## Implementation Details

### TanStack Query
- **QueryClient Infrastructure**: Managed via `src/app/get-query-client.ts` to ensure a singleton on the client and per-request instance on the server.
- **Server Prefetching**: Used in Server Components (Discover, Profile, View) with `prefetchQuery` and `HydrationBoundary` to eliminate waterfalling and reduce Time to Interactive (TTI).
- **Mutations**: Refactored all data-modifying operations (Like, Fork, Create, Edit, Delete) to use `useMutation` for centralized error handling and optimistic updates.
- **Stability Note**: Avoided using experimental `ReactQueryStreamedHydration` to prevent potential hydration mismatches in the App Router.

## Anti-patterns Avoided
- Avoided creating new `QueryClient` instances in render cycles by using the `getQueryClient` singleton pattern.
- Prioritized stable React features over experimental streamed hydration to ensure reliable auth flows and page loads.

## 2024-05-19 - Explicit Route Prefetching for Non-Link Navigations
**Learning:** In Next.js App Router, navigation using `router.push` inside interactive elements (like `div`s acting as cards) completely bypasses the framework's automatic link prefetching behavior provided by the `<Link>` component. This leads to waterfalling on click and severely degraded perceived navigation performance, especially on high-latency networks.
**Action:** Whenever a non-standard interactive element (e.g., `div` or `button`) is used for primary navigation via `router.push` (often necessary when the element contains other nested interactive elements like buttons, preventing the use of a wrapping `<a>` tag), explicitly attach `onMouseEnter={() => router.prefetch('/path')}` and `onFocus` handlers to manually trigger Next.js's prefetch mechanism and restore instantaneous navigation behavior.

## 2024-07-04 - Parallelizing Independent Server Queries
**Learning:** In Next.js Server Components, fetching independent data sequentially creates a network waterfall which blocks rendering and negatively impacts TTFB.
**Action:** Identify independent data requirements in Server Components and use Promise.all to fetch them concurrently.
