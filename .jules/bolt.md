
## $(date +%Y-%m-%d) - [Dynamic Import for Heavy Dependencies]
**Learning:** The `shiki` library is very heavy and when imported statically at the top level of a client component, it significantly inflates the First Load JS bundle size. In Next.js App Router client components, deferring this via a dynamic `await import('shiki')` inside a `useEffect` prevents the library from being part of the critical initial bundle.
**Action:** Always check the imports in client components for heavy, non-critical dependencies like syntax highlighters or rich text editors, and dynamically import them where they are actually used (e.g., inside event handlers or `useEffect` hooks) to optimize bundle sizes.
