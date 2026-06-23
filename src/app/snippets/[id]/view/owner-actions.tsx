'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Github, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import type { SnippetWithProfile } from '@/lib/types';
import { useMutation } from '@tanstack/react-query';

export function OwnerActions({ snippet }: { snippet: SnippetWithProfile }) {
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || user.id !== snippet.user_id) throw new Error('Unauthorized');

      const { error } = await supabase
        .from('snippets')
        .delete()
        .eq('id', snippet.id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      router.push('/');
      router.refresh();
    },
    onError: (err) => {
      console.error('Failed to delete snippet:', err);
      alert('Failed to delete snippet. Please try again.');
    },
  });

  const handleDelete = () => {
    if (deleteMutation.isPending) return;
    if (
      window.confirm('Are you sure you want to delete this snippet? This action cannot be undone.')
    ) {
      deleteMutation.mutate();
    }
  };

  const handleUploadGist = async () => {
    const token = window.prompt(
      'Enter your GitHub Personal Access Token (with "gist" scope):\n\nThis token is only used once in your browser to upload the code to GitHub Gist and is not saved anywhere.',
    );

    if (!token) return;

    setIsUploading(true);
    try {
      const filename = `snippet.${snippet.language.toLowerCase() === 'javascript' ? 'js' : snippet.language.toLowerCase() === 'typescript' ? 'ts' : 'txt'}`;

      const res = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          description: snippet.title || 'Uploaded via Blackberry Space',
          public: true,
          files: {
            [filename]: { content: snippet.code },
          },
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || `HTTP ${res.status}`);
      }

      window.prompt('Gist successfully created! Here is the URL:', data.html_url);
    } catch (err: any) {
      console.error('Failed to upload to gist:', err);
      alert(`Failed to upload to Gist: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-6 p-4 border border-[rgba(255,255,255,0.05)] bg-surface-container/50 rounded-none flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          Owner Actions
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleUploadGist}
          disabled={isUploading}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface border border-[rgba(255,255,255,0.05)]"
        >
          {isUploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Github className="w-3.5 h-3.5" />
          )}
          Upload to Gist
        </button>
        <Link
          href={`/snippets/${snippet.id}/edit`}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface border border-[rgba(255,255,255,0.05)]"
        >
          <Edit className="w-3.5 h-3.5" />
          Edit
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-surface-container hover:bg-error/20 transition-colors text-error border border-[rgba(255,255,255,0.05)] ${deleteMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {deleteMutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          Delete
        </button>
      </div>
    </div>
  );
}
