import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SnippetCardCompact } from '@/components/snippet-card-compact';
import { FileCode2, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import type { SnippetWithProfile } from '@/lib/types';

export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Profile row, the likes-id set (for toggling), and the snippets data
  // are independent reads — fetch them concurrently.
  const tabQuery = supabase
    .from('snippets')
    .select(`
        *,
        profiles ( full_name, avatar_url, username )
      `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const [{ data: profile }, { data: likesData }, { data: tabData }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('likes').select('snippet_id').eq('user_id', user.id),
    tabQuery,
  ]);

  const likedSnippetIds = new Set<string>();
  if (likesData) {
    likesData.forEach((l) => likedSnippetIds.add(l.snippet_id));
  }

  const snippets: SnippetWithProfile[] = (tabData as SnippetWithProfile[]) || [];

  return (
    <div className="pb-12 max-w-4xl mx-auto">
      <div className="bg-surface-container border border-[rgba(255,255,255,0.05)] p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-24 h-24 bg-surface-container-high overflow-hidden border border-[rgba(255,255,255,0.1)] flex-shrink-0">
          {user.user_metadata.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.user_metadata.avatar_url}
              alt="Profile"
              width={96}
              height={96}
              decoding="async"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-on-surface-variant">
              {user.user_metadata.full_name?.[0] || user.email?.[0] || '?'}
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">
            {user.user_metadata.full_name || 'Anonymous Developer'}
          </h1>
          <p className="text-on-surface-variant text-lg mb-4">
            @{user.user_metadata.user_name || 'developer'}
          </p>

          <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-outline font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Joined{' '}
              {profile?.created_at
                ? formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })
                : 'recently'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.05)] mb-8">
        <Link
          href="/profile"
          className="flex items-center gap-2 px-4 py-3 transition-colors font-bold uppercase tracking-wider text-sm border-b-2 -mb-px text-primary border-primary"
        >
          <FileCode2 className="w-4 h-4" />
          My Snippets
        </Link>
      </div>

      {snippets.length > 0 ? (
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
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-outline-variant bg-surface-container/30">
          <div className="w-16 h-16 bg-surface-container-high flex items-center justify-center mb-4">
            <FileCode2 className="w-8 h-8 text-on-surface-variant" />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">No snippets yet</h3>
          <p className="text-on-surface-variant max-w-sm">
            You haven't shared any code snippets with the community yet.
          </p>
        </div>
      )}
    </div>
  );
}
