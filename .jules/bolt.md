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
