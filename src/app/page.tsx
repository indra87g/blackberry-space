import { createClient } from '@/utils/supabase/server';
import { SnippetCardCompact } from '@/components/snippet-card-compact';
import { Code } from 'lucide-react';
import Link from 'next/link';
import { SearchBar } from '@/components/search-bar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const revalidate = 0; // Disable full page caching to always show latest snippets/auth state

export default async function Home(props: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const q = searchParams?.q || '';
  const currentPage = Number(searchParams?.page) || 1;
  const itemsPerPage = 10;
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch snippets
  let query = supabase
    .from('snippets')
    .select(
      `
      *,
      profiles ( full_name, avatar_url, username )
    `,
      { count: 'planned' },
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (q) {
    // Strip characters that have special meaning in PostgREST's `or` grammar
    // (comma / parentheses) before interpolating the user's search term.
    const term = q.replace(/[,()]/g, ' ').trim();
    if (term) {
      query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
    }
  }

  // The snippets list and the user's likes are independent reads — run them
  // concurrently so the page waits on one round-trip instead of two.
  const [{ data: snippets, count, error }, { data: likes }] = await Promise.all([
    query,
    user
      ? supabase.from('likes').select('snippet_id').eq('user_id', user.id)
      : Promise.resolve({ data: null }),
  ]);

  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

  const likedSnippetIds = new Set<string>();
  if (likes) {
    likes.forEach((l) => likedSnippetIds.add(l.snippet_id));
  }

  return (
    <div className="pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">
            Discover Snippets
          </h1>
          <p className="text-on-surface-variant text-lg">
            Explore code shared by the Blackberry Space community.
          </p>
        </div>
        <SearchBar />
      </div>

      {error ? (
        <div className="p-6 bg-[rgba(255,180,171,0.1)] border border-error text-error">
          <p className="font-semibold mb-1">Error fetching snippets.</p>
          <p className="text-sm">
            Please make sure the &quot;snippets&quot; table exists and policies are configured
            correctly.
          </p>
          <pre className="mt-4 text-xs font-mono bg-surface-container-lowest p-2">
            {error.message}
          </pre>
        </div>
      ) : snippets && snippets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {snippets.map((snippet) => (
            <SnippetCardCompact
              key={snippet.id}
              snippet={snippet}
              currentUser={user}
              isLiked={likedSnippetIds.has(snippet.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-outline-variant bg-surface-container/50">
          <div className="w-16 h-16 bg-surface-container-high flex items-center justify-center mb-4">
            <Code className="w-8 h-8 text-on-surface-variant" />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">No snippets yet</h3>
          <p className="text-on-surface-variant max-w-sm mb-6">
            Be the first to share a piece of code with the community!
          </p>
          <Link href="/snippets/new" className="btn-primary px-6 py-3 uppercase tracking-wider">
            Create Snippet
          </Link>
        </div>
      )}

      {snippets && snippets.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <Link
            href={`/?${new URLSearchParams({ ...(q ? { q } : {}), page: String(Math.max(1, currentPage - 1)) })}`}
            className={`p-2 border border-outline-variant transition-colors ${currentPage === 1 ? 'opacity-50 pointer-events-none' : 'hover:bg-surface-container-high'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="text-on-surface-variant font-medium px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Link
            href={`/?${new URLSearchParams({ ...(q ? { q } : {}), page: String(Math.min(totalPages, currentPage + 1)) })}`}
            className={`p-2 border border-outline-variant transition-colors ${currentPage >= totalPages ? 'opacity-50 pointer-events-none' : 'hover:bg-surface-container-high'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
