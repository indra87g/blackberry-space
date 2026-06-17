## 2024-06-06 - XSS Vulnerability in Shiki Fallback

**Vulnerability:** XSS vulnerability in `components/snippet-card.tsx` due to `snippet.code` being directly interpolated into `dangerouslySetInnerHTML` in the error fallback handler for Shiki `codeToHtml`.

**Learning:** When using syntax highlighters with fallback plain-text rendering, we must escape user-supplied code snippets manually if using `dangerouslySetInnerHTML`.

**Prevention:** Always escape user input when generating HTML strings manually, or rely on React's automatic escaping by rendering text nodes instead of raw HTML when possible.

## 2024-11-20 - Insecure Direct Object Reference (IDOR) via Client Queries

**Vulnerability:** Client-side Supabase updates and deletes (e.g., in `components/snippet-card.tsx` and `app/snippets/[id]/edit/page.tsx`) lacked `user_id` filtering, relying entirely on unknown RLS policies.
**Learning:** Always append `.eq('user_id', currentUser.id)` to all mutations originating from the client as a defense-in-depth measure. This prevents IDOR if RLS is ever disabled or misconfigured.
**Prevention:** Chain user ownership checks on all `update` and `delete` operations in both client and server components.
## 2026-06-13 - Open Redirect Vulnerability in Auth Callback
**Vulnerability:** Open redirect in `src/app/auth/callback/route.ts` where user-supplied `next` parameter was interpolated directly with `redirectOrigin`.
**Learning:** Malicious actors could supply `next=@evil.com` to make the URL `https://example.com@evil.com`, redirecting the user to `evil.com`.
**Prevention:** Always validate that redirect parameters represent valid local relative paths (starting with `/` but not `//` or `/\\) to prevent unauthorized redirects.
