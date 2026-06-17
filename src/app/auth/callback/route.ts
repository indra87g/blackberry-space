import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/';

  // SECURITY FIX: Prevent Open Redirects
  // Ensure the 'next' parameter is a valid local path and not an absolute URL,
  // protocol-relative URL, or something that could break out of the redirect origin.
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    next = '/';
  }

  // Resolve absolute origin from headers or APP_URL since node server runs on localhost inside container
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';

  let redirectOrigin = origin;
  if (forwardedHost) {
    redirectOrigin = `${forwardedProto}://${forwardedHost}`;
  } else if (process.env.APP_URL) {
    redirectOrigin = process.env.APP_URL;
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${redirectOrigin}${next}`);
    }
    console.error('Auth code exchange error:', error);
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${redirectOrigin}/?error=auth-code-error`);
}
