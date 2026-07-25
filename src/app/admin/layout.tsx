import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import type { ReactNode } from 'react';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('isAdmin')
    .eq('id', user.id)
    .single();

  if (!profile?.isAdmin) {
    redirect('/');
  }

  return <>{children}</>;
}
