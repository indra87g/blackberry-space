import { createClient } from '@/utils/supabase/server';
import { SnippetCardCompact } from '@/components/snippet-card-compact';
import { Code, Zap, LogIn, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-surface-container-high flex items-center justify-center mb-8 rotate-3 hover:rotate-0 transition-transform duration-300">
          <Code className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-on-surface mb-4 uppercase">
          Blackberry Space
        </h1>
        <p className="text-on-surface-variant text-lg max-w-md mb-8 leading-relaxed">
          A terminal-inspired platform to share, discover, and collect code snippets with your
          fellow developers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none justify-center">
          <Link
            href="/login"
            className="btn-primary px-8 py-4 flex items-center justify-center gap-2 uppercase tracking-widest text-sm font-bold"
          >
            <LogIn className="w-4 h-4" />
            Get Started
          </Link>
          <Link
            href="/snippets/discover"
            className="bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant px-8 py-4 flex items-center justify-center gap-2 uppercase tracking-widest text-sm font-bold transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            Explore
          </Link>
        </div>
      </div>
    );
  }

  // Fetch Profile and Popular Snippets concurrently
  const [profileResponse, popularSnippetsResponse] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('snippets')
      .select(`
        *,
        profiles ( full_name, avatar_url, username )
      `)
      .eq('user_id', user.id)
      .order('likes_count', { ascending: false })
      .limit(3),
  ]);

  const { data: profile } = profileResponse;
  const { data: popularSnippets } = popularSnippetsResponse;

  if (!profile) return null;

  // Daily Login Logic
  const now = new Date();
  let thoriumEarned = false;

  // Call the secure RPC to claim daily reward. It returns true if successful.
  const { data: claimed, error } = await supabase.rpc('claim_daily_reward');

  if (!error && claimed) {
    thoriumEarned = true;
    profile.thorium = (profile.thorium || 0) + 1;
  }

  // Get Greeting
  const hour = now.getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';

  return (
    <div className="pb-12 space-y-10">
      <section className="bg-surface-container border border-outline-variant p-8 md:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Zap className="w-32 h-32 text-primary" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-primary mb-4">
            <Clock className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">
              {now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-on-surface mb-2 uppercase">
            {greeting}, {profile.full_name?.split(' ')[0] || profile.username || 'Developer'}!
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mb-8 leading-relaxed">
            Welcome back to your workspace.{' '}
            {thoriumEarned
              ? "You've claimed your daily thorium! +1 ⚡"
              : 'Keep building and sharing your code with the world.'}
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="bg-background border border-outline-variant px-6 py-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-container flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary fill-primary" />
              </div>
              <div>
                <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-0.5">
                  Balance
                </div>
                <div className="text-xl font-bold text-on-surface">{profile.thorium} Thorium</div>
              </div>
            </div>

            <div className="bg-background border border-outline-variant px-6 py-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-container flex items-center justify-center">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-0.5">
                  Snippets
                </div>
                <div className="text-xl font-bold text-on-surface">Your Collection</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight text-on-surface uppercase tracking-widest">
              Your Top Snippets
            </h2>
          </div>
          <Link
            href="/profile"
            className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest"
          >
            View All
          </Link>
        </div>

        {!popularSnippets || popularSnippets.length === 0 ? (
          <div className="bg-surface-container/30 border border-dashed border-outline-variant p-12 text-center">
            <p className="text-on-surface-variant mb-6 uppercase tracking-widest text-sm font-medium">
              You haven't shared any snippets yet.
            </p>
            <Link
              href="/snippets/new"
              className="btn-primary px-6 py-3 text-xs uppercase tracking-widest font-bold inline-block"
            >
              Create My First Snippet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {popularSnippets.map((snippet: any) => (
              <SnippetCardCompact
                key={snippet.id}
                snippet={snippet}
                currentUser={user}
                isLiked={false} // Simplification for dashboard, or we could check likes
              />
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-high p-8 border border-outline-variant">
          <h3 className="text-xl font-black text-on-surface mb-2 uppercase tracking-tighter">
            Ready to Build?
          </h3>
          <p className="text-on-surface-variant mb-6 text-sm">
            Create a new snippet and share it with the community to earn recognition and thorium.
          </p>
          <Link
            href="/snippets/new"
            className="text-primary hover:underline text-xs font-black uppercase tracking-[0.2em]"
          >
            Create New Snippet &rarr;
          </Link>
        </div>
        <div className="bg-surface-container-high p-8 border border-outline-variant">
          <h3 className="text-xl font-black text-on-surface mb-2 uppercase tracking-tighter">
            Explore Discover
          </h3>
          <p className="text-on-surface-variant mb-6 text-sm">
            See what other developers are building and get inspired for your next project.
          </p>
          <Link
            href="/snippets/discover"
            className="text-primary hover:underline text-xs font-black uppercase tracking-[0.2em]"
          >
            Browse Discover &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
