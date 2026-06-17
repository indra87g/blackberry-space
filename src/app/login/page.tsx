'use client';

import { Github } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';

export default function LoginPage() {
  const supabase = createClient();
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);
  const [isLoadingDiscord, setIsLoadingDiscord] = useState(false);

  const handleGithubLogin = async () => {
    setIsLoadingGithub(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch (error) {
      console.error('Error logging in with GitHub:', error);
      setIsLoadingGithub(false);
    }
  };

  const handleDiscordLogin = async () => {
    setIsLoadingDiscord(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch (error) {
      console.error('Error logging in with Discord:', error);
      setIsLoadingDiscord(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12">
      <div className="w-full max-w-md bg-surface-container border border-[rgba(255,255,255,0.05)] p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-primary flex items-center justify-center mb-6">
          <span className="text-on-primary font-black text-2xl tracking-tighter">&lt;/&gt;</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2 uppercase tracking-[0.05em]">
          Welcome Back
        </h1>
        <p className="text-on-surface-variant mb-8 leading-relaxed">
          Sign in to access your snippets, save likes, and share code with the Blackberry Space
          community.
        </p>

        <div className="w-full flex flex-col gap-4">
          <button
            type="button"
            onClick={handleGithubLogin}
            disabled={isLoadingGithub || isLoadingDiscord}
            className={`w-full flex items-center justify-center gap-3 bg-surface-container-high border border-outline text-on-surface hover:bg-surface-container-highest transition-colors font-bold py-3.5 px-4 uppercase tracking-wider text-sm ${isLoadingGithub || isLoadingDiscord ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Github className="w-5 h-5" />
            {isLoadingGithub ? 'Connecting...' : 'Continue with GitHub'}
          </button>

          <button
            type="button"
            onClick={handleDiscordLogin}
            disabled={isLoadingGithub || isLoadingDiscord}
            className={`w-full flex items-center justify-center gap-3 bg-[#5865F2] text-white hover:bg-[#4752C4] transition-colors font-bold py-3.5 px-4 uppercase tracking-wider text-sm ${isLoadingGithub || isLoadingDiscord ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {/* Discord Icon SVG */}
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04-.02-.08-.06-.06c-.57.22-1.12.48-1.65.78c-.04.02-.05.08-.02.11c.11.08.23.16.34.25c.02.02.05.02.07.01c3.44-1.57 7.15-1.57 10.55-.01c.02.01.05.01.07-.01c.11-.09.23-.17.34-.25c.03-.02.02-.09-.02-.11c-.53-.3-1.08-.56-1.65-.78c-.04-.01-.06-.06-.04-.09c.31-.61.67-1.2 1.07-1.74c.02-.02.05-.03.08-.02c1.71.53 3.44 1.33 5.24 2.65c.02.01.04 0 .04-.02c.4-4.13-.5-8.15-3.1-11.95c-.01-.01-.02-.02-.03-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z" />
            </svg>
            {isLoadingDiscord ? 'Connecting...' : 'Continue with Discord'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.05)] w-full">
          <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">
            Guest access is no longer permitted
          </p>
        </div>
      </div>
    </div>
  );
}
