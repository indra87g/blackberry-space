import { createClient } from '@/utils/supabase/server';
import { SnippetCard } from '@/components/snippet-card';
import { CodeBlock } from '@/components/code-block';
import { OwnerActions } from './owner-actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { highlightToHtml } from '@/lib/highlighter';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/app/get-query-client';

export const revalidate = 0;

export default async function SnippetViewPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const supabase = await createClient();
  const queryClient = getQueryClient();

  const [authResponse] = await Promise.all([
    supabase.auth.getUser(),
    queryClient.prefetchQuery({
      queryKey: ['snippet', id],
      queryFn: async () => {
        const { data: snippet, error } = await supabase
          .from('snippets')
          .select(`
          *,
          profiles ( full_name, avatar_url, username )
        `)
          .eq('id', id)
          .single();

        if (error || !snippet) return null;
        return snippet;
      },
    }),
  ]);

  const user = authResponse.data.user;
  const snippet = queryClient.getQueryData(['snippet', id]) as any;

  if (!snippet) {
    notFound();
  }

  const [likeResponse, codeHtml] = await Promise.all([
    user
      ? supabase
          .from('likes')
          .select('snippet_id')
          .eq('user_id', user.id)
          .eq('snippet_id', snippet.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    highlightToHtml(snippet.code, snippet.language),
  ]);

  const isLiked = !!likeResponse?.data;

  return (
    <div className="pb-12 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/snippets/discover"
          className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discover
        </Link>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <SnippetCard snippet={snippet} currentUser={user} isLiked={isLiked} />
        {user && user.id === snippet.user_id && <OwnerActions snippet={snippet} />}
        <div className="mt-8">
          <CodeBlock code={snippet.code} language={snippet.language} html={codeHtml} />
        </div>
      </HydrationBoundary>
    </div>
  );
}
