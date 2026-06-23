'use client';

import { Heart, Share2, Check, GitFork, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { SnippetWithProfile } from '@/lib/types';
import { block } from 'million/react';
import { useMutation } from '@tanstack/react-query';

interface SnippetCardProps {
  snippet: SnippetWithProfile;
  currentUser: User | null;
  isLiked?: boolean;
}

const SnippetCardBlock = block(function SnippetCard({
  snippet,
  currentUser,
  isLiked = false,
}: SnippetCardProps) {
  const router = useRouter();
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(snippet.likes_count || 0);
  const [shared, setShared] = useState(false);

  const supabase = createClient();

  const handleShare = async () => {
    const url = `${window.location.origin}/snippets/${snippet.id}/view`;
    await navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const forkMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) return;
      const { data, error } = await supabase
        .from('snippets')
        .insert({
          title: `Fork of ${snippet.title}`,
          description: snippet.description,
          language: snippet.language,
          code: snippet.code,
          tags: snippet.tags,
          credits: `Forked from @${snippet.profiles?.username || 'unknown'}`,
          user_id: currentUser.id,
          forkable: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        router.push(`/snippets/${data.id}/view`);
        router.refresh();
      }
    },
    onError: (err) => {
      console.error('Failed to fork snippet:', err);
      alert('Failed to fork snippet. Please try again.');
    },
  });

  const handleFork = () => {
    if (!currentUser || forkMutation.isPending) return;
    forkMutation.mutate();
  };

  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) return;

      const nextLiked = !localLiked;

      const { error } = nextLiked
        ? await supabase.from('likes').insert({ snippet_id: snippet.id, user_id: currentUser.id })
        : await supabase
            .from('likes')
            .delete()
            .eq('snippet_id', snippet.id)
            .eq('user_id', currentUser.id);

      if (error) throw error;
      return nextLiked;
    },
    onMutate: async () => {
      const nextLiked = !localLiked;
      const nextCount = localLikesCount + (nextLiked ? 1 : -1);

      setLocalLiked(nextLiked);
      setLocalLikesCount(nextCount);

      return { prevLiked: localLiked, prevCount: localLikesCount };
    },
    onError: (err, _variables, context) => {
      if (context) {
        setLocalLiked(context.prevLiked);
        setLocalLikesCount(context.prevCount);
      }
      console.error('Failed to toggle like:', err);
    },
  });

  const handleLike = () => {
    if (!currentUser || toggleLikeMutation.isPending) return;
    toggleLikeMutation.mutate();
  };

  const canFork = snippet.forkable && currentUser && currentUser.id !== snippet.user_id;

  return (
    <div className="card-container overflow-hidden flex flex-col group">
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-on-surface tracking-tight">{snippet.title}</h3>
            {snippet.description && (
              <p className="text-sm text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                {snippet.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            {canFork && (
              <button
                type="button"
                onClick={handleFork}
                disabled={forkMutation.isPending}
                className="p-2 transition-all hover:bg-[rgba(255,255,255,0.05)] text-outline hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                title="Fork snippet"
                aria-label="Fork snippet"
              >
                {forkMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <GitFork className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="p-2 transition-all hover:bg-[rgba(255,255,255,0.05)] text-outline hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title="Share snippet"
              aria-label="Share snippet link"
            >
              {shared ? (
                <Check className="w-5 h-5 text-primary" aria-hidden="true" />
              ) : (
                <Share2 className="w-5 h-5" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={handleLike}
              disabled={!currentUser || toggleLikeMutation.isPending}
              className={`p-2 flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${!currentUser ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[rgba(255,255,255,0.05)] active:scale-95'} ${toggleLikeMutation.isPending ? 'opacity-60 cursor-wait' : ''}`}
              title={
                !currentUser ? 'Login to like' : localLiked ? 'Unlike snippet' : 'Like snippet'
              }
              aria-label={localLiked ? 'Unlike snippet' : 'Like snippet'}
            >
              <Heart
                className={`w-5 h-5 ${localLiked ? 'fill-primary text-primary' : 'text-outline'}`}
                aria-hidden="true"
              />
              {localLikesCount > 0 && (
                <span
                  className={`text-sm font-bold ${localLiked ? 'text-primary' : 'text-on-surface-variant'}`}
                >
                  {localLikesCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 bg-surface-container-high text-on-surface text-xs font-mono font-bold uppercase tracking-wider border border-[rgba(255,255,255,0.1)]">
            {snippet.language}
          </span>
          {snippet.tags?.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-[rgba(107,251,154,0.1)] text-primary border border-primary text-xs font-bold uppercase tracking-wider"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 bg-background border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-surface-container overflow-hidden border border-[rgba(255,255,255,0.1)]">
            {snippet.profiles?.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={snippet.profiles.avatar_url}
                alt="avatar"
                width={24}
                height={24}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <span className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">
            {snippet.profiles?.full_name || snippet.profiles?.username || 'Unknown Developer'}
          </span>
        </div>

        <span className="text-xs text-outline uppercase tracking-wider">
          {snippet.created_at
            ? formatDistanceToNow(new Date(snippet.created_at), { addSuffix: true })
            : 'recently'}
        </span>
      </div>
    </div>
  );
});

export const SnippetCard = SnippetCardBlock as any;
