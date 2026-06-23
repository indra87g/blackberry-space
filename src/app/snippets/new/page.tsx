'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

export default function CreateSnippetPage() {
  const router = useRouter();
  const supabase = createClient();

  const createMutation = useMutation({
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
        throw new Error('You must be logged in to create a snippet.');
      }

      const { error: insertError } = await supabase
        .from('snippets')
        .insert({
          title,
          description,
          language,
          code,
          tags,
          credits,
          user_id: user.id,
          forkable,
        })
        .select()
        .single();

      if (insertError) throw insertError;
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
    createMutation.mutate(new FormData(e.currentTarget));
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

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2 uppercase tracking-[0.05em]">
          Create Snippet
        </h1>
        <p className="text-on-surface-variant text-lg">
          Share your code with the Blackberry Space community.
        </p>
      </div>

      {createMutation.isError && (
        <div className="mb-6 p-4 bg-[rgba(255,180,171,0.1)] border border-error text-error font-bold uppercase tracking-wider text-sm">
          {createMutation.error.message || 'An unexpected error occurred.'}
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
              defaultValue=""
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
              placeholder="Original author or source link"
              className="input-default w-full px-4 py-3"
            />
          </div>

          <div className="space-y-2 md:col-span-2 flex items-center gap-3">
            <input
              type="checkbox"
              name="forkable"
              id="forkable"
              defaultChecked
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

        <div className="pt-4 flex items-center justify-end">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 btn-primary px-8 py-3 text-sm uppercase tracking-wider disabled:opacity-50 disabled:pointer-events-none"
          >
            {createMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            Publish Snippet
          </button>
        </div>
      </form>
    </div>
  );
}
