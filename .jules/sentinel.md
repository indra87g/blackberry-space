## 2026-06-20 - [XSS Defense-in-Depth in CodeBlock]\n**Vulnerability:** Raw HTML strings generated via Shiki were rendered directly using `dangerouslySetInnerHTML` in `src/components/code-block.tsx`. While Shiki escapes output, any bypass or upstream modification to the `html` prop could result in Cross-Site Scripting (XSS).\n**Learning:** Standard `dompurify` requires a DOM environment (`window`), causing hydration mismatches and potentially failing open to unsanitized strings during Next.js SSR.\n**Prevention:** Use `isomorphic-dompurify` when sanitizing HTML strings in Next.js Server or Client Components to ensure safe SSR hydration and robust XSS protection.
## 2026-06-27 - [Security Headers Enforcement]
**Vulnerability:** The application was missing basic security headers like `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Strict-Transport-Security`.
**Learning:** These headers provide important defense-in-depth protections against Clickjacking, MIME-type sniffing, and enforce HTTPS connections, reducing the attack surface.
**Prevention:** Ensured security headers are globally enforced via the `async headers()` configuration in `next.config.ts`.
## 2026-07-01 - [Server-Side Authorization Enforcement]
**Vulnerability:** The `/admin` dashboard was relying on a client-side `useEffect` hook for authorization. This allowed the full UI payload to be sent to unauthorized clients before being redirected, leading to potential information disclosure and authorization bypass.
**Learning:** Client-side routing and authorization checks in Next.js App Router are insufficient for protecting sensitive routes because the server still sends the component's UI payload to the client.
**Prevention:** Always enforce authorization at the server level using Server Components (like `layout.tsx` or `page.tsx`) with `@/utils/supabase/server` and `redirect()` before rendering sensitive content.
## 2026-08-01 - [Column-Level Security via Triggers]
**Vulnerability:** Supabase RLS `UPDATE` policies apply to the entire row by default, meaning users could potentially modify sensitive columns like `isAdmin` or `thorium` in the `profiles` table by modifying the payload in client-side mutations.
**Learning:** When using Postgres RLS, you must consider column-level security. A common pitfall is allowing a user to update their own row without restricting *which* columns they can update.
**Prevention:** Use a `BEFORE UPDATE` database trigger to enforce strict column-level constraints by resetting sensitive fields (`new."isAdmin" = old."isAdmin"`) to ignore client-side tampering attempts. Note: Always verify the `auth.role()` to allow internal system processes or `service_role` clients to update these fields when appropriate.
## 2026-08-02 - [Security Definer RPCs and Triggers]
**Vulnerability:** When using a `SECURITY DEFINER` RPC to safely update secure columns, a `BEFORE UPDATE` trigger that checks `auth.role() = 'authenticated'` will still fire and block the update because `auth.role()` reflects the JWT claim, which remains unchanged inside the RPC.
**Learning:** `SECURITY DEFINER` changes the `current_user` to the owner of the function (usually `postgres` in Supabase) but does not change the JWT claims like `auth.role()`.
**Prevention:** In triggers that protect column updates from users, verify `if auth.role() = 'authenticated' and current_user != 'postgres' then` so that `SECURITY DEFINER` functions are successfully exempted from the restriction.
## 2026-08-03 - [Null Handling in SQL RPCs]
**Vulnerability:** When incrementing numeric columns in SQL (e.g., `thorium = thorium + 1`), if the current value is `NULL`, the entire expression evaluates to `NULL`. This can cause silent failures in economic rewards or counters.
**Learning:** SQL arithmetic with `NULL` yields `NULL`.
**Prevention:** Always use `COALESCE` (e.g., `COALESCE(thorium, 0) + 1`) when incrementing columns that might contain `NULL` values.
