import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// In production (HTTPS, e.g. embedded in AI Studio) cookies need SameSite=None+Secure
// to work inside an iframe. Over plain HTTP in local dev the browser rejects such cookies,
// which silently breaks login — so fall back to Lax + insecure there.
const isProd = process.env.NODE_ENV === 'production';

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export const createClient = () => {
  if (client) return client;

  client = createBrowserClient<Database>(supabaseUrl!, supabaseKey!, {
    cookieOptions: {
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
    },
  });

  return client;
};
