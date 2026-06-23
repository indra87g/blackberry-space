'use client';

import { Heart, FileCode2, Clock } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import type { User } from '@supabase/supabase-js';
import type { SnippetWithProfile } from '@/lib/types';
import { block } from 'million/react';
import { useMutation } from '@tanstack/react-query';

interface SnippetCardProps {
  snippet: SnippetWithProfile;
  currentUser: User | null;
  isLiked?: boolean;
}

const SnippetCardCompactBlock = block(function SnippetCardCompact({
  snippet,
  currentUser,
  isLiked = false,
}: SnippetCardProps) {
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(snippet.likes_count || 0);

  const supabase = createClient();
  const router = useRouter();

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
      // Optimistic update
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

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser || toggleLikeMutation.isPending) return;
    toggleLikeMutation.mutate();
  };

  return (
    <div
      onClick={() => router.push(`/snippets/${snippet.id}/view`)}
      className="card-container overflow-hidden flex flex-col group transition-all cursor-pointer h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') router.push(`/snippets/${snippet.id}/view`);
      }}
    >
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors tracking-tight">
              {snippet.title}
            </h3>
            {snippet.description && (
              <p className="text-sm text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
                {snippet.description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleLike}
            disabled={!currentUser || toggleLikeMutation.isPending}
            className={`p-2 flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shrink-0 ${!currentUser ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[rgba(255,255,255,0.05)] active:scale-95'} ${toggleLikeMutation.isPending ? 'opacity-60 cursor-wait' : ''}`}
            title={!currentUser ? 'Login to like' : localLiked ? 'Unlike snippet' : 'Like snippet'}
            aria-label={localLiked ? 'Unlike snippet' : 'Like snippet'}
          >
            <Heart
              className={`w-5 h-5 ${localLiked ? 'fill-primary text-primary' : 'text-outline group-hover:text-on-surface'}`}
              aria-hidden="true"
            />
            {localLikesCount > 0 && (
              <span
                className={`text-sm font-bold ${localLiked ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'}`}
              >
                {localLikesCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap mt-auto pt-2">
          <span className="px-2.5 py-1 bg-surface-container-high text-on-surface text-xs font-mono font-bold flex items-center gap-1.5 uppercase tracking-wider border border-[rgba(255,255,255,0.1)]">
            <FileCode2 className="w-3.5 h-3.5" />
            {snippet.language}
          </span>
          {snippet.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-[rgba(107,251,154,0.1)] text-primary border border-primary text-xs font-bold uppercase tracking-wider"
            >
              #{tag}
            </span>
          ))}
          {snippet.tags && snippet.tags.length > 3 && (
            <span className="px-2 py-1 text-on-surface-variant text-xs font-bold uppercase tracking-wider">
              +{snippet.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-4 bg-background border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-surface-container overflow-hidden border border-[rgba(255,255,255,0.1)]">
            {snippet.profiles?.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={snippet.profiles.avatar_url}
                alt=""
                width={24}
                height={24}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <span className="text-sm font-bold text-on-surface-variant truncate max-w-[120px] uppercase tracking-wider">
            {snippet.profiles?.full_name || snippet.profiles?.username || 'Unknown Developer'}
          </span>
        </div>

        <span className="text-xs text-outline flex items-center gap-1.5 font-medium uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" />
          {snippet.created_at
            ? formatDistanceToNow(new Date(snippet.created_at), { addSuffix: true })
            : 'recently'}
        </span>
      </div>
    </div>
  );
});

export const SnippetCardCompact = SnippetCardCompactBlock as any;
