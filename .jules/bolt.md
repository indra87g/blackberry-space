## 2024-06-06 - Dynamic imports for heavy syntax highlighters

**Learning:** `shiki` is a heavy dependency that significantly increases the first load JS bundle size when statically imported in React components. Next.js does not automatically split it if it's imported at the top of a client component.

**Action:** Replace static `import { codeToHtml } from 'shiki'` with dynamic `const { codeToHtml } = await import('shiki')` inside the `useEffect` where it's actually used. This ensures `shiki` is only downloaded when the component mounts and the code needs highlighting, saving massive amounts of upfront JavaScript parsing and execution.

## 2024-06-13 - Dynamic imports for heavy export libraries

**Learning:** `html-to-image` is a heavy dependency used in `CodeBlock` solely for the "Export as Image" feature. It was being statically imported, causing its full payload to be included in the initial JS bundle for any page rendering a snippet.

**Action:** Replaced static import of `html-to-image` with a dynamic inline import (`await import('html-to-image')`) within the `handleExport` click handler. This ensures the library is only downloaded if the user actually clicks the download button, noticeably reducing the initial JS payload without sacrificing functionality. Always look for heavy libraries only needed in specific user-triggered events.
