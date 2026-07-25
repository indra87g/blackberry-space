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

## 2024-10-24 - Parallelizing Independent Server Queries in View and Discover Pages
**Learning:** In Next.js Server Components, independent data fetching operations like `supabase.auth.getUser()` and `queryClient.prefetchQuery()` were being executed sequentially in \`src/app/snippets/[id]/view/page.tsx\` and \`src/app/snippets/discover/page.tsx\`. This creates a network waterfall which blocks rendering and negatively impacts TTFB. This reinforces the learning from 2024-07-04.
**Action:** Identified the independent data requirements in these Server Components and used \`Promise.all\` to fetch them concurrently, ensuring the fallbacks (e.g., when the user is null) are handled correctly.

## 2024-10-25 - [Memoizing Expensive Synchronous Operations in Client Components]
**Learning:** Operations like `DOMPurify.sanitize(html)` are synchronous and CPU-bound. Placing them directly inside the render method of a React Client Component with frequent state changes (e.g., toggling a 'copied' state) causes the expensive operation to block the main thread unnecessarily on every render.
**Action:** Use `useMemo` to memoize the result of expensive synchronous computations, ensuring they only re-run when their specific dependencies (like the input `html` string) change, rather than on every component state update.
