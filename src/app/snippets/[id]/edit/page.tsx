'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';

export default function EditSnippetPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const supabase = createClient();
  const resolvedParams = use(params);

  const {
    data: snippet,
    isLoading: loading,
    error: fetchError,
  } = useQuery({
    queryKey: ['snippet', resolvedParams.id],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return null;
      }

      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (error) throw error;

      if (data.user_id !== user.id) {
        router.push('/');
        return null;
      }

      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const language = formData.get('language') as string;
      const code = formData.get('code') as string;
      const tagsString = formData.get('tags') as string;
      const credits = formData.get('credits') as string;
      const forkable = formData.get('forkable') === 'on';

      const tags = tagsString
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to edit this snippet.');
      }

      const { error: updateError } = await supabase
        .from('snippets')
        .update({
          title,
          description,
          language,
          code,
          tags,
          credits,
          forkable,
        })
        .eq('id', resolvedParams.id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      router.push('/');
      router.refresh();
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateMutation.mutate(new FormData(e.currentTarget));
  };

  const languages = [
    'javascript',
    'typescript',
    'python',
    'html',
    'css',
    'go',
    'rust',
    'java',
    'c++',
    'c',
    'c#',
    'php',
    'ruby',
    'swift',
    'kotlin',
    'sql',
    'bash',
    'json',
    'yaml',
    'markdown',
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-outline" />
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="text-center text-error py-20">
        {fetchError
          ? (fetchError as Error).message
          : 'Snippet not found or you do not have permission to edit it.'}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2 uppercase tracking-[0.05em]">
          Edit Snippet
        </h1>
        <p className="text-on-surface-variant text-lg">Update your shared code.</p>
      </div>

      {(updateMutation.isError || fetchError) && (
        <div className="mb-6 p-4 bg-[rgba(255,180,171,0.1)] border border-error text-error font-bold uppercase tracking-wider text-sm">
          {updateMutation.isError ? updateMutation.error.message : (fetchError as Error).message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="title"
              className="block text-sm font-bold text-on-surface uppercase tracking-wider"
            >
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              defaultValue={snippet.title}
              placeholder="e.g. React custom hook for responsive check"
              className="input-default w-full px-4 py-3"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-bold text-on-surface uppercase tracking-wider"
            >
              Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              defaultValue={snippet.description || ''}
              placeholder="Briefly explain what this code does..."
              className="input-default w-full px-4 py-3 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="language"
              className="block text-sm font-bold text-on-surface uppercase tracking-wider"
            >
              Language
            </label>
            <select
              name="language"
              id="language"
              required
              defaultValue={snippet.language}
              className="input-default w-full px-4 py-3 appearance-none"
            >
              <option value="" disabled>
                Select language...
              </option>
              {languages.sort().map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="tags"
              className="block text-sm font-bold text-on-surface uppercase tracking-wider"
            >
              Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              id="tags"
              defaultValue={(snippet.tags || []).join(', ')}
              placeholder="react, hooks, ui"
              className="input-default w-full px-4 py-3"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="code"
              className="block text-sm font-bold text-on-surface uppercase tracking-wider"
            >
              Code
            </label>
            <textarea
              name="code"
              id="code"
              required
              rows={10}
              defaultValue={snippet.code}
              placeholder="Paste your code here..."
              className="input-default w-full px-4 py-3 font-mono text-sm leading-relaxed"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="credits"
              className="block text-sm font-bold text-on-surface uppercase tracking-wider"
            >
              Credits (Optional)
            </label>
            <input
              type="text"
              name="credits"
              id="credits"
              defaultValue={snippet.credits || ''}
              placeholder="Original author or source link"
              className="input-default w-full px-4 py-3"
            />
          </div>

          <div className="space-y-2 md:col-span-2 flex items-center gap-3">
            <input
              type="checkbox"
              name="forkable"
              id="forkable"
              defaultChecked={snippet.forkable}
              className="w-5 h-5 accent-primary bg-surface-container border-outline rounded focus:ring-primary focus:ring-offset-background"
            />
            <label
              htmlFor="forkable"
              className="text-sm font-bold text-on-surface uppercase tracking-wider cursor-pointer select-none"
            >
              Allow others to fork this snippet
            </label>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={updateMutation.isPending}
            className="px-6 py-3 font-bold text-on-surface hover:text-on-surface transition-colors uppercase tracking-wider text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 btn-primary px-8 py-3 text-sm uppercase tracking-wider disabled:opacity-50 disabled:pointer-events-none"
          >
            {updateMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
