import { createClient } from '@/utils/supabase/server';
import { SnippetCardCompact } from '@/components/snippet-card-compact';
import { Code } from 'lucide-react';
import Link from 'next/link';
import { SearchBar } from '@/components/search-bar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/app/get-query-client';

export const revalidate = 0; // Disable full page caching to always show latest snippets/auth state

export default async function DiscoverSnippets(props: {
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

  const queryClient = getQueryClient();

  // Prefetch snippets
  await queryClient.prefetchQuery({
    queryKey: ['snippets', { q, page: currentPage }],
    queryFn: async () => {
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
        const term = q.replace(/[,()]/g, ' ').trim();
        if (term) {
          query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
        }
      }

      const { data: snippets, count, error } = await query;
      if (error) throw error;

      return { snippets, count };
    },
  });

  const { snippets, count } = (queryClient.getQueryData([
    'snippets',
    { q, page: currentPage },
  ]) as any) || { snippets: [], count: 0 };
  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

  const likedSnippetIds = new Set<string>();
  if (user && snippets && snippets.length > 0) {
    const snippetIds = snippets.map((s: any) => s.id);
    const { data: likes } = await supabase
      .from('likes')
      .select('snippet_id')
      .eq('user_id', user.id)
      .in('snippet_id', snippetIds);

    if (likes) {
      likes.forEach((l: any) => likedSnippetIds.add(l.snippet_id));
    }
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

      <HydrationBoundary state={dehydrate(queryClient)}>
        {!snippets || snippets.length === 0 ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {snippets.map((snippet: any) => (
              <SnippetCardCompact
                key={snippet.id}
                snippet={snippet}
                currentUser={user}
                isLiked={likedSnippetIds.has(snippet.id)}
              />
            ))}
          </div>
        )}
      </HydrationBoundary>

      {snippets && snippets.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <Link
            href={`/snippets/discover?${new URLSearchParams({ ...(q ? { q } : {}), page: String(Math.max(1, currentPage - 1)) })}`}
            className={`p-2 border border-outline-variant transition-colors ${currentPage === 1 ? 'opacity-50 pointer-events-none' : 'hover:bg-surface-container-high'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="text-on-surface-variant font-medium px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Link
            href={`/snippets/discover?${new URLSearchParams({ ...(q ? { q } : {}), page: String(Math.min(totalPages, currentPage + 1)) })}`}
            className={`p-2 border border-outline-variant transition-colors ${currentPage >= totalPages ? 'opacity-50 pointer-events-none' : 'hover:bg-surface-container-high'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
