'use client';

import Link from 'next/link';
import { Copy, Check, Heart, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Snippet {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
  tags: string[];
  credits: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
    username: string;
  }
}

interface SnippetCardProps {
  snippet: Snippet;
  currentUser: any;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string, currentlyFavorited: boolean) => void;
}

export function SnippetCard({ snippet, currentUser, isFavorited = false, onToggleFavorite }: SnippetCardProps) {
  const [copied, setCopied] = useState(false);
  const [localFavorited, setLocalFavorited] = useState(isFavorited);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [htmlCode, setHtmlCode] = useState<string>('');

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function highlightCode() {
      try {
        // ⚡ Bolt Optimization: Dynamically import shiki to reduce initial JS bundle size
        // Since shiki is heavy and only needed on the client, fetching it only when
        // the component mounts significantly improves initial page load performance.
        const { codeToHtml } = await import('shiki');
        const html = await codeToHtml(snippet.code, {
          lang: snippet.language,
          theme: 'dark-plus',
        });
        setHtmlCode(html);
      } catch (err) {
        console.error('Error highlighting code with shiki:', err);
        // Fallback to plain text if language is unsupported or error occurs
        setHtmlCode(`<pre class="shiki dark-plus" style="background-color:#1E1E1E;color:#D4D4D4;" tabindex="0"><code>${snippet.code}</code></pre>`);
      }
    }
    highlightCode();
  }, [snippet.code, snippet.language]);

  const handleDelete = async () => {
    if (isDeleting || !currentUser || currentUser.id !== snippet.user_id) return;

    if (window.confirm('Are you sure you want to delete this snippet? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        const { error } = await supabase.from('snippets').delete().eq('id', snippet.id);
        if (error) throw error;
        router.refresh();
      } catch (err) {
        console.error('Failed to delete snippet:', err);
        alert('Failed to delete snippet. Please try again.');
        setIsDeleting(false);
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFavorite = async () => {
    if (!currentUser || isToggling) return;

    const next = !localFavorited;
    setIsToggling(true);
    setLocalFavorited(next);
    if (onToggleFavorite) onToggleFavorite(snippet.id, localFavorited);

    try {
      const { error } = next
        ? await supabase.from('favorites').insert({ snippet_id: snippet.id, user_id: currentUser.id })
        : await supabase.from('favorites').delete().eq('snippet_id', snippet.id).eq('user_id', currentUser.id);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      setLocalFavorited(!next);
      if (onToggleFavorite) onToggleFavorite(snippet.id, next);
      console.error('Failed to toggle favorite:', err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col group">
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">
              {snippet.title}
            </h3>
            {snippet.description && (
              <p className="text-sm text-neutral-400 mt-1 line-clamp-2">{snippet.description}</p>
            )}
          </div>

          <div className="flex items-center gap-1">
            {currentUser && currentUser.id === snippet.user_id && (
              <>
                <Link
                  href={`/snippets/${snippet.id}/edit`}
                  className="p-2 rounded-xl transition-all hover:bg-neutral-800 text-neutral-500 hover:text-white"
                  title="Edit snippet"
                >
                  <Edit className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`p-2 rounded-xl transition-all hover:bg-neutral-800 text-neutral-500 hover:text-red-500 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Delete snippet"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={handleFavorite}
              disabled={!currentUser || isToggling}
              className={`p-2 rounded-xl transition-all ${!currentUser ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-800 active:scale-95'} ${isToggling ? 'opacity-60 cursor-wait' : ''}`}
              title={!currentUser ? "Login to favorite" : localFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`w-5 h-5 ${localFavorited ? 'fill-red-500 text-red-500' : 'text-neutral-500'}`} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-300 text-xs font-mono font-medium">
            {snippet.language}
          </span>
          {snippet.tags && snippet.tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 rounded-md bg-red-950/30 text-red-400 border border-red-900/30 text-xs font-medium">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="relative border-t border-neutral-800 flex-1 flex flex-col">
          <div className="absolute top-3 right-3 z-10 flex gap-2">
            <button
               onClick={handleCopy}
               className="p-1.5 rounded-lg bg-neutral-800/80 text-neutral-300 hover:text-white hover:bg-neutral-700 backdrop-blur-sm transition-all"
               title="Copy Code"
             >
               {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
             </button>
          </div>
         <div className="max-h-[300px] overflow-auto flex-1 font-mono text-sm leading-relaxed custom-scrollbar bg-[#1E1E1E]">
           {htmlCode ? (
             <div
               dangerouslySetInnerHTML={{ __html: htmlCode }}
               className="[&>pre]:!bg-transparent [&>pre]:!p-4 [&>pre]:!m-0 [&>pre]:!text-[0.875rem]"
             />
           ) : (
             <pre className="p-4 text-neutral-400 animate-pulse">Loading code...</pre>
           )}
         </div>
      </div>

       <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-neutral-800 overflow-hidden border border-neutral-700">
                {snippet.profiles?.avatar_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={snippet.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                )}
              </div>
              <span className="text-sm text-neutral-400">
                {snippet.profiles?.full_name || snippet.profiles?.username || 'Unknown Developer'}
              </span>
           </div>
           
           <span className="text-xs text-neutral-500">
              {formatDistanceToNow(new Date(snippet.created_at), { addSuffix: true })}
           </span>
       </div>
    </div>
  );
}
