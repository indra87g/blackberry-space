'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [, startTransition] = useTransition();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      startTransition(() => {
        if (query) {
          router.replace(`/snippets/discover?q=${encodeURIComponent(query)}`);
        } else {
          router.replace(`/snippets/discover`);
        }
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, router]);

  return (
    <div className="relative w-full md:w-72">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant"
        aria-hidden="true"
      />
      <input
        type="search"
        aria-label="Search snippets"
        placeholder="Search snippets..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input-default w-full pl-10 pr-4 py-2.5 placeholder-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium text-sm"
      />
    </div>
  );
}
