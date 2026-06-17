import { createClient } from '@/utils/supabase/server';
import { SnippetCard } from '@/components/snippet-card';
import { CodeBlock } from '@/components/code-block';
import { OwnerActions } from './owner-actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { highlightToHtml } from '@/lib/highlighter';

export const revalidate = 0;

export default async function SnippetViewPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: snippet, error } = await supabase
    .from('snippets')
    .select(`
      *,
      profiles ( full_name, avatar_url, username )
    `)
    .eq('id', id)
    .single();

  if (error || !snippet) {
    notFound();
  }

  let isLiked = false;
  if (user) {
    const { data: like } = await supabase
      .from('likes')
      .select('snippet_id')
      .eq('user_id', user.id)
      .eq('snippet_id', snippet.id)
      .maybeSingle();

    if (like) isLiked = true;
  }

  const codeHtml = await highlightToHtml(snippet.code, snippet.language);

  return (
    <div className="pb-12 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discover
        </Link>
      </div>

      <SnippetCard snippet={snippet} currentUser={user} isLiked={isLiked} />
      {user && user.id === snippet.user_id && <OwnerActions snippet={snippet} />}
      <div className="mt-8">
        <CodeBlock code={snippet.code} language={snippet.language} html={codeHtml} />
      </div>
    </div>
  );
}
