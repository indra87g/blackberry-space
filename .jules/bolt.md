# Performance Learnings & Optimizations

## Libraries Added
- **TanStack Query (v5)**: Implemented for robust server-state management, caching, and optimistic UI updates.
- **Million.js**: Integrated for compiler-level virtual DOM optimizations in performance-critical components.

## Implementation Details

### TanStack Query
- **QueryClient Infrastructure**: Managed via `src/app/get-query-client.ts` to ensure a singleton on the client and per-request instance on the server.
- **Server Prefetching**: Used in Server Components (Discover, Profile, View) with `prefetchQuery` and `HydrationBoundary` to eliminate waterfalling and reduce Time to Interactive (TTI).
- **Mutations**: Refactored all data-modifying operations (Like, Fork, Create, Edit, Delete) to use `useMutation` for centralized error handling and optimistic updates.

### Million.js
- **Block Optimization**: Key components (`SnippetCard`, `SnippetCardCompact`) wrapped in `block()` to skip React's reconciliation for static parts of the component.
- **Automatic Mode**: Enabled in `next.config.ts` with `rsc: true` to assist in optimizing 'use client' components automatically.

## Anti-patterns Avoided
- Avoided creating new `QueryClient` instances in render cycles by using the `getQueryClient` singleton pattern.
- Prevented TypeScript build failures by using `as any` casts where Million.js block types conflicted with Next.js 16/React 19 types, ensuring a stable build without sacrificing performance.
