'use client';

import Link from 'next/link';
import {
  Home,
  PlusSquare,
  CodeSquare,
  Menu,
  X,
  LogIn,
  LogOut,
  Compass,
  FileCode2,
  Swords,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';

export function Navbar({ initialUser = null }: { initialUser?: User | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSnippetsOpen, setIsSnippetsOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<Profile | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Initial user is provided by the server (layout). Only subscribe to auth
    // changes here so login/logout stay reactive without an extra getUser() call.
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => authListener.subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      } else {
        setProfile(null);
      }
    }
    fetchProfile();
  }, [user, supabase]);

  // Handle body scroll locking when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    // Cleanup function
    return () => document.body.classList.remove('overflow-hidden');
  }, [isOpen]);

  // Close mobile menu on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const menus = [
    { name: 'Home', href: 'https://blackberryhazard.pages.dev', icon: Home, external: true },
    { name: 'Challenges', href: '/coming-soon', icon: Swords },
  ];

  if (profile?.isAdmin) {
    menus.push({ name: 'Admin', href: '/admin', icon: ShieldCheck });
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)] px-4 md:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary flex items-center justify-center group-hover:brightness-110 transition-all">
            <CodeSquare className="w-4 h-4 text-on-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight text-on-surface group-hover:text-primary transition-colors uppercase tracking-[0.05em]">
            Blackberry
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 font-bold text-sm uppercase tracking-wider">
          {menus.map((item) => {
            const isActive =
              !item.external &&
              ((item.name === 'Discover' && pathname === '/') ||
                (item.name !== 'Discover' && pathname === item.href));

            const linkClasses = `transition-colors flex items-center gap-2 ${
              isActive ? 'text-primary' : 'text-on-surface hover:text-primary'
            }`;

            if (item.external) {
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClasses}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </a>
              );
            }
            return (
              <Link key={item.name} href={item.href} className={linkClasses}>
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="flex items-center gap-6">
                {profile && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container border border-[rgba(255,255,255,0.05)] rounded-full">
                    <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
                    <span className="text-sm font-bold text-on-surface uppercase tracking-wider">
                      {profile.thorium} Thorium
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        user.user_metadata.avatar_url || 'https://picsum.photos/seed/picsum/200/200'
                      }
                      width={32}
                      height={32}
                      decoding="async"
                      className="w-8 h-8 bg-surface-container border border-[rgba(255,255,255,0.1)]"
                      alt="Avatar"
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-on-surface hover:text-error transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 btn-primary px-4 py-2 text-xs uppercase tracking-wider"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="block md:hidden p-2 text-on-surface hover:text-on-surface transition-colors"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 bg-background/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Mobile Half-Sidebar */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-[65%] sm:w-[50%] bg-background border-l border-[rgba(255,255,255,0.05)] shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-4 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center bg-surface-container">
          <span className="font-bold text-on-surface-variant text-xs tracking-wider uppercase">
            Menu
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-on-surface hover:text-on-surface transition-colors"
            aria-label="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 flex-1 space-y-2 overflow-y-auto">
          {/* Mobile Snippets Submenu */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setIsSnippetsOpen(!isSnippetsOpen)}
              className="w-full px-3 py-2 text-xs font-bold text-on-surface-variant hover:text-on-surface uppercase tracking-wider flex items-center justify-between transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4" />
                Snippets
              </div>
              {isSnippetsOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {isSnippetsOpen && (
              <div className="flex flex-col animate-in slide-in-from-top-2 fade-in duration-200">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 pl-8 transition-colors text-sm uppercase tracking-wider font-bold ${pathname === '/' ? 'bg-surface-container-high text-primary border border-primary' : 'text-on-surface active:bg-surface-container hover:text-primary'}`}
                >
                  <Compass className="w-5 h-5" />
                  Discover
                </Link>
                <Link
                  href="/snippets/new"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 pl-8 transition-colors text-sm uppercase tracking-wider font-bold ${pathname === '/snippets/new' ? 'bg-surface-container-high text-primary border border-primary' : 'text-on-surface active:bg-surface-container hover:text-primary'}`}
                >
                  <PlusSquare className="w-5 h-5" />
                  Create
                </Link>
              </div>
            )}
          </div>

          {menus.map((item) => {
            const isActive =
              !item.external &&
              ((item.name === 'Discover' && pathname === '/') ||
                (item.name !== 'Discover' && pathname === item.href));

            const linkClasses = `flex items-center gap-3 px-3 py-3 transition-colors text-sm uppercase tracking-wider font-bold ${
              isActive
                ? 'bg-surface-container-high text-primary border border-primary'
                : 'text-on-surface active:bg-surface-container hover:text-primary'
            }`;

            if (item.external) {
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClasses}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </a>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={linkClasses}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[rgba(255,255,255,0.05)] bg-surface-container">
          {user ? (
            <div className="flex flex-col gap-4">
              {profile && (
                <div className="flex items-center gap-2 px-3 py-3 bg-background border border-[rgba(255,255,255,0.05)]">
                  <Zap className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-sm font-bold text-on-surface uppercase tracking-wider">
                    {profile.thorium} Thorium
                  </span>
                </div>
              )}
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-2 active:bg-surface-container-high transition-colors group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.user_metadata.avatar_url || 'https://picsum.photos/seed/picsum/200/200'}
                  alt="Avatar"
                  width={40}
                  height={40}
                  decoding="async"
                  className="w-10 h-10 bg-surface-container border border-[rgba(255,255,255,0.1)]"
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold text-on-surface group-hover:text-primary truncate uppercase tracking-wider">
                    {user.user_metadata.full_name || user.email}
                  </span>
                  <span className="text-xs text-on-surface-variant uppercase tracking-wider truncate">
                    {user.user_metadata.user_name || 'Developer'}
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full bg-background active:bg-surface-container-high text-error py-3 transition-colors text-sm font-bold uppercase tracking-wider border border-[rgba(255,255,255,0.05)]"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full btn-primary py-3 text-sm uppercase tracking-wider"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
